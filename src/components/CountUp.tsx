"use client";

import { useEffect, useState } from "react";

// Animates a number counting up from 0 when it scrolls into view, as a
// progressive enhancement — but only if it wasn't already visible at mount
// (otherwise the correct number would visibly flash down to 0 first).
// Starts from the correct final value by default, so the number is never
// wrong: if IntersectionObserver never fires for some reason, it simply
// never animates rather than staying stuck at 0.
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [node, setNode] = useState<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let resolved = false;
    let firstCallback = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasFirstCallback = firstCallback;
        firstCallback = false;
        if (!entry.isIntersecting || resolved) return;
        resolved = true;
        observer.disconnect();
        if (wasFirstCallback) return; // already in view at mount — no flash-to-zero
        const t0 = performance.now();
        const span = 1150;
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / span);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(to * eased);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, to]);

  return (
    <span ref={setNode}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
