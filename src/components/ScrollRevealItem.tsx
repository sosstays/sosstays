"use client";

import { useEffect, useRef, type ReactNode } from "react";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// A list item whose visibility follows the scroll position: it fades and
// rises in as it comes up from the bottom of the screen, and fades away
// again as it nears the top, so items appear one at a time while
// scrolling rather than all at once. Styles are written straight to the
// element (no React state) to keep scrolling smooth. Without JavaScript,
// or with reduced motion turned on, the item is simply visible.
export function ScrollRevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // In: from just inside the bottom edge up to three-quarters down.
      const enter = clamp01((vh * 0.96 - rect.top) / (vh * 0.22));
      // Out: as the card's top climbs into the heading's zone.
      const exit = clamp01((rect.top - vh * 0.2) / (vh * 0.14));
      const visible = Math.min(enter, exit);
      el.style.opacity = String(visible);
      el.style.transform = `translateY(${(1 - enter) * 48}px) scale(${0.96 + 0.04 * enter})`;
      // Keep faded-out cards from catching clicks or keyboard focus.
      el.style.visibility = visible < 0.02 ? "hidden" : "visible";
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
