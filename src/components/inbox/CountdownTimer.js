"use client";

import { useState, useEffect } from "react";
import { useInbox } from "@/components/providers/InboxProvider";
import { formatRemaining } from "@/lib/utils";

export default function CountdownTimer() {
  const { activeInbox } = useInbox();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!activeInbox) return;
    function tick() {
      const diff = (activeInbox.expiryTimestamp || 0) - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeInbox, activeInbox?.expiryTimestamp]);

  if (!activeInbox) return null;

  if (remaining <= 0) {
    return (
      <p className="text-sm text-center text-danger glass-sm px-4 py-2 inline-block mx-auto">
        This inbox has expired. Generate a new one.
      </p>
    );
  }

  const label = formatRemaining(remaining);
  const isUrgent = remaining < 5 * 60 * 1000;

  return (
    <p
      className={`text-sm text-center font-mono ${
        isUrgent ? "text-danger glass-sm px-4 py-2 inline-block" : "text-muted"
      }`}
    >
      Expires in {label}
    </p>
  );
}
