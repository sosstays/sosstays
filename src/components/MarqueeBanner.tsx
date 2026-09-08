"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type MarqueeBannerProps = {
  items: ReactNode[];
  className: string;
  itemClassName: string;
  separator?: ReactNode;
  /** Pixels per second. Duration is derived from this and the content's
   * actual width, so different item sets all scroll at the same felt
   * speed instead of sharing one fixed duration. */
  speed?: number;
};

// Shared scrolling ticker used below page heroes (e.g. the funtasia-style
// area page ticker and the landlords "the gap" banner). See the
// `sos-marquee` keyframe in globals.css.
export function MarqueeBanner({
  items,
  className,
  itemClassName,
  separator,
  speed = 40,
}: MarqueeBannerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(26);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    if (halfWidth > 0) setDuration(halfWidth / speed);
  }, [items, speed]);

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div
        ref={trackRef}
        className="sos-marquee flex w-max"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((rep) => (
          <div
            key={rep}
            aria-hidden={rep === 1}
            className={`flex items-center whitespace-nowrap ${itemClassName}`}
          >
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-11">
                <span>{item}</span>
                {separator}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
