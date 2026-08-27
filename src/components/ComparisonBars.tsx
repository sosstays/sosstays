"use client";

import { useEffect, useState } from "react";

// Two horizontal bars comparing the cost of booking direct vs. through a
// platform, scaled so "direct" = 100 and "platform" = 100 + savingsPercent.
// Bars render at their final width immediately and only animate in as a
// progressive enhancement — same safe-default pattern as Reveal/CountUp, so
// nothing ever gets stuck at 0 width if IntersectionObserver doesn't fire.
export function ComparisonBars({
  savingsPercent,
  note,
}: {
  savingsPercent: number;
  note?: string | null;
}) {
  const directPct = (100 / (100 + savingsPercent)) * 100;
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [widths, setWidths] = useState({ direct: directPct, platform: 100 });

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
        setWidths({ direct: 0, platform: 0 });
        requestAnimationFrame(() => setWidths({ direct: directPct, platform: 100 }));
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, directPct]);

  return (
    <div ref={setNode} className="flex flex-col gap-6.5">
      <div>
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-semibold tracking-[0.14em] text-cream uppercase">Booked direct</span>
          <span className="text-[13px] text-cream/60">what the stay costs</span>
        </div>
        <div className="h-5.5 overflow-hidden rounded-full bg-cream/12">
          <div
            className="h-full rounded-full bg-light-sage transition-[width] duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${widths.direct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-semibold tracking-[0.14em] text-cream uppercase">
            Booked via a platform
          </span>
          <span className="text-[13px] text-cream/60">+{savingsPercent}% commission</span>
        </div>
        <div className="flex h-5.5 overflow-hidden rounded-full bg-cream/12">
          <div
            className="h-full bg-light-sage transition-[width] duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${widths.direct}%` }}
          />
          <div
            className="h-full transition-[width] delay-[400ms] duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: `${widths.platform - widths.direct}%`,
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(254,254,227,0.5) 0 6px, rgba(254,254,227,0.24) 6px 12px)",
            }}
          />
        </div>
      </div>
      {note && <p className="text-sm leading-relaxed text-cream/60">{note}</p>}
    </div>
  );
}
