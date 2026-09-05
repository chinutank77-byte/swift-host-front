"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import { CreditCard, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const planPrices = {
  drop: 0,
  spark: 1.99,
  rush: 2.99,
  apex: 4.99,
};

export default function BillingPage() {
  const { user } = useAuth();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const plan = (user?.plan || "drop").toLowerCase();
  const price = planPrices[plan] ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading text-[clamp(1.6rem,4vw,2rem)] text-text">Billing</h1>
        <p className="text-sm text-muted mt-1">Manage your subscription</p>
      </div>

      <div className="glass p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge plan={plan} />
            </div>
            <p className="text-sm text-muted">
              {price === 0 ? "Free plan" : `$${price.toFixed(2)}/mo`}
              {price > 0 && ` · Next renewal: ${user?.planRenewal || "—"}`}
            </p>
          </div>
          {price > 0 && (
            <button
              onClick={() => toast.info("Billing portal is offline as payment gateway integration is pending.")}
              className="nm-btn-accent inline-flex items-center gap-1.5 py-2 px-4 text-sm font-medium"
            >
              <CreditCard size={14} />
              Manage billing
            </button>
          )}
        </div>

        <hr className="border-border/30" />

        <div className="flex items-center gap-3">
          <Link href="/pricing" className="nm-btn py-2 px-4 text-text text-sm font-medium">
            Change plan
          </Link>
        </div>

        {price > 0 && (
          <>
            <hr className="border-border/30" />
            <div>
              <button onClick={() => setShowCancelConfirm(!showCancelConfirm)}
                className="flex items-center gap-1.5 text-sm transition-colors text-muted hover:text-danger">
                <AlertTriangle size={14} />
                {showCancelConfirm ? "Click again to confirm cancellation" : "Cancel subscription"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
