"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { fetchPublicInbox } from "@/lib/emailService";
import { extractOTPs } from "@/components/inbox/EmailViewer";
import { formatRelativeTime, copyToClipboard } from "@/lib/utils";

const p = (n, w) => `${n} ${n === 1 ? w : w + "s"}`;

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
  };
}

export default function OpenInboxPage() {
  const [emailInput, setEmailInput] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    if (error.status === 404) return "Inbox not found. Check the address and try again.";
    if (error.status === 403) return "This inbox is private. Only public inboxes can be opened here.";
    if (error.message?.includes("fetch") || error.message?.includes("network")) {
      return "Unable to reach the server. Check your connection and retry.";
    }
    return error.message || "Something went wrong. Try again.";
  }, [error]);

  async function doFetch(email, isRefresh = false) {
    if (!email.trim()) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
      setMessages(null);
    }

    try {
      const data = await fetchPublicInbox(email.trim());
      const mapped = (data?.messages || []).map(mapApiMessage);
      setMessages(mapped);
      setSearchedEmail(email.trim());
      setExpandedId(null);
    } catch (err) {
      setError({ message: err.message, status: err.status });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    doFetch(emailInput);
  }

  function handleRefresh() {
    if (searchedEmail) doFetch(searchedEmail, true);
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-6 text-center sm:text-left">
          <h1 className="text-heading text-[clamp(2rem,5vw,3.5rem)] text-text max-w-4xl leading-[1.05]">
            Open an inbox
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-xl font-medium">
            Enter any SwiftMail address to view its messages. No account needed for public inboxes.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 space-y-5">
          {/* Search card */}
          <div className="glass p-5 sm:p-6 space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 min-w-0 px-4 py-2.5 nm-input text-text text-sm font-mono"
                placeholder="inbox@domain.com"
                aria-label="Inbox email address"
              />
              <button
                type="submit"
                disabled={loading || !emailInput.trim()}
                className="nm-btn-accent flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                <Search size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Opening..." : "Open inbox"}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="nm-concave-sm rounded-xl p-4">
                    <p className="text-sm text-danger font-medium">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skeleton loading */}
          {loading && (
            <div className="glass overflow-hidden">
              <div className="px-5 py-3 border-b border-border/40">
                <div className="h-5 w-28 bg-surface/40 animate-pulse rounded" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-4 space-y-2 border-b border-border/20">
                  <div className="h-4 w-48 bg-surface/40 animate-pulse rounded" />
                  <div className="h-3 w-72 bg-surface/30 animate-pulse rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Message list */}
          {!loading && messages !== null && (
            <div className="glass overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
                <h3 className="text-sm font-semibold text-text">
                  {p(messages.length, "message")} ·{" "}
                  <span className="font-mono font-normal text-xs text-muted">{searchedEmail}</span>
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-1.5 rounded-md hover:bg-surface/40 text-muted hover:text-text transition-colors disabled:opacity-50"
                  aria-label="Refresh inbox"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>

              {messages.length === 0 ? (
                <div className="py-16 text-center text-muted text-sm">
                  Send an email to this address to see messages here.
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {messages.map((msg) => (
                    <div key={msg.id}>
                      <button
                        onClick={() => toggleExpand(msg.id)}
                        className="w-full text-left px-5 py-3 hover:bg-surface/40 transition-colors flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-text truncate">
                              {msg.from?.address || "Unknown"}
                            </span>
                            <span className="text-xs text-muted whitespace-nowrap">
                              {formatRelativeTime(msg.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm text-muted truncate flex-1">
                              {msg.subject}
                            </p>
                            {msg.otp && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-accent nm-badge bg-accent/10 px-2 py-0.5 shrink-0">
                                OTP
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedId === msg.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <MessageViewer message={msg} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

function MessageViewer({ message }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [showPlain, setShowPlain] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(400);

  const otpCodes = useMemo(
    () => extractOTPs(message.bodyText, message.bodyHtml),
    [message.bodyText, message.bodyHtml]
  );

  const processedHtml = useMemo(() => {
    if (!message.bodyHtml) return "";
    let html = message.bodyHtml;
    if (html.includes("<head>")) {
      html = html.replace("<head>", '<head><base target="_blank">');
    } else {
      html = `<base target="_blank">${html}`;
    }
    html = html.replace(/<a\s+([^>]*?)>/gi, (_match, attrs) => {
      const cleanAttrs = attrs
        .replace(/\btarget\s*=\s*['"][^'"]*['"]/gi, "")
        .replace(/\brel\s*=\s*['"][^'"]*['"]/gi, "");
      return `<a ${cleanAttrs} target="_blank" rel="noopener noreferrer">`;
    });
    return html;
  }, [message.bodyHtml]);

  async function handleCopyOTP(code) {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  }

  const handleIframeLoad = (e) => {
    try {
      const iframe = e.target;
      if (iframe?.contentWindow?.document) {
        const doc = iframe.contentWindow.document;
        if (doc.body) {
          doc.body.style.margin = "0";
          doc.body.style.padding = "0";
        }
        setTimeout(() => {
          const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
          if (height > 0) setIframeHeight(Math.max(400, height + 20));
        }, 100);
      }
    } catch {}
  };

  const bodyContent = message.bodyHtml && !showPlain ? processedHtml : message.bodyText;
  const hasHtml = Boolean(message.bodyHtml);

  return (
    <div className="px-4 py-4 space-y-4">
      {otpCodes.length > 0 && (
        <div className="nm-convex p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent nm-badge bg-accent/10 px-2 py-0.5">
              OTP Detected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {otpCodes.map((code) => (
              <button
                key={code}
                onClick={() => handleCopyOTP(code)}
                className="group flex items-center gap-2 nm-btn px-4 py-2.5 rounded-xl transition-all"
              >
                <span className="font-mono text-lg font-bold text-text tracking-[0.15em]">
                  {code}
                </span>
                {copiedCode === code ? (
                  <Check size={16} className="text-success" />
                ) : (
                  <Copy size={14} className="text-muted group-hover:text-accent transition-colors" />
                )}
                {copiedCode === code && (
                  <span className="text-xs text-success font-medium">Copied!</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="glass-sm p-3 space-y-1.5 text-sm">
        <div>
          <span className="text-muted">From: </span>
          <span className="text-text font-semibold">
            <span className="font-mono font-normal text-muted">
              &lt;{message.from.address}&gt;
            </span>
          </span>
        </div>
        <div>
          <span className="text-muted">Subject: </span>
          <span className="text-text font-semibold">{message.subject}</span>
        </div>
        <div>
          <span className="text-xs text-muted">
            {new Date(message.date).toLocaleString()}
          </span>
          {hasHtml && (
            <button
              onClick={() => setShowPlain(!showPlain)}
              className="ml-3 text-[11px] text-accent hover:text-accent-dim font-medium transition-colors"
            >
              {showPlain ? "Show HTML" : "Show plain text"}
            </button>
          )}
        </div>
      </div>

      <div className="nm-convex rounded-xl overflow-hidden">
        {bodyContent && (message.bodyHtml && !showPlain) ? (
          <iframe
            srcDoc={bodyContent}
            onLoad={handleIframeLoad}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
            title="Email content"
            className="w-full border-0 transition-all duration-200"
            style={{ height: `${iframeHeight}px`, background: "transparent" }}
          />
        ) : (
          <pre className="text-sm text-text font-sans whitespace-pre-wrap leading-relaxed p-4 m-0">
            {bodyContent || "No content"}
          </pre>
        )}
      </div>
    </div>
  );
}
