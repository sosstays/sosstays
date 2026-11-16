"use client";

import { useEffect, useRef, type ReactNode } from "react";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// A list item that fades and rises into place as it scrolls up from the
// bottom of the screen, following the scroll position, and then stays put
// — so a stack of them builds up one by one and ends with every item
// visible. Styles are written straight to the element (no React state) to
// keep scrolling smooth. Without JavaScript, or with reduced motion turned
// on, the item is simply visible.
export function ScrollRevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    // Furthest the item has got so far: once revealed it never fades back.
    let reached = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // From the bottom edge to fully in place a fifth of the way up the
      // screen — early enough that the last card has finished arriving
      // while the whole stack is still on screen.
      reached = Math.max(reached, clamp01((vh - rect.top) / (vh * 0.2)));
      el.style.opacity = String(reached);
      el.style.transform = `translateY(${(1 - reached) * 56}px) scale(${0.95 + 0.05 * reached})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <li ref={ref} className={className} style={{ willChange: "opacity, transform" }}>
      {children}
    </li>
  );
}
