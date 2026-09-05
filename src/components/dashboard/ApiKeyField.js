"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { copyToClipboard } from "@/lib/utils";

export default function ApiKeyField() {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = user?.apiKey || "";

  async function handleCopy() {
    const ok = await copyToClipboard(apiKey);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  return (
    <div className="glass p-5 space-y-4">
      <label className="text-sm font-medium text-text block">Your API Key</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 nm-input px-4 py-2.5 font-mono text-sm text-text truncate">
          {revealed ? apiKey : "•".repeat(Math.min(32, apiKey.length || 8))}
        </div>
        <button onClick={() => setRevealed(!revealed)}
          className="nm-btn p-2 text-muted" aria-label={revealed ? "Hide key" : "Reveal key"}>
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button onClick={handleCopy}
          className={`nm-btn p-2 ${copied ? "text-success" : "text-muted"}`} aria-label="Copy key">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      {!apiKey && (
        <p className="text-sm text-muted">Sign in to view your API key.</p>
      )}
    </div>
  );
}
