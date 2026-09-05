"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PlanStatusBadge() {
  const { isAuthenticated, user } = useAuth();
  const plan = user?.plan?.toLowerCase();
  const planLabel = user?.plan
    ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) + " Plan"
    : "Free Plan";

  return (
    <div className="text-muted font-medium">
      <span className="text-nm-engraved font-bold text-text">{planLabel}</span>{" "}
      <span className="mx-1.5 text-border">•</span> Active
      {(!isAuthenticated || plan === "drop" || plan === "spark") && (
        <Link href="/pricing" className="text-accent hover:text-accent-dim font-bold ml-1">
          Upgrade →
        </Link>
      )}
    </div>
  );
}
