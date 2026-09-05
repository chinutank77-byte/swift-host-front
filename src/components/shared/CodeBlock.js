"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export default function CodeBlock({ code, language, label, tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentCode = tabs ? tabs[activeTab].code : code;
  const currentLang = tabs ? tabs[activeTab].language : language;

  async function handleCopy() {
    const success = await copyToClipboard(currentCode);
    if (success) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  return (
    <div className="rounded-xl glass overflow-hidden border border-border/40">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface/30 border-b border-border/20">
        <div className="flex items-center gap-2">
          {tabs ? (
            tabs.map((tab, i) => (
              <button key={tab.language} onClick={() => setActiveTab(i)}
                className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                  i === activeTab ? "nm-concave-sm text-text" : "text-muted hover:text-text"
                }`}>
                {tab.language}
              </button>
            ))
          ) : (
            <span className="text-xs text-muted font-medium uppercase">{currentLang || label || "Code"}</span>
          )}
        </div>
        <button onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted hover:text-text transition-colors" aria-label="Copy code">
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-text whitespace-pre bg-surface/10">
        {currentCode}
      </pre>
    </div>
  );
}
