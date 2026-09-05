"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { LogOut, User, ArrowLeft, Inbox } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const bgRef = useRef(null);
  const didRedirect = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !didRedirect.current) {
      didRedirect.current = true;
      toast.error("Sign in to access the dashboard.");
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    let frame;
    let angle = 0;
    function animate() {
      angle += 0.003;
      if (bgRef.current) {
        bgRef.current.style.background = `
          radial-gradient(ellipse at ${50 + Math.sin(angle) * 25}% ${50 + Math.cos(angle) * 15}%, rgba(59,130,246,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at ${30 + Math.cos(angle * 0.7) * 20}% ${70 + Math.sin(angle * 0.5) * 20}%, rgba(59,130,246,0.04) 0%, transparent 50%),
          var(--bg)
        `;
      }
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted">
        Redirecting...
      </div>
    );
  }

  return (
    <div ref={bgRef} className="flex-1 flex flex-col transition-[background] duration-1000">
      <header className="sticky top-0 z-50 navbar-glass flex items-center justify-between h-14 px-6 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-text tracking-tight hero-title">
            SwiftMail
          </Link>
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors ml-2"
          >
            <Inbox size={14} />
            Back to inbox
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted">
            <div className="nm-icon-circle w-7 h-7">
              <User size={14} className="text-accent" />
            </div>
            <span className="text-text font-medium">{user?.email}</span>
            <span className="nm-badge text-[10px] px-2 py-0.5 bg-accent/10 text-accent font-semibold">
              {user?.plan?.toUpperCase()}
            </span>
          </div>
          <button onClick={logout}
            className="nm-btn p-2 text-muted hover:text-danger transition-colors"
            aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <DashboardSidebar />
        <div className="flex-1 min-w-0 relative">
          <div className="sm:hidden px-6 pt-3">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-dim font-medium">
              <ArrowLeft size={14} /> Back to inbox
            </Link>
          </div>
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
