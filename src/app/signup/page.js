"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { register, verify } from "@/lib/emailService";
import TurnstileWidget from "@/components/shared/TurnstileWidget";

export default function SignupPage() {
  const router = useRouter();
  const { setVerifiedSession } = useAuth();
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [redirect, setRedirect] = useState("/dashboard");
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redir = params.get("redirect");
      if (redir) {
        setRedirect(redir);
      }
    }
  }, []);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    try {
      await register(email, password, turnstileToken);
      setStep("verify");
    } catch (err) {
      const msg = err.message || "Registration failed. Try again.";
      setError(msg);
      toast.error(msg);
      setTurnstileToken(""); // force re-verify on error
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setCodeError("");
    setVerifying(true);

    try {
      const data = await verify(email, code);
      const apiKey = data.api_key;
      if (!apiKey) { throw new Error("No API key returned"); }

      await setVerifiedSession(apiKey, email);
      toast.success("Account created!");
      router.push(redirect);
    } catch (err) {
      setCodeError(err.message || "Invalid code. Try again.");
    } finally {
      setVerifying(false);
    }
  }


  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-bg px-6">
      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-sm space-y-6"
          >
            <div className="text-center">
              <Link href="/" className="text-xl font-bold text-text hero-title">SwiftMail</Link>
              <h1 className="text-heading text-[clamp(1.6rem,4vw,2rem)] text-text mt-6 mb-1">Create your account</h1>
              <p className="text-sm text-muted">Start with a free inbox instantly</p>
            </div>

            <form onSubmit={handleSignup} className="glass p-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">Email</label>
                <div className="nm-concave-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Mail size={16} className="text-muted shrink-0" />
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="flex-1 bg-transparent text-sm text-text placeholder:text-muted outline-none" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">Password</label>
                <div className="nm-concave-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Lock size={16} className="text-muted shrink-0" />
                  <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" className="flex-1 bg-transparent text-sm text-text placeholder:text-muted outline-none" />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1.5">Confirm password</label>
                <div className="nm-concave-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Lock size={16} className="text-muted shrink-0" />
                  <input id="confirmPassword" type="password" required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password" className="flex-1 bg-transparent text-sm text-text placeholder:text-muted outline-none" />
                </div>
              </div>

              {error && <p className="text-sm text-danger text-center">{error}</p>}

              {/* Turnstile — must pass before submitting */}
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />

              <button type="submit" disabled={submitting || !turnstileToken}
                className="nm-btn-accent w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {submitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href={`/login${redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-accent hover:text-accent-dim font-medium">Sign in</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm space-y-6"
          >
            <div className="text-center">
              <div className="nm-convex w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail size={28} className="text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-text hero-title mb-1">Check your email</h1>
              <p className="text-sm text-muted">
                We sent a verification code to{" "}
                <span className="text-text font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="glass p-6 space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-text mb-1.5">
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full nm-concave-sm rounded-xl px-4 py-2.5 bg-transparent text-center text-2xl font-mono font-bold text-text tracking-[0.3em] placeholder:text-muted/30 outline-none"
                />
              </div>

              {codeError && <p className="text-sm text-danger text-center">{codeError}</p>}

              <button type="submit" disabled={verifying}
                className="nm-btn-accent w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                {verifying ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {verifying ? "Verifying..." : "Verify & continue"}
              </button>
            </form>

            <button onClick={() => setStep("form")} disabled={submitting}
              className="nm-btn w-full py-2.5 text-sm font-medium text-text flex items-center justify-center gap-2 disabled:opacity-50">
              <ArrowLeft size={16} /> Back to signup
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
