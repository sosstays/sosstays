"use client";

import { useEffect, useRef, type ReactNode } from "react";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// A list item that fades and rises into place as it scrolls up from the
// bottom of the screen, tied to the scroll position — so a stack of them
// builds up one by one on the way down and ends with every item visible,
// and unwinds the same way on the way back up. Styles are written straight
// to the element (no React state) to keep scrolling smooth. Without
// JavaScript, or with reduced motion turned on, the item is simply visible.
export function ScrollRevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const apply = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // From the bottom edge to fully in place a fifth of the way up the
      // screen — early enough that the last card has finished arriving
      // while the whole stack is still on screen.
      const progress = clamp01((vh - rect.top) / (vh * 0.2));
      el.style.opacity = String(progress);
      el.style.transform = `translateY(${(1 - progress) * 56}px) scale(${0.95 + 0.05 * progress})`;
      // A card that has faded out shouldn't catch clicks or keyboard focus.
      el.style.visibility = progress < 0.02 ? "hidden" : "visible";
    };

    // Driven by a running rAF loop (not the scroll event) while the item is
    // anywhere near the viewport, so every frame — scrolling down or back up
    // — recomputes from the element's actual position. A plain scroll-event
    // listener can miss ticks during fast or momentum scrolling, which is
    // what made the fade-out on the way back up look like it wasn't
    // happening at all.
    let raf = 0;
    const loop = () => {
      apply();
      raf = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(loop);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          apply(); // settle to the correct resting state once the loop stops
        }
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    observer.observe(el);
    apply();

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <li ref={ref} className={className} style={{ willChange: "opacity, transform" }}>
      {children}
    </li>
  );
}
