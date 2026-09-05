"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInbox } from "@/components/providers/InboxProvider";
import { formatRelativeTime } from "@/lib/utils";
import EmailViewer from "./EmailViewer";

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function EmailList() {
  const { emails, refreshEmails, deleteEmailFromList, activeInbox, switching } = useInbox();
  const [expandedId, setExpandedId] = useState(null);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const header = (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
      <h3 className="text-sm font-semibold text-text">Inbox</h3>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">Live</span>
        <button
          onClick={refreshEmails}
          className="p-1.5 rounded-md hover:bg-surface/40 text-muted hover:text-text transition-colors"
          aria-label="Refresh inbox"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>
    </div>
  );

  if (!activeInbox) {
    return (
      <div className="glass overflow-hidden">
        {header}
        <div className="py-16 text-center text-muted text-sm">
          Generate an inbox to start receiving emails.
        </div>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden">
      {header}
      <AnimatePresence mode="wait">
        <motion.div
          key={`inbox-${activeInbox.id}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
        >
          {switching ? (
            <div className="py-16 text-center text-muted text-sm flex items-center justify-center gap-2">
              <Spinner />
              <span>Loading inbox...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="py-16 text-center text-muted text-sm">
              Waiting for emails...
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {emails.map((email) => (
                <div key={email.id}>
                  <button
                    onClick={() => toggleExpand(email.id)}
                    className={`w-full text-left px-5 py-3 hover:bg-surface/40 transition-colors flex items-center gap-3 ${
                      !email.isRead ? "email-unread" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${!email.isRead ? "font-semibold text-text" : "text-text"}`}>
                          {email.from?.name || email.from?.address || "Unknown"}
                        </span>
                        <span className="text-xs text-muted whitespace-nowrap">
                          {formatRelativeTime(email.date)}
                        </span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${!email.isRead ? "font-medium text-text" : "text-muted"}`}>
                        {email.subject}
                      </p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedId === email.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <EmailViewer
                          email={email}
                          onDelete={() => {
                            deleteEmailFromList(email.id);
                            setExpandedId(null);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
