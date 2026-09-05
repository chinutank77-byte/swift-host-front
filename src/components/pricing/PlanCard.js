"use client";

import { Check, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import StatusBadge from "@/components/shared/StatusBadge";
import Link from "next/link";

export default function PlanCard({ planSlug, name, price, description, features, cta, isPopular }) {
  const { user } = useAuth();
  const currentPlan = user?.plan?.toLowerCase() === planSlug;
  const isLoggedIn = !!user;

  let ctaHref = planSlug === "drop" ? "/login" : `/checkout?plan=${planSlug}`;
  let ctaLabel = planSlug === "drop" ? "Start free" : "Get started";

  if (isLoggedIn) {
    ctaHref = planSlug === "drop" ? "/" : `/checkout?plan=${planSlug}`;
  }

  if (cta?.href) ctaHref = cta.href;
  if (cta?.label) ctaLabel = cta.label;
  return (
    <div className={`relative rounded-[20px] p-6 flex flex-col glass-nm ${isPopular ? "plan-popular" : ""}`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 nm-btn-accent text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}

      <div className="mb-2">
        <StatusBadge plan={name} />
      </div>

      <h3 className="text-2xl font-bold text-text mt-2 hero-title">{name}</h3>

      <div className="mt-1 mb-3">
        {price === 0 ? (
          <span className="text-3xl font-bold text-text">Free</span>
        ) : (
          <span className="text-3xl font-bold text-text">
            ${price.toFixed(2)}
            <span className="text-base font-normal text-muted">/mo</span>
          </span>
        )}
      </div>

      <p className="text-sm text-muted mb-6">{description}</p>

      <div className="space-y-2.5 mb-8 flex-1">
        {features.map((feature) => {
          const val = feature.value;
          const isBool = typeof val === "boolean";
          const excluded = isBool && !val;

          if (isBool) {
            return (
              <div key={feature.label} className="flex items-start gap-3">
                {val ? (
                  <Check size={14} className="text-success mt-[3px] shrink-0" />
                ) : (
                  <X size={14} className="text-muted/25 mt-[3px] shrink-0" />
                )}
                <span className={`text-[13px] leading-tight ${val ? "text-text font-medium" : "text-muted/35"}`}>
                  {feature.label}
                </span>
              </div>
            );
          }

          return (
            <div key={feature.label} className="flex items-start gap-3">
              <Check size={14} className="text-success mt-[3px] shrink-0" />
              <div className="text-[13px] leading-tight">
                <span className="text-text font-medium">{val}</span>
                {!isBool && val !== "Unlimited" && (
                  <span className="text-muted"> {feature.label}</span>
                )}
                {val === "Unlimited" && (
                  <span className="text-muted"> {feature.label}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentPlan ? (
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-[10px] nm-concave-sm text-muted text-sm font-medium cursor-not-allowed"
        >
          Current plan
        </button>
      ) : (
        <Link
          href={ctaHref}
          className="block text-center w-full nm-btn-accent py-2.5 px-4 rounded-[10px] text-sm font-medium"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
