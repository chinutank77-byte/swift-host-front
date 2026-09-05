"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, Clock, Mail, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useInbox } from "@/components/providers/InboxProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatRemaining } from "@/lib/utils";

export default function DashboardInboxesPage() {
  const { savedInboxes, deleteInbox, deleteAllInboxes, loading, reactivateInbox } = useInbox();
  const { user } = useAuth();
  const [now, setNow] = useState(Date.now());
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await deleteInbox(id);
      toast.success("Inbox deleted");
    } catch {
      toast.error("Failed to delete inbox");
    } finally {
      setDeleting(null);
    }
  }

  const totalUnread = savedInboxes.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading text-[clamp(1.6rem,4vw,2rem)] text-text">Your Inboxes</h1>
          <p className="text-sm text-muted mt-1">
            {savedInboxes.length} active inboxes
            {user?.maxInboxes > 0 && user?.maxInboxes < Infinity && ` · ${user.maxInboxes} max`}
            {user?.maxInboxes === Infinity && " · Unlimited"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedInboxes.length > 0 && (
            <button onClick={deleteAllInboxes}
              className="nm-btn py-2 px-3 text-sm font-medium text-danger">
              Delete all
            </button>
          )}
          <Link href="/" className="nm-btn-accent py-2 px-4 text-sm font-medium">
            + New Inbox
          </Link>
        </div>
      </div>

      {loading && savedInboxes.length === 0 ? (
        <div className="glass p-12 text-center">
          <Loader2 size={24} className="animate-spin text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">Loading inboxes...</p>
        </div>
      ) : savedInboxes.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-muted text-sm">No inboxes yet.</p>
          <Link href="/" className="nm-btn-accent inline-flex mt-4 py-2 px-4 text-sm font-medium">
            Create a disposable inbox
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedInboxes.map((inbox, i) => {
            const remaining = inbox.expiryTimestamp ? Math.max(0, inbox.expiryTimestamp - now) : 3600000;
            const expiryLabel = remaining > 0 ? formatRemaining(remaining) : "Expired";
            const isExpiring = remaining > 0 && remaining < 5 * 60 * 1000;
            const isExpired = remaining <= 0;

            return (
              <motion.div
                key={inbox.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass p-4 space-y-3 relative group ${isExpired ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-mono text-text truncate font-medium">
                      {inbox.email || inbox.address}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock size={12} className={isExpiring ? "text-danger" : "text-muted"} />
                        <span className={isExpiring ? "text-danger font-semibold" : "text-muted"}>
                          {isExpired ? "Expired" : `${expiryLabel} left`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => reactivateInbox(inbox.id)}
                      className="p-1.5 rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:text-accent hover:bg-accent/5 transition-all"
                      aria-label={`Reactivate ${inbox.email || inbox.address}`}
                      title="Reactivate/Extend Inbox"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(inbox.id)}
                      disabled={deleting === inbox.id}
                      className="p-1.5 rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-danger/5 transition-all disabled:opacity-50"
                      aria-label={`Delete ${inbox.email || inbox.address}`}
                    >
                      {deleting === inbox.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                  <Link
                    href="/"
                    className="flex-1 nm-btn text-center py-2 text-xs font-medium text-accent flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Open inbox
                  </Link>
                </div>

                {isExpiring && !isExpired && (
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-danger rounded-full animate-pulse" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
