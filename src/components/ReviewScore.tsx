"use client";

import { useEffect, useRef, useState } from "react";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);

  return { ref, inView };
}

function scoreLabel(score: number): string {
  if (score >= 9) return "Superb";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  if (score >= 6) return "Pleasant";
  return "Fair";
}

export function RatingBar({
  title,
  value,
  max = 10,
}: {
  title: string;
  value: number;
  max?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  const percent = Math.min((animatedValue / max) * 100, 100);

  return (
    <div ref={ref}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[15px] text-near-black">{title}</span>
        <span className="text-[15px] font-semibold tabular-nums text-near-black">
          {animatedValue.toFixed(1)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-sage-grey/25">
        <div
          className="h-full rounded-full bg-forest-green"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function ReviewScoreCard({
  score,
  reviewCount,
  categories,
}: {
  score?: number | null;
  reviewCount?: number | null;
  categories?: { label: string; value: number }[] | null;
}) {
  if (!score) return null;

  return (
    <div className="rounded-[10px] border border-sage-grey/40 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-11 min-w-11 items-center justify-center rounded-[8px] bg-forest-green px-2.5 text-lg font-bold text-cream">
            {score.toFixed(1)}
          </span>
          <div>
            <p className="font-serif text-lg font-bold text-near-black">{scoreLabel(score)}</p>
            {reviewCount ? (
              <p className="text-sm text-near-black/55">{reviewCount} reviews</p>
            ) : null}
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-forest-green">
          We aim for 100% real reviews
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 16v-5M12 8h.01" />
          </svg>
        </p>
      </div>

      {categories && categories.length > 0 && (
        <>
          <div className="my-6 border-t border-sage-grey/40" />
          <p className="mb-5 text-sm font-semibold text-near-black">Categories:</p>
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-3">
            {categories.map((category) => (
              <RatingBar key={category.label} title={category.label} value={category.value} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
