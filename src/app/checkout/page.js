"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CreditCard,
  Check,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PLANS } from "@/lib/planData";
import { useAuth } from "@/components/providers/AuthProvider";
import TurnstileWidget from "@/components/shared/TurnstileWidget";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const planParam = searchParams.get("plan") || "spark";
  const planKey = PLANS[planParam] ? planParam : "spark";
  const plan = PLANS[planKey];

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [turnstileToken, setTurnstileToken] = useState("");

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-sm text-muted">
        <Loader2 className="animate-spin text-accent mr-2" size={20} />
        Verifying session...
      </div>
    );
  }

  const features = [
    { label: "Requests/sec", value: plan.reqPerSec },
    { label: "Retention", value: plan.retention },
    { label: "Concurrent inboxes", value: plan.concurrentInboxes },
    { label: "API access", value: plan.apiAccess ? "Full Access" : "None" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent font-medium transition-colors"
        >
          <ArrowLeft size={14} /> Back to pricing
        </Link>
        <h1 className="text-heading text-[clamp(1.8rem,4vw,2.4rem)] text-text mt-4">
          Checkout
        </h1>
        <p className="text-sm text-muted mt-1">
          Complete your subscription setup
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Account/Payment Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Account Status */}
          <div className="glass p-6 space-y-4">
            <h2 className="text-base font-bold text-text flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold font-mono">
                1
              </span>
              Account Information
            </h2>

            {isAuthenticated ? (
              <div className="nm-concave-sm p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted">Logged in as</p>
                  <p className="text-sm font-medium text-text font-mono mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <span className="nm-badge text-[10px] px-2 py-0.5 bg-success/10 text-success font-semibold">
                  Verified
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="glass-sm p-4 border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="text-amber-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm text-amber-950 font-semibold">
                      Account Required
                    </p>
                    <p className="text-xs text-amber-900/80 mt-1">
                      You must be registered and signed in to link a
                      subscription plan to your account.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={`/login?redirect=/checkout?plan=${planKey}`}
                    className="flex-1 nm-btn text-center py-2.5 text-sm font-medium text-accent"
                  >
                    Sign in to existing account
                  </Link>
                  <Link
                    href={`/signup?redirect=/checkout?plan=${planKey}`}
                    className="flex-1 nm-btn-accent text-center py-2.5 text-sm font-medium"
                  >
                    Create a new account
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Details */}
          <div className="glass p-6 space-y-6">
            <h2 className="text-base font-bold text-text flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold font-mono">
                2
              </span>
              Payment Method
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                  paymentMethod === "card"
                    ? "nm-concave text-accent font-semibold"
                    : "nm-btn text-muted hover:text-text"
                }`}
              >
                <CreditCard size={20} />
                <span className="text-xs">Credit Card</span>
              </button>
              <button
                type="button"
                disabled
                className="p-4 rounded-xl flex flex-col items-center justify-center gap-2 nm-concave-sm text-muted/40 cursor-not-allowed opacity-60"
              >
                <span className="font-bold text-xs uppercase tracking-wider">
                  Crypto
                </span>
                <span className="text-[10px]">Unavailable</span>
              </button>
            </div>

            {/* payment fields are offline until gateway is ready */}
            <div
              className={`space-y-4 ${!isAuthenticated ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5 uppercase tracking-wider">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 nm-input text-text text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5 uppercase tracking-wider">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    placeholder="•••• •••• •••• ••••"
                    className="w-full pl-4 pr-10 py-2.5 nm-input text-text text-sm font-mono cursor-not-allowed"
                  />
                  <CreditCard
                    className="absolute right-3.5 top-3 text-muted/50"
                    size={16}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5 uppercase tracking-wider">
                    Expiration
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="MM / YY"
                    className="w-full px-4 py-2.5 nm-input text-text text-sm font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5 uppercase tracking-wider">
                    CVC
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="•••"
                    className="w-full px-4 py-2.5 nm-input text-text text-sm font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Sandbox Notice Banner */}
            <div className="glass-sm p-4 border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm text-amber-950 font-semibold">
                  Payment Offline
                </p>
                <p className="text-xs text-amber-900/80 mt-1">
                  We are currently integrating our production payment processor.
                  Checkout is temporarily unavailable.
                </p>
              </div>
            </div>

            {/* Turnstile — verify before order can be placed */}
            <div className="space-y-2">
              <p className="text-xs text-muted font-semibold uppercase tracking-wider">Security Check</p>
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled
              className="w-full nm-concave-sm text-muted text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
            >
              <ShieldCheck size={16} />
              Payment Gateway Offline
            </button>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5">
          <div className="glass-nm p-6 space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-text border-b border-border/30 pb-3 uppercase tracking-wider text-xs">
              Order Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-text text-lg">
                    {plan.name} Plan
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    Recurring subscription
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-text text-lg">
                    ${plan.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted block">/ month</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/20">
                {features.map((feat) => (
                  <div
                    key={feat.label}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-muted">{feat.label}</span>
                    <span className="text-text font-mono font-medium">
                      {feat.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/30 flex justify-between items-center">
                <span className="font-bold text-text text-sm uppercase tracking-wider">
                  Total Due Today
                </span>
                <span className="font-bold text-text text-xl">
                  ${plan.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-surface/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text">
                <ShieldCheck size={14} className="text-success" />
                Guaranteed Safe & Secure
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                When active, your checkout is encrypted via SSL. You can cancel,
                upgrade, or downgrade your plan at any time from your billing
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-bg">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center py-20 text-sm text-muted">
              <Loader2 className="animate-spin text-accent mr-2" size={20} />
              Loading checkout...
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
