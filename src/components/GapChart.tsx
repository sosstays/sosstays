"use client";

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["700"] });

// "The gap" revenue-comparison chart on the landlords landing page — draws
// its two curves in and fades the callout on scroll, same safe-default
// pattern as ComparisonBars/Reveal: renders fully visible immediately, and
// only animates in as a progressive enhancement so nothing gets stuck
// hidden if IntersectionObserver doesn't fire.
export function GapChart() {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(true);

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
        if (wasFirstCallback) return; // already in view at mount — no flash-to-undrawn
        setDrawn(false);
        requestAnimationFrame(() => setDrawn(true));
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return (
    <div ref={setNode} className="mt-7 -mx-2 overflow-x-auto sm:mx-0">
      <svg
        viewBox="0 0 1080 400"
        role="img"
        aria-label="Chart comparing managed and self-managed revenue across a season, with a 20 to 35 percent gap"
        className="block h-auto w-full min-w-[640px]"
      >
        <g stroke="#efe6e0" strokeWidth="1">
          <line x1="40" y1="40" x2="1040" y2="40" />
          <line x1="40" y1="130" x2="1040" y2="130" />
          <line x1="40" y1="220" x2="1040" y2="220" />
          <line x1="40" y1="310" x2="1040" y2="310" />
        </g>
        <path
          d="M40,300 C200,268 320,286 480,236 C640,186 800,214 1040,150 L1040,66 C800,138 640,104 480,146 C320,188 200,168 40,214 Z"
          fill="rgba(71,45,48,0.13)"
          style={{
            opacity: drawn ? 1 : 0,
            transition: "opacity 1100ms ease-out 900ms",
          }}
        />
        <path
          d="M40,300 C200,268 320,286 480,236 C640,186 800,214 1040,150"
          fill="none"
          stroke="rgba(71,45,48,0.34)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: drawn ? 0 : 1,
            transition: "stroke-dashoffset 1900ms cubic-bezier(0.22,1,0.36,1) 120ms",
          }}
        />
        <path
          d="M40,214 C200,168 320,188 480,146 C640,104 800,138 1040,66"
          fill="none"
          stroke="var(--maroon)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: drawn ? 0 : 1,
            transition: "stroke-dashoffset 2100ms cubic-bezier(0.22,1,0.36,1) 340ms",
          }}
        />
        <g
          style={{
            opacity: drawn ? 1 : 0,
            transition: "opacity 700ms ease-out 1700ms",
          }}
        >
          <line
            x1="700"
            y1="120"
            x2="700"
            y2="203"
            stroke="var(--maroon)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <circle cx="700" cy="120" r="5" fill="var(--maroon)" />
          <circle cx="700" cy="203" r="5" fill="rgba(71,45,48,0.4)" />
          <text
            x="716"
            y="158"
            fontSize="44"
            fontWeight="700"
            letterSpacing="-0.02em"
            fill="var(--maroon)"
            className={poppins.className}
          >
            20&ndash;35%
          </text>
          <text
            x="718"
            y="182"
            fontSize="14"
            fontWeight="600"
            letterSpacing="0.14em"
            fill="rgba(46,28,30,0.55)"
          >
            THE GAP WE CLOSE
          </text>
        </g>
        <g
          style={{
            opacity: drawn ? 1 : 0,
            transition: "opacity 700ms ease-out 1900ms",
          }}
        >
          <circle cx="1040" cy="66" r="9" fill="var(--maroon)" />
          <circle
            cx="1040"
            cy="66"
            r="9"
            fill="none"
            stroke="var(--maroon)"
            strokeWidth="1.5"
            className="sos-distance-pulse"
            style={{ transformOrigin: "1040px 66px" }}
          />
        </g>
        <g fontSize="15" fill="rgba(46,28,30,0.45)" fontWeight="600">
          <text x="40" y="352">
            Low season
          </text>
          <text x="500" y="352" textAnchor="middle">
            Shoulder
          </text>
          <text x="1040" y="352" textAnchor="end">
            Peak
          </text>
        </g>
      </svg>
    </div>
  );
}
