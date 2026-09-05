"use client";

import { motion } from "framer-motion";
import { useInbox } from "@/components/providers/InboxProvider";

export default function StatsBar() {
  const { savedInboxes, emails, ready } = useInbox();

  if (!ready) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-sm p-4 text-center">
            <div className="h-7 w-10 mx-auto bg-surface/30 rounded animate-pulse" />
            <div className="h-3 w-16 mx-auto mt-2 bg-surface/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const totalEmails = emails.length;
  const unreadCount = emails.filter((e) => !e.isRead).length;

  return (
    <div className="grid grid-cols-3 gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-sm p-4 text-center">
        <div className="text-2xl font-bold text-text font-mono">{totalEmails}</div>
        <div className="text-xs text-muted mt-1">Emails received</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-sm p-4 text-center">
        <div className="text-2xl font-bold text-text font-mono">{savedInboxes.length}</div>
        <div className="text-xs text-muted mt-1">Active inboxes</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-sm p-4 text-center">
        <div className="text-2xl font-bold text-text font-mono">{unreadCount}</div>
        <div className="text-xs text-muted mt-1">Unread</div>
      </motion.div>
    </div>
  );
}
