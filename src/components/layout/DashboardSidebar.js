"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Key, BarChart3, CreditCard, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const sidebarItems = [
    { href: "/dashboard", label: "Inboxes", icon: Inbox },
    { href: "/dashboard/api-keys", label: "API Key", icon: Key },
    { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <>
      <aside className="hidden lg:flex w-56 shrink-0 flex-col">
        <div className="sticky top-20 pt-6 pb-4 px-3">
          <div className="glass-sm p-4 space-y-2">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 hero-title px-2">
              Dashboard
            </h2>
            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || (item.locked && false);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-accent"
                        : "text-muted hover:text-text"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 nm-concave-sm rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon size={18} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-3 px-2">
            <Link href="/"
              className="flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors py-2">
              <Home size={14} />
              Back to inbox
            </Link>
          </div>
        </div>
      </aside>

      <nav className="lg:hidden flex overflow-x-auto border-b border-border/30 bg-surface/30 backdrop-blur-sm">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-text"
              }`}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
