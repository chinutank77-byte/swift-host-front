"use client";

import { createContext, useContext, useEffect, useReducer, useCallback, useRef, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { createInboxes, fetchInboxes, fetchInboxMessages, deleteInboxes, getStreamUrl, reactivateInbox as apiReactivateInbox } from "@/lib/emailService";
import { generateUsername } from "@/lib/utils";
import { useSpamGuard } from "@/hooks/useSpamGuard";
import DOMAINS from "@/data/domains.json";

const MAX_SAVED_INBOXES = 25;

function mapApiMessage(msg) {
  let date = msg.received_at;
  if (date && typeof date === "string" && !date.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(date)) {
    date += "Z";
  }
  return {
    id: msg.id,
    from: { name: "", address: msg.sender || "" },
    to: { name: "", address: "" },
    subject: msg.subject || "",
    date: date,
    bodyText: msg.body || "",
    bodyHtml: msg.body_html || "",
    otp: msg.otp || null,
    attachments: msg.attachments || [],
    isRead: false,
  };
}

const initialState = {
  activeInbox: null,
  savedInboxes: [],
  emails: [],
  streamUrl: null,
  loading: false,
  switching: false,
  error: null,
  booted: false,
};

function normaliseInbox(ib) {
  let email = ib.email || ib.address || "";
  if (email.includes("@hometown.online")) {
    email = email.replace("@hometown.online", "@homettown.online");
  }
  let domain = ib.domain;
  if (domain === "hometown.online") {
    domain = "homettown.online";
  }

  let expiresAt = ib.expiresAt || ib.expires_at;
  let createdAt = ib.createdAt || ib.created_at;

  if (expiresAt && typeof expiresAt === "string" && !expiresAt.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(expiresAt)) {
    expiresAt += "Z";
  }
  if (createdAt && typeof createdAt === "string" && !createdAt.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(createdAt)) {
    createdAt += "Z";
  }

  const expiryTimestamp = expiresAt ? new Date(expiresAt).getTime() : 0;

  return { 
    ...ib, 
    domain, 
    username: ib.username || email.split("@")[0], 
    address: email, 
    email,
    expiresAt,
    expires_at: expiresAt,
    createdAt,
    created_at: createdAt,
    expiryTimestamp
  };
}

function persistInboxes(inboxes) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("swiftmail-saved-inboxes", JSON.stringify(inboxes));
  } catch {}
}

function loadStoredInboxes() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("swiftmail-saved-inboxes") || "null");
  } catch {
    return null;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "BOOT": {
      const inboxes = action.inboxes.map(normaliseInbox);
      persistInboxes(inboxes);
      return { ...state, activeInbox: action.activeInbox ? normaliseInbox(action.activeInbox) : null, savedInboxes: inboxes, streamUrl: action.streamUrl, booted: true, loading: false };
    }

    case "SET_LOADING":
      return { ...state, loading: true, error: null };

    case "SET_ERROR":
      return { ...state, loading: false, error: action.error };

    case "SET_EMAILS":
      return { ...state, emails: action.emails, loading: false };

    case "SET_INBOXES": {
      const inboxes = action.inboxes.map(normaliseInbox);
      persistInboxes(inboxes);
      return { ...state, savedInboxes: inboxes, activeInbox: inboxes.length > 0 ? (state.activeInbox && inboxes.find((ib) => ib.id === state.activeInbox.id) ? state.activeInbox : inboxes[0]) : null, booted: true };
    }

    case "SET_ACTIVE": {
      return { ...state, activeInbox: action.inbox, streamUrl: action.streamUrl, emails: action.emails || [], switching: action.switching !== undefined ? action.switching : false, loading: false };
    }

    case "ADD_INBOXES": {
      const updated = [...action.inboxes, ...state.savedInboxes].slice(0, MAX_SAVED_INBOXES);
      persistInboxes(updated);
      return { ...state, savedInboxes: updated, activeInbox: action.inboxes[0] || state.activeInbox, streamUrl: action.streamUrl, booted: true, loading: false };
    }

    case "DELETE_INBOX": {
      const filtered = state.savedInboxes.filter((ib) => ib.id !== action.id);
      persistInboxes(filtered);
      return { ...state, savedInboxes: filtered, activeInbox: state.activeInbox?.id === action.id ? (filtered[0] || null) : state.activeInbox };
    }

    case "DELETE_EMAIL":
      return { ...state, emails: state.emails.filter((e) => e.id !== action.id) };

    case "UPDATE_INBOX": {
      const updated = state.savedInboxes.map((ib) =>
        ib.id === action.inbox.id ? normaliseInbox(action.inbox) : ib
      );
      persistInboxes(updated);
      return {
        ...state,
        savedInboxes: updated,
        activeInbox: state.activeInbox?.id === action.inbox.id ? normaliseInbox(action.inbox) : state.activeInbox
      };
    }

    case "APPEND_EMAILS": {
      const existingIds = new Set(state.emails.map((e) => e.id));
      const newEmails = action.emails.filter((e) => !existingIds.has(e.id));
      if (newEmails.length === 0) return state;
      return { ...state, emails: [...newEmails, ...state.emails] };
    }

    default:
      return state;
  }
}

