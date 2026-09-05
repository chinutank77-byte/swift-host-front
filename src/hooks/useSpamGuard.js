import { useRef, useCallback, useState } from "react";

/**
 * useSpamGuard — detects rapid repeated actions.
 *
 * @param {object} opts
 * @param {number} opts.threshold  - number of actions before flagging as spam (default 3)
 * @param {number} opts.windowMs   - sliding window in ms (default 60_000)
 *
 * Returns:
 *   record()     — call on each action attempt
 *   isSpamming   — true when threshold exceeded within window
 *   reset()      — clear history (call after Turnstile passes)
 */
export function useSpamGuard({ threshold = 3, windowMs = 60_000 } = {}) {
  const timestamps = useRef([]);
  const [isSpamming, setIsSpamming] = useState(false);

  const record = useCallback(() => {
    const now = Date.now();
    // prune entries outside the window
    timestamps.current = timestamps.current.filter(
      (t) => now - t < windowMs
    );
    timestamps.current.push(now);

    if (timestamps.current.length >= threshold) {
      setIsSpamming(true);
    }
  }, [threshold, windowMs]);

  const reset = useCallback(() => {
    timestamps.current = [];
    setIsSpamming(false);
  }, []);

  return { record, isSpamming, reset };
}
