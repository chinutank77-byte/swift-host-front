"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as apiLogin, fetchMe } from "@/lib/emailService";

const AuthContext = createContext(null);

const COOKIE_NAME = "swiftmail_key";
const COOKIE_DAYS = 30;

function setCookie(key) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(key)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function removeCookie() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
}

function readCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ isAuthenticated: false, user: null, loading: true });

  useEffect(() => {
    const key = readCookie();
    if (!key) {
      setSession({ isAuthenticated: false, user: null, loading: false });
      return;
    }

    fetchMe(key)
      .then((data) => {
        if (data.type === "user") {
          const plan = data.plan || "drop";
          const isUnlimited = plan === "apex" || plan === "rush";
          setSession({
            isAuthenticated: true,
            user: {
              email: data.email,
              apiKey: key,
              plan,
              activeInboxes: data.active_inboxes || 0,
              maxInboxes: isUnlimited ? Infinity : (data.max_inboxes ?? 5),
            },
            loading: false,
          });
        } else {
          removeCookie();
          setSession({ isAuthenticated: false, user: null, loading: false });
        }
      })
      .catch(() => {
        // Don't remove cookie on network errors - keep session for retry
        setSession({ isAuthenticated: false, user: null, loading: false });
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    const apiKey = data.api_key;
    if (!apiKey) throw new Error("No API key returned");

    setCookie(apiKey);

    const me = await fetchMe(apiKey);
    const plan = me.plan || "drop";
    const isUnlimited = plan === "apex" || plan === "rush";
    setSession({
      isAuthenticated: true,
      user: {
        email: me.email || email,
        apiKey,
        plan,
        activeInboxes: me.active_inboxes || 0,
        maxInboxes: isUnlimited ? Infinity : (me.max_inboxes ?? 5),
      },
      loading: false,
    });

    return apiKey;
  }, []);

  const setVerifiedSession = useCallback(async (apiKey, email) => {
    setCookie(apiKey);
    const me = await fetchMe(apiKey);
    const plan = me.plan || "drop";
    const isUnlimited = plan === "apex" || plan === "rush";
    setSession({
      isAuthenticated: true,
      user: {
        email: me.email || email,
        apiKey,
        plan,
        activeInboxes: me.active_inboxes || 0,
        maxInboxes: isUnlimited ? Infinity : (me.max_inboxes ?? 5),
      },
      loading: false,
    });
  }, []);

  const logout = useCallback(() => {
    removeCookie();
    setSession({ isAuthenticated: false, user: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...session, login, setVerifiedSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
