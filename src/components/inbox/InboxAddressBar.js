"use client";

import { useState } from "react";
import { RefreshCw, Copy, Check, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useInbox } from "@/components/providers/InboxProvider";
import { copyToClipboard } from "@/lib/utils";
import DOMAINS from "@/data/domains.json";
import NeumorphicSelect from "@/components/shared/NeumorphicSelect";
import TurnstileWidget from "@/components/shared/TurnstileWidget";
import { useSpamGuard } from "@/hooks/useSpamGuard";

export default function InboxAddressBar() {
  const { activeInbox, ready, generateNewInbox, loading } = useInbox();
  const [copied, setCopied] = useState(false);
  const [domain, setDomain] = useState(
    DOMAINS[0]?.domain || "swiftinbox1.store",
  );
  const [username, setUsername] = useState("");
  const [inboxType, setInboxType] = useState("private");
  const [turnstileToken, setTurnstileToken] = useState("");

  const { record, isSpamming, reset } = useSpamGuard({ threshold: 3, windowMs: 60_000 });

  async function handleGenerate() {
    record();

    // if spamming and no token yet, block — widget will be shown below
    if (isSpamming && !turnstileToken) return;

    try {
      // TODO: pass turnstileToken to backend once endpoint supports it
      await generateNewInbox(domain, username || undefined, inboxType);
      setUsername("");
      if (turnstileToken) {
        reset();
        setTurnstileToken("");
      }
    } catch {
      toast.error("Failed to create inbox. Please try again.");
    }
  }

  if (!ready) {
    return (
      <div className="glass p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-10 rounded-lg bg-surface/40 animate-pulse" />
          <span className="text-muted text-lg select-none">@</span>
          <div className="w-44 h-10 rounded-lg bg-surface/40 animate-pulse" />
        </div>
        <div className="h-7 w-64 mx-auto bg-surface/40 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="glass p-5 sm:p-6 space-y-5">
      {activeInbox && (
        <div className="text-center pb-3 border-b border-border/30">
          <div className="text-xs text-muted mb-1">Current inbox</div>
          <div className="font-mono text-lg text-text font-medium tracking-tight hero-title">
            {activeInbox.address}
          </div>
          <motion.button
            onClick={async () => {
              const ok = await copyToClipboard(activeInbox.address);
              if (ok) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            whileTap={{ scale: 0.97 }}
            className={`mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied ? "bg-success text-white" : "nm-btn-accent"
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy address"}
          </motion.button>
        </div>
      )}

      <div className="text-center space-y-1">
        <p className="text-sm text-text font-medium">
          {activeInbox ? "New inbox" : "Create your first inbox"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 min-w-0 px-4 py-2.5 nm-input text-text text-sm font-mono"
          placeholder="username (optional)"
          aria-label="Desired username"
        />
        <div className="flex items-center gap-2">
          <span className="text-muted text-lg select-none shrink-0">@</span>
          <NeumorphicSelect
            options={DOMAINS.map((d) => ({ value: d.domain, label: d.domain }))}
            value={domain}
            onChange={setDomain}
            className="min-w-0 flex-1 sm:w-44 sm:flex-none shrink-0"
            ariaLabel="Domain"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs text-muted font-medium">Type</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInboxType("private")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              inboxType === "private" ? "nm-btn-accent" : "nm-btn text-muted"
            }`}
          >
            Private
          </button>
          <button
            type="button"
            onClick={() => setInboxType("public")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              inboxType === "public" ? "nm-btn-accent" : "nm-btn text-muted"
            }`}
          >
            Public
          </button>
        </div>
      </div>

      {/* Spam gate — slides in after 3 rapid attempts */}
      <AnimatePresence>
        {isSpamming && !turnstileToken && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="nm-concave-sm rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <ShieldAlert size={15} className="text-accent shrink-0" />
                <span>Too many requests — please complete the check below.</span>
              </div>
              <TurnstileWidget
                size="compact"
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading || (isSpamming && !turnstileToken)}
          className="flex-1 nm-btn-accent flex items-center justify-center gap-2 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Creating..." : isSpamming && !turnstileToken ? "Verify above to continue" : "Generate"}
        </button>
      </div>
    </div>
  );
}
