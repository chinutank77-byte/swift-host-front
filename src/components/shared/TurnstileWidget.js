"use client";

import { Turnstile } from "@marsidev/react-turnstile";

const getSiteKey = () => {
  if (typeof window !== "undefined" && window.__TURNSTILE_SITE_KEY__) {
    return window.__TURNSTILE_SITE_KEY__;
  }
  return "1x00000000000000000000AA";
};

/**
 * Reusable Cloudflare Turnstile widget.
 * Props:
 *   onVerify(token)  — called when challenge passes
 *   onExpire()       — called when token expires
 *   onError()        — called on widget error
 *   size             — "normal" (default) | "compact"
 *   className        — extra wrapper classes
 */
export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  size = "normal",
  className = "",
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Turnstile
        siteKey={getSiteKey()}
        options={{
          theme: "auto",
          size,
        }}
        onSuccess={onVerify}
        onExpire={onExpire}
        onError={onError}
      />
    </div>
  );
}
