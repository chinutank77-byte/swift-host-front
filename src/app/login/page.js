"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirect, setRedirect] = useState("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redir = params.get("redirect");
      if (redir) {
        setRedirect(redir);
      }
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push(redirect);
    } catch (err) {
      const msg = err.message || "Invalid credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-bg px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <Link href="/" className="text-xl font-bold text-text hero-title">SwiftMail</Link>
          <h1 className="text-heading text-[clamp(1.6rem,4vw,2rem)] text-text mt-6 mb-1">Welcome back</h1>
          <p className="text-sm text-muted">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
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
              <input id="password" type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="flex-1 bg-transparent text-sm text-text placeholder:text-muted outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="text-muted hover:text-text transition-colors shrink-0">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-danger text-center">{error}</p>}

          <button type="submit" disabled={submitting}
            className="nm-btn-accent w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href={`/signup${redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-accent hover:text-accent-dim font-medium">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
