"use client";

import Link from "next/link";
import { Zap, BarChart3, Clock } from "lucide-react";
import UsageBar from "@/components/dashboard/UsageBar";
import StatusBadge from "@/components/shared/StatusBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import { useInbox } from "@/components/providers/InboxProvider";

export default function UsagePage() {
  const { user } = useAuth();
  const { savedInboxes, emails } = useInbox();

  const activeCount = savedInboxes.length;
  const totalEmails = emails.length;
  const unreadCount = emails.filter((e) => !e.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading text-[clamp(1.6rem,4vw,2rem)] text-text">Usage</h1>
          <p className="text-sm text-muted mt-1">Real-time usage across your account</p>
        </div>
        <Link href="/pricing" className="nm-btn-accent py-2 px-4 text-sm font-medium">
          Upgrade plan
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge plan={user?.plan || "drop"} />
        <span className="text-sm text-muted">Current plan</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Zap size={16} className="text-accent" />
            <span className="text-text font-medium">Active inboxes</span>
          </div>
          <div className="text-3xl font-bold text-text font-mono">{activeCount}</div>
          <div className="h-2 rounded-full nm-concave overflow-hidden p-[1px]">
            <div className="h-full rounded-full bg-accent"
              style={{ width: `${user?.maxInboxes === Infinity ? 0 : Math.min(100, (activeCount / (user?.maxInboxes || 25)) * 100)}%` }} />
          </div>
          <div className="text-xs text-muted font-mono">
            {user?.maxInboxes === Infinity ? `${activeCount} / Unlimited` : `${activeCount} / ${user?.maxInboxes || 25} used`}
          </div>
        </div>

        <div className="glass p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 size={16} className="text-accent" />
            <span className="text-text font-medium">Total emails</span>
          </div>
          <div className="text-3xl font-bold text-text font-mono">{totalEmails}</div>
          {unreadCount > 0 && (
            <div className="text-xs text-accent font-medium">{unreadCount} unread</div>
          )}
        </div>

        <div className="glass p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-accent" />
            <span className="text-text font-medium">Plan status</span>
          </div>
          <div className="text-lg font-semibold text-text">
            {user?.plan === "rush" || user?.plan === "apex" ? (
              <span className="text-success">Full access</span>
            ) : (
              <span className="text-muted">Limited</span>
            )}
          </div>
          <Link href="/pricing" className="text-xs text-accent hover:text-accent-dim font-medium">
            See plan limits →
          </Link>
        </div>
      </div>
    </div>
  );
}
