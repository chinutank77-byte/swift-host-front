"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/api", label: "API" },
  { href: "/docs", label: "Docs" },
  { href: "/domains", label: "Domains" },
  { href: "/open-inbox", label: "Open Inbox" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // load theme on mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  // apply theme class to html element
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <header className="sticky top-0 z-50 navbar-glass">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-semibold text-text tracking-tight hero-title">
            SwiftMail
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-accent font-semibold"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 nm-concave-sm rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="nm-btn px-4 py-1.5 text-sm font-medium text-text">
                  Dashboard
                </Link>
                <button onClick={logout} className="px-3 py-1.5 text-sm text-muted hover:text-danger transition-colors flex items-center gap-1 cursor-pointer">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="nm-btn px-4 py-1.5 text-sm font-medium text-text">
                  Sign In
                </Link>
                <Link href="/signup" className="nm-btn-accent px-4 py-1.5 text-sm font-medium inline-block">
                  Sign Up
                </Link>
              </>
            )}
            {/* Theme toggle button */}
            <button onClick={toggleTheme} className="p-2 rounded-full text-muted hover:text-text cursor-pointer transition-colors" aria-label="Toggle theme">
              {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-muted hover:text-text" aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 border-t border-border/30">
                <nav className="flex flex-col gap-1 pt-3">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive ? "text-accent font-semibold bg-accent-bg" : "text-muted hover:text-text"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="flex items-center gap-3 pt-3 border-t border-border/30 mt-2">
                    {isAuthenticated ? (
                      <>
                        <Link href="/dashboard" onClick={() => setOpen(false)}
                          className="nm-btn px-4 py-2 text-sm font-medium text-text">Dashboard</Link>
                        <button onClick={() => { logout(); setOpen(false); }}
                          className="px-3 py-1.5 text-sm text-muted hover:text-danger transition-colors flex items-center gap-1 cursor-pointer">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setOpen(false)}
                          className="nm-btn px-4 py-2 text-sm font-medium text-text">Sign In</Link>
                        <Link href="/signup" onClick={() => setOpen(false)}
                          className="nm-btn-accent px-4 py-2 text-sm font-medium inline-block">Sign Up</Link>
                      </>
                    )}
                    {/* Theme toggle button in mobile menu */}
                    <button onClick={toggleTheme} className="p-2 rounded-full text-muted hover:text-text cursor-pointer transition-colors ml-auto" aria-label="Toggle theme">
                      {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
