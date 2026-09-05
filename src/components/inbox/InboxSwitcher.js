"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Trash2, Circle, ShieldAlert, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInbox } from "@/components/providers/InboxProvider";
import { formatRemaining } from "@/lib/utils";
import TurnstileWidget from "@/components/shared/TurnstileWidget";

export default function InboxSwitcher() {
  const { savedInboxes, activeInbox, switchInbox, deleteInbox, deleteAllInboxes, deleteSpamming, resolveTurnstile, reactivateInbox } =
    useInbox();
  const [open, setOpen] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  function handleDeleteAll() {
    if (confirmDeleteAll) {
      deleteAllInboxes();
      setConfirmDeleteAll(false);
    } else {
      setConfirmDeleteAll(true);
      setTimeout(() => setConfirmDeleteAll(false), 3000);
    }
  }

  return (
    <div className="glass overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-text hover:bg-surface/30 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <span>My Inboxes</span>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full nm-concave-sm text-xs text-muted px-1.5">
            {savedInboxes.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {savedInboxes.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAll();
              }}
              className={`text-xs font-medium transition-colors ${
                confirmDeleteAll ? "text-danger" : "text-muted hover:text-danger"
              }`}
            >
              {confirmDeleteAll ? "Confirm?" : "Delete All"}
            </button>
          )}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} />
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 p-3 space-y-2 bg-surface/10">
              {savedInboxes.length === 0 ? (
                <div className="px-4 py-8 text-sm text-muted text-center">
                  No saved inboxes
                </div>
              ) : (
                savedInboxes.map((inbox) => {
                  const isActive = inbox.id === activeInbox?.id;
                  const remaining = Math.max(0, (inbox.expiryTimestamp || 0) - now);
                  const expiryLabel = remaining > 0 ? formatRemaining(remaining) : "Expired";
                  const isExpiring = remaining > 0 && remaining < 5 * 60 * 1000;

                  return (
                    <div
                      key={inbox.id}
                      onClick={() => switchInbox(inbox.id)}
                      className={`relative group flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        isActive
                          ? "nm-convex bg-surface"
                          : "nm-concave-sm hover:shadow-[inset_1px_1px_3px_var(--nm-shadow-dark),inset_-1px_-1px_3px_var(--nm-shadow-light)]"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                      )}

                      <div className="flex-1 min-w-0 pr-2">
                        <div className={`text-sm truncate transition-colors ${
                          isActive ? "font-bold text-text" : "font-medium text-muted"
                        }`}>
                          <span className="font-mono">{inbox.address}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent nm-badge px-1.5 py-0.5 bg-accent/10">
                              <Circle size={5} className="fill-accent" /> Active
                            </span>
                          )}
                          <span className={`text-[11px] font-mono ${
                            isExpiring ? "text-danger font-semibold" : "text-muted"
                          }`}>
                            {remaining > 0 ? `${expiryLabel} left` : "Expired"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {inbox.unreadCount > 0 && (
                          <span className={`inline-flex items-center justify-center min-w-[24px] h-[24px] rounded-full text-[11px] font-bold ${
                            isActive
                              ? "nm-btn-accent text-white"
                              : "nm-concave-sm text-muted"
                          } px-1.5`}>
                            {inbox.unreadCount}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reactivateInbox(inbox.id);
                          }}
                          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/5 transition-all"
                          aria-label={`Reactivate ${inbox.address}`}
                          title="Reactivate/Extend Inbox"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteInbox(inbox.id);
                          }}
                          className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/5 transition-all"
                          aria-label={`Delete ${inbox.address}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteSpamming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-4 py-4 space-y-3 bg-surface/10">
              <div className="flex items-center gap-2 text-xs text-muted">
                <ShieldAlert size={13} className="text-accent shrink-0" />
                <span>Too many deletes — verify to continue.</span>
              </div>
              <TurnstileWidget
                size="compact"
                onVerify={(token) => resolveTurnstile(token)}
                onExpire={() => {}}
                onError={() => {}}
                className="justify-start"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
