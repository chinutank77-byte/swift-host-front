"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NeumorphicSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);      // trigger button
  const dropdownRef = useRef(null); // portal dropdown list

  const calcRect = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const scrollX = window.scrollX ?? window.pageXOffset ?? 0;
    const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
    setRect({
      top: r.bottom + scrollY + 4,
      left: r.left + scrollX,
      width: r.width,
    });
  }, []);

  const toggle = () => {
    if (!open) calcRect();
    setOpen((v) => !v);
  };

  // close on outside click (ignore clicks inside button or dropdown)
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e) {
      const insideBtn = btnRef.current?.contains(e.target);
      const insideDropdown = dropdownRef.current?.contains(e.target);
      if (!insideBtn && !insideDropdown) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // close on page scroll (but NOT when scrolling inside the dropdown)
  useEffect(() => {
    if (!open) return;
    function onScroll(e) {
      // if the scroll originated inside the dropdown, ignore it
      if (dropdownRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    // capture: true so we catch scroll on any element before it bubbles
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", calcRect);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", calcRect);
    };
  }, [open, calcRect]);

  const selected = options.find(
    (opt) => (typeof opt === "object" ? opt.value : opt) === value
  );
  const label =
    typeof selected === "object"
      ? selected.label
      : selected || placeholder || "Select";

  return (
    <div className={`relative ${className || ""}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className="w-full nm-input flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer"
        aria-label={ariaLabel || placeholder}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={`truncate ${selected ? "text-text" : "text-muted"}`}>
          {label}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown size={16} className="text-muted shrink-0" />
        </motion.span>
      </button>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && rect && (
              <motion.ul
                ref={dropdownRef}
                role="listbox"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.13, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  zIndex: 9999,
                }}
                className="nm-convex rounded-xl py-1 max-h-56 nm-scrollbar overflow-y-auto"
              >
                {options.map((opt) => {
                  const val = typeof opt === "object" ? opt.value : opt;
                  const lab = typeof opt === "object" ? opt.label : opt;
                  const isActive = val === value;

                  return (
                    <li key={val} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(val);
                          setOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-accent-bg text-accent font-semibold"
                            : "text-text hover:bg-surface/40"
                        }`}
                      >
                        {lab}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
