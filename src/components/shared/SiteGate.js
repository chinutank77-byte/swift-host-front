"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TurnstileWidget from "@/components/shared/TurnstileWidget";

const SESSION_KEY = "swiftmail-gate-passed";

export default function SiteGate() {
  // null = not yet checked, false = need to show, true = passed
  const [passed, setPassed] = useState(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setPassed(true);
      } else {
        setPassed(false);
      }
    } catch {
      setPassed(true); // if storage blocked, don't gate
    }
  }, []);

  function handleVerify() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setPassed(true);
  }

  // not mounted yet — render nothing to avoid hydration mismatch
  if (passed === null) return null;

  return (
    <AnimatePresence>
      {!passed && (
        <motion.div
          key="site-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-bg"
        >
          {/* subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 40%, var(--accent-bg) 0%, transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative flex flex-col items-center gap-8 px-6 text-center"
          >
            {/* Logo */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-text hero-title tracking-tight">
                SwiftMail
              </h1>
              <p className="text-sm text-muted">
                Just a quick check before you continue.
              </p>
            </div>

            {/* Turnstile card */}
            <div className="glass px-8 py-7 flex flex-col items-center gap-4">
              <TurnstileWidget
                onVerify={handleVerify}
                onError={handleVerify} // on error still let through — don't block forever
              />
            </div>

            <p className="text-[11px] text-muted/60 max-w-xs leading-relaxed">
              Provided by Cloudflare Turnstile.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
