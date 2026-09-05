"use client";

import { useState, useMemo } from "react";
import { Trash2, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function extractOTPs(bodyText, bodyHtml) {
  const codes = [];
  const text = (bodyText || "") + " " + (bodyHtml || "").replace(/<[^>]*>/g, " ");
  const contextWords = /\b(otp|code|verification|verify|confirm|authenticate|login|sign.?in|2fa|token|auth)\b/i;

  const wordRegex = /(\b\d{4,8}\b)/g;
  let match;
  const seen = new Set();

  while ((match = wordRegex.exec(text)) !== null) {
    const code = match[1];
    if (seen.has(code)) continue;

    const year = parseInt(code, 10);
    if (year >= 1900 && year <= 2100) continue;

    const pos = match.index;
    const before = text.substring(Math.max(0, pos - 60), pos);
    const after = text.substring(pos + code.length, pos + code.length + 60);
    const context = before + code + after;

    if (contextWords.test(context)) {
      seen.add(code);
      codes.push(code);
    }
  }

  return codes.slice(0, 3);
}

export default function EmailViewer({ email, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showPlain, setShowPlain] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(400);

  const otpCodes = useMemo(
    () => extractOTPs(email.bodyText, email.bodyHtml),
    [email.bodyText, email.bodyHtml]
  );

  const processedHtml = useMemo(() => {
    if (!email.bodyHtml) return "";
    let html = email.bodyHtml;

    // Inject <base target="_blank"> inside <head> if head exists, or prepend if not
    if (html.includes("<head>")) {
      html = html.replace("<head>", '<head><base target="_blank">');
    } else {
      html = `<base target="_blank">${html}`;
    }

    // Force all link targets to _blank and add rel="noopener noreferrer"
    html = html.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
      // Remove target and rel if they already exist
      const cleanAttrs = attrs
        .replace(/\btarget\s*=\s*['"][^'"]*['"]/gi, "")
        .replace(/\brel\s*=\s*['"][^'"]*['"]/gi, "");
      return `<a ${cleanAttrs} target="_blank" rel="noopener noreferrer">`;
    });

    return html;
  }, [email.bodyHtml]);

  const handleIframeLoad = (e) => {
    try {
      const iframe = e.target;
      if (iframe?.contentWindow?.document) {
        const doc = iframe.contentWindow.document;
        if (doc.body) {
          doc.body.style.margin = "0";
          doc.body.style.padding = "0";
        }
        
        setTimeout(() => {
          const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
          if (height > 0) {
            setIframeHeight(Math.max(400, height + 20));
          }
        }, 100);
      }
    } catch (err) {
      console.error("Iframe height calc error:", err);
    }
  };

  async function handleCopyOTP(code) {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  }

  function handleDelete() {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  const bodyContent = email.bodyHtml && !showPlain ? processedHtml : email.bodyText;
  const hasHtml = Boolean(email.bodyHtml);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* OTP Detection Bar */}
      {otpCodes.length > 0 && (
        <div className="nm-convex p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent nm-badge bg-accent/10 px-2 py-0.5">
              OTP Detected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {otpCodes.map((code) => (
              <button
                key={code}
                onClick={() => handleCopyOTP(code)}
                className="group flex items-center gap-2 nm-btn px-4 py-2.5 rounded-xl transition-all"
              >
                <span className="font-mono text-lg font-bold text-text tracking-[0.15em]">
                  {code}
                </span>
                {copiedCode === code ? (
                  <Check size={16} className="text-success" />
                ) : (
                  <Copy size={14} className="text-muted group-hover:text-accent transition-colors" />
                )}
                {copiedCode === code && (
                  <span className="text-xs text-success font-medium">Copied!</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Email Header */}
      <div className="glass-sm p-3 space-y-1.5 text-sm">
        <div>
          <span className="text-muted">From: </span>
          <span className="text-text font-semibold">
            {email.from.name}{" "}
            <span className="font-mono font-normal text-muted">
              &lt;{email.from.address}&gt;
            </span>
          </span>
        </div>
        <div>
          <span className="text-muted">To: </span>
          <span className="text-text font-mono">{email.to.address}</span>
        </div>
        <div>
          <span className="text-muted">Subject: </span>
          <span className="text-text font-semibold">{email.subject}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted">
            {new Date(email.date).toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {hasHtml && (
              <button
                onClick={() => setShowPlain(!showPlain)}
                className="text-[11px] text-accent hover:text-accent-dim font-medium transition-colors"
              >
                {showPlain ? "Show HTML" : "Show plain text"}
              </button>
            )}
            <button
              onClick={handleDelete}
              className={`nm-btn p-1.5 rounded-lg ${confirmDelete ? "text-danger" : "text-muted"}`}
              aria-label="Delete email"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* email body container */}
      <div className="nm-convex rounded-xl overflow-hidden">
        {bodyContent && (email.bodyHtml && !showPlain) ? (
          <iframe
            srcDoc={bodyContent}
            onLoad={handleIframeLoad}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
            title="Email content"
            className="w-full border-0 transition-all duration-200"
            style={{ height: `${iframeHeight}px`, background: "transparent" }}
          />
        ) : (
          <pre className="text-sm text-text font-sans whitespace-pre-wrap leading-relaxed p-4 m-0">
            {bodyContent || "No content"}
          </pre>
        )}
      </div>
    </div>
  );
}
