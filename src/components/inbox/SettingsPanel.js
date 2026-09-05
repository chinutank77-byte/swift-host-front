"use client";

import { useState } from "react";
import { ChevronDown, Bell, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [usernameLength, setUsernameLength] = useState(8);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  async function handleNotificationToggle() {
    if (!desktopNotifications && typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setDesktopNotifications(true);
      }
    } else {
      setDesktopNotifications(false);
    }
  }

  return (
    <div className="glass overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-text hover:bg-surface/30 transition-colors cursor-pointer select-none"
      >
        <span>Settings</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-border/40 pt-4">
              <div>
                <label className="flex items-center justify-between text-sm text-text mb-2">
                  <span>Username length</span>
                  <span className="font-mono text-muted">{usernameLength}</span>
                </label>
                <div className="nm-concave-sm px-2 py-2 rounded-lg">
                  <input
                    type="range"
                    min={6}
                    max={16}
                    value={usernameLength}
                    onChange={(e) => setUsernameLength(Number(e.target.value))}
                    className="w-full accent-accent h-1 rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="nm-icon-circle w-8 h-8">
                    <Bell size={14} className="text-accent" />
                  </div>
                  <span className="text-sm text-text">Desktop notifications</span>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  role="switch"
                  aria-checked={desktopNotifications}
                  className={`relative w-10 h-6 transition-colors nm-toggle ${desktopNotifications ? "nm-toggle-on" : ""}`}
                >
                  <motion.span
                    className="absolute top-0.5 nm-toggle-knob w-5 h-5"
                    animate={{ left: desktopNotifications ? "1.125rem" : "0.125rem" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="nm-icon-circle w-8 h-8">
                    <Volume2 size={14} className="text-accent" />
                  </div>
                  <span className="text-sm text-text">Sound on new email</span>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  role="switch"
                  aria-checked={soundEnabled}
                  className={`relative w-10 h-6 transition-colors nm-toggle ${soundEnabled ? "nm-toggle-on" : ""}`}
                >
                  <motion.span
                    className="absolute top-0.5 nm-toggle-knob w-5 h-5"
                    animate={{ left: soundEnabled ? "1.125rem" : "0.125rem" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
