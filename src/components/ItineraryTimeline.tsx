"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";

type ItineraryItem = {
  time?: string | null;
  title: string;
  description?: string | null;
};

type ItineraryDay = {
  dayLabel: string;
  items?: ItineraryItem[] | null;
};

// A two-column vertical timeline with a progress line down the left edge
// that fills in as the section scrolls through view.
export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [trackHeight, setTrackHeight] = useState(reduceMotion ? 100 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(1, (vh * 0.7 - rect.top) / Math.max(1, rect.height * 0.78))
      );
      setTrackHeight(progress * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const raf = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={containerRef}
      className="relative grid grid-cols-1 gap-14 sm:grid-cols-2"
    >
      <div className="absolute top-3 bottom-3 left-[5px] w-0.5 bg-sage-grey/40" />
      <div
        className="absolute top-3 left-[5px] w-0.5 bg-forest-green transition-[height] duration-200 ease-linear"
        style={{ height: `${trackHeight}%` }}
      />

      {days.map((day) => (
        <div key={day.dayLabel} className="flex flex-col gap-8 pl-10">
          <Reveal>
            <div className="text-[13px] font-semibold tracking-[0.2em] text-maroon uppercase">
              {day.dayLabel}
            </div>
          </Reveal>
          {(day.items ?? []).map((item, i) => (
            <Reveal key={`${item.title}-${i}`} delay={80 * (i + 1)} className="relative">
              <span className="absolute -left-10 top-1.5 h-3 w-3 rounded-full border-2 border-cream bg-forest-green" />
              {item.time && (
                <div className="font-serif text-sm font-bold text-light-sage">{item.time}</div>
              )}
              <div className="mt-1 font-serif text-lg font-bold text-near-black">{item.title}</div>
              {item.description && (
                <p className="mt-1.5 text-[15px] leading-relaxed text-near-black/70">
                  {item.description}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  );
}