const InboxContext = createContext(null);

export function InboxProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const apiKey = user?.apiKey;
  const plan = user?.plan ?? null;
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { record: recordDelete, isSpamming: deleteSpamming, reset: resetDeleteGuard } = useSpamGuard({ threshold: 3, windowMs: 60_000 });

  useEffect(() => {
    async function boot() {
      const stored = loadStoredInboxes();
      if (stored && stored.length > 0) {
        dispatch({
          type: "BOOT",
          activeInbox: stored[0],
          inboxes: stored,
          streamUrl: getStreamUrl(stored[0].email || stored[0].address),
        });
      } else {
        dispatch({ type: "BOOT", activeInbox: null, inboxes: [], streamUrl: null });
      }
    }
    boot();
  }, []);

  useEffect(() => {
    if (!apiKey) return;
    fetchInboxes(apiKey, plan)
      .then((data) => {
        if (data?.inboxes?.length > 0) {
          const mapped = data.inboxes.map((ib) => ({
            id: ib.id,
            email: ib.email,
            domain: ib.domain,
            address: ib.email,
            username: ib.email.split("@")[0],
            encrypted: ib.encrypted,
            active: ib.active,
            expiresAt: ib.expires_at,
            expires_at: ib.expires_at,
            createdAt: ib.created_at,
            created_at: ib.created_at,
            unreadCount: 0,
          }));
          dispatch({ type: "SET_INBOXES", inboxes: mapped });
        }
      })
      .catch(() => {});
  }, [apiKey]);

  // Connect to SSE stream (email-stream) with exponential-backoff retry
  useEffect(() => {
    if (!state.activeInbox || !apiKey) return;
    const email = state.activeInbox.email || state.activeInbox.address;
    if (!email) return;

    let eventSource = null;
    let retryTimer = null;
    let pollTimer = null;
    let inflight = false;
    let retryDelay = 1000;
    const MAX_RETRY_DELAY = 30_000;
    const POLL_INTERVAL = 5000;
    let mounted = true;

    const pollOnce = async () => {
      if (inflight || !mounted) return;
      inflight = true;
      try {
        const data = await fetchInboxMessages(apiKey, email, plan);
        if (!mounted) return;
        const mapped = (data?.messages || []).map(mapApiMessage);
        dispatch({ type: "APPEND_EMAILS", emails: mapped });
      } catch {
        // ignore
      } finally {
        inflight = false;
      }
    };

    const startPolling = () => {
      if (pollTimer) return;
      pollOnce();
      pollTimer = setInterval(() => {
        pollOnce();
      }, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const connectSSE = () => {
      stopPolling();
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      try {
        const streamUrl = getStreamUrl(email);
        const eventSourceUrl = `${streamUrl}?api_key=${apiKey || ""}&x-api-key=${apiKey || ""}`;
        eventSource = new EventSource(eventSourceUrl);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.error === "inbox expired") {
              eventSource?.close();
              return;
            }
            if (data && data.id) {
              const mapped = mapApiMessage(data);
              dispatch({ type: "APPEND_EMAILS", emails: [mapped] });
            }
          } catch (e) {
            console.error("Error parsing stream message:", e);
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();
          eventSource = null;
          if (!mounted) return;

          startPolling();
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
            connectSSE();
          }, retryDelay);
        };

        eventSource.onopen = () => {
          retryDelay = 1000;
        };
      } catch (e) {
        console.error("Failed to initialize EventSource:", e);
        if (!mounted) return;
        startPolling();
        retryTimer = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
          connectSSE();
        }, retryDelay);
      }
    };

    connectSSE();

    return () => {
      mounted = false;
      if (eventSource) eventSource.close();
      stopPolling();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [apiKey, plan, state.activeInbox?.id]);

  const generateNewInbox = useCallback(async (domain, username, type) => {
    dispatch({ type: "SET_LOADING" });

    try {
      const options = { count: 1 };
      if (domain) options.domain = domain;
      if (username) options.username = username;
      else options.username_length = 8;
      if (type) options.type = type;

      const data = await createInboxes(apiKey, options, plan);
      if (data?.inboxes?.length > 0) {
        const inboxes = data.inboxes.map((ib) => normaliseInbox({
          id: ib.id,
          email: ib.email,
          domain: ib.domain,
          address: ib.email,
          username: ib.email.split("@")[0],
          encrypted: ib.encrypted,
          expiresAt: ib.expires_at,
          expires_at: ib.expires_at,
          createdAt: ib.created_at,
          created_at: ib.created_at,
          unreadCount: 0,
        }));
        dispatch({ type: "ADD_INBOXES", inboxes, streamUrl: getStreamUrl(inboxes[0].email) });
      }
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err.message });
    }
  }, [apiKey, plan]);

  const switchInbox = useCallback(async (id) => {
    const inbox = state.savedInboxes.find((ib) => ib.id === id);
    if (!inbox) return;

    const email = inbox.email || inbox.address;
    dispatch({
      type: "SET_ACTIVE",
      inbox,
      streamUrl: getStreamUrl(email),
      emails: [],
      switching: true,
    });

    if (!apiKey) return;

    try {
      const data = await fetchInboxMessages(apiKey, email, plan);
      const mapped = (data?.messages || []).map(mapApiMessage);
      dispatch({ type: "SET_ACTIVE", inbox, streamUrl: getStreamUrl(email), emails: mapped, switching: false });
    } catch {
      dispatch({ type: "SET_ACTIVE", inbox, streamUrl: getStreamUrl(email), emails: [], switching: false });
    }
  }, [apiKey, plan, state.savedInboxes]);

  const refreshEmails = useCallback(async () => {
    if (!apiKey || !state.activeInbox) return;
    const email = state.activeInbox.email || state.activeInbox.address;
    if (!email) return;

    try {
      const data = await fetchInboxMessages(apiKey, email, plan);
      const mapped = (data?.messages || []).map(mapApiMessage);
      dispatch({ type: "SET_EMAILS", emails: mapped });
    } catch {}
  }, [apiKey, plan, state.activeInbox]);

  const deleteInbox = useCallback(async (id) => {
    const inbox = state.savedInboxes.find((ib) => ib.id === id);
    if (!inbox) return;

    recordDelete();
    if (deleteSpamming) {
      // queue the delete — user must verify Turnstile first
      setPendingDeleteId(id);
      return;
    }

    dispatch({ type: "DELETE_INBOX", id });

    if (!apiKey) return;
    try {
      await deleteInboxes(apiKey, { emails: [inbox.email || inbox.address] }, plan);
    } catch {
      toast.error("Failed to delete inbox from server");
    }
  }, [apiKey, plan, state.savedInboxes, recordDelete, deleteSpamming]);

  const deleteAllInboxes = useCallback(async () => {
    const emails = state.savedInboxes.map((ib) => ib.email || ib.address);
    dispatch({ type: "SET_INBOXES", inboxes: [] });

    if (!apiKey || emails.length === 0) return;
    try {
      await deleteInboxes(apiKey, { emails }, plan);
    } catch {}
  }, [apiKey, plan, state.savedInboxes]);

  // called by InboxSwitcher after Turnstile verification on delete spam
  const resolveTurnstile = useCallback(async (_token) => {
    // TODO: pass _token to backend once endpoint supports cf_turnstile_token
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    resetDeleteGuard();

    const inbox = state.savedInboxes.find((ib) => ib.id === id);
    if (!inbox) return;
    dispatch({ type: "DELETE_INBOX", id });
    if (!apiKey) return;
    try {
      await deleteInboxes(apiKey, { emails: [inbox.email || inbox.address] }, plan);
    } catch {
      toast.error("Failed to delete inbox from server");
    }
  }, [apiKey, plan, pendingDeleteId, resetDeleteGuard, state.savedInboxes]);

  const deleteEmailFromList = useCallback((id) => {
    dispatch({ type: "DELETE_EMAIL", id });
  }, []);

  const reactivateInbox = useCallback(async (id) => {
    const inbox = state.savedInboxes.find((ib) => ib.id === id);
    if (!inbox) return;

    try {
      const email = inbox.email || inbox.address;
      const res = await apiReactivateInbox(apiKey, email, plan);

      let newExpiresAt = res?.expires_at || res?.expiresAt || res?.inbox?.expires_at || res?.inbox?.expiresAt;

      if (!newExpiresAt) {
        // Backend didn't return new expiry — refetch the inbox to get authoritative data
        try {
          const freshData = await fetchInboxes(apiKey, plan);
          const fresh = freshData?.inboxes?.find((ib) => (ib.email || ib.address) === email);
          newExpiresAt = fresh?.expires_at || fresh?.expiresAt;
        } catch {
          // If refetch also fails, show error and bail rather than guessing
          toast.error("Reactivated but couldn't retrieve new expiry — please refresh.");
          return;
        }
      }

      if (!newExpiresAt) {
        toast.error("Reactivated but couldn't retrieve new expiry — please refresh.");
        return;
      }

      const updatedInbox = {
        ...inbox,
        expiresAt: newExpiresAt,
        expires_at: newExpiresAt,
        expiryTimestamp: new Date(newExpiresAt).getTime(),
        active: true,
      };

      dispatch({ type: "UPDATE_INBOX", inbox: updatedInbox });
      toast.success("Inbox reactivated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to reactivate inbox");
    }
  }, [apiKey, plan, state.savedInboxes]);

  const contextValue = useMemo(() => ({
    activeInbox: state.activeInbox,
    savedInboxes: state.savedInboxes,
    emails: state.emails,
    streamUrl: state.streamUrl,
    loading: state.loading,
    switching: state.switching,
    error: state.error,
    ready: state.booted,
    generateNewInbox,
    switchInbox,
    deleteInbox,
    deleteAllInboxes,
    refreshEmails,
    deleteEmailFromList,
    deleteSpamming,
    pendingDeleteId,
    resolveTurnstile,
    reactivateInbox,
  }), [
    state.activeInbox, state.savedInboxes, state.emails, state.streamUrl,
    state.loading, state.switching, state.error, state.booted,
    generateNewInbox, switchInbox, deleteInbox, deleteAllInboxes,
    refreshEmails, deleteEmailFromList, deleteSpamming, pendingDeleteId,
    resolveTurnstile, reactivateInbox,
  ]);

  return (
    <InboxContext.Provider value={contextValue}>
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used within InboxProvider");
  return ctx;
}
