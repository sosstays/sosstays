"use client";

import { useEffect, useState } from "react";

// A floating "book direct" bar that slides in once the visitor scrolls past
// roughly one viewport height — a persistent low-friction CTA for long,
// scroll-heavy campaign pages.
export function StickyBookingBar({
  title,
  meta,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  meta: string[];
  ctaLabel: string;
  ctaHref: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", onScroll, { passive: true });
    const raf = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-cream/10 bg-deep-forest/95 px-8 py-3.5 backdrop-blur-md transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-14"
      style={{ transform: visible ? "translateY(0)" : "translateY(120%)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className="font-serif text-lg font-bold text-cream">{title}</span>
          {meta.map((item) => (
            <span key={item} className="text-sm text-cream/70">
              {item}
            </span>
          ))}
        </div>
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-cream px-6.5 py-3 text-sm font-semibold text-deep-forest transition-transform duration-200 hover:-translate-y-0.5"
        >
          {ctaLabel} →
        </a>
      </div>
    </div>
  );
}
