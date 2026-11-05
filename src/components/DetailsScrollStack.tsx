"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plane, Home, Camera, Flag, Compass, Car, type LucideIcon } from "lucide-react";

// Icon components can't cross the server→client boundary as props (they're
// functions), so callers pass a name and this client component resolves it
// itself.
const ICONS: Record<string, LucideIcon> = { Plane, Home, Camera, Flag, Compass, Car };

export type DetailItem = {
  label: string;
  icon: keyof typeof ICONS;
  imageUrl: string;
  imageAlt: string;
};

// Each card's scattered resting position, in viewport units (vw/vh) rather
// than percent — CSS `translate()` percentages resolve against the
// element's OWN box size, not the viewport, so they'd barely move a ~180px
// card. vw/vh give a consistent, dramatic spread regardless of card size.
// Loosely matches the reference scattered-polaroid layout; index-matched
// to the `items` prop.
const SCATTER = [
  { x: -17, y: -19, rotate: -7 },
  { x: 16, y: -17, rotate: 5 },
  { x: -22, y: 3, rotate: 4 },
  { x: 21, y: 9, rotate: -5 },
  { x: -13, y: 23, rotate: 6 },
  { x: 14, y: 25, rotate: -4 },
] as const;

// Where every card converges to — a tight stack sitting just above the
// heading — and how far it shrinks.
const CONVERGE = { x: 0, y: -23, scale: 0.42 };

type PinState = {
  progress: number;
  /** "before": not yet reached. "pinned": held fixed over the viewport
   *  while the wrapper scrolls through. "after": wrapper has scrolled
   *  past, content resting at the wrapper's own bottom. */
  mode: "before" | "pinned" | "after";
};

// Tracks scroll through a tall wrapper and reports a 0–1 progress plus a
// three-way pin state, so the caller can fix its content over the viewport
// while "pinned" — same progress math as ItineraryTimeline.tsx
// (getBoundingClientRect + scroll listener), but driving a manual
// fixed/absolute toggle instead of relying on CSS `position: sticky`.
// Sticky doesn't work here: every page wraps its content in a
// `overflow-x-hidden` <main>, and setting overflow on only one axis forces
// the other to `auto`, which makes that <main> a scrolling container that
// sticky positions against instead of the viewport.
function usePinnedScroll(ref: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<PinState>({ progress: 0, mode: "before" });
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reduceMotion) {
      setState({ progress: 1, mode: "after" });
      return;
    }
    function onScroll() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = Math.max(1, rect.height - vh);
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const mode: PinState["mode"] = rect.top > 0 ? "before" : rect.bottom < vh ? "after" : "pinned";
      setState({ progress, mode });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const raf = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, reduceMotion]);

  return state;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// "We Take Care of Every Detail" — a pinned section whose scattered photo
// cards converge into a tight stack above the heading as it scrolls
// through view.
export function DetailsScrollStack({
  eyebrow,
  heading,
  headingAccent,
  items,
}: {
  eyebrow?: string;
  heading: string;
  /** Rendered in the accent color right after `heading`, on its own if it wraps. */
  headingAccent: string;
  items: DetailItem[];
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { progress, mode } = usePinnedScroll(wrapperRef);
  // Eased so the converge motion settles rather than tracking scroll 1:1.
  const eased = 1 - Math.pow(1 - progress, 2);

  const innerStyle: React.CSSProperties =
    mode === "pinned"
      ? { position: "fixed", top: 0, left: 0, width: "100%", height: "100vh" }
      : mode === "after"
        ? { position: "absolute", bottom: 0, left: 0, width: "100%", height: "100vh" }
        : { position: "absolute", top: 0, left: 0, width: "100%", height: "100vh" };

  return (
    <div ref={wrapperRef} className="relative h-[260vh]">
      <div
        className="flex flex-col items-center justify-center overflow-hidden bg-cream px-8 sm:px-14"
        style={innerStyle}
      >
        <div className="relative flex w-full max-w-5xl flex-1 items-center justify-center">
          {items.map((item, i) => {
            const scatter = SCATTER[i % SCATTER.length];
            const x = lerp(scatter.x, CONVERGE.x, eased);
            const y = lerp(scatter.y, CONVERGE.y, eased);
            const rotate = lerp(scatter.rotate, 0, eased);
            const scale = lerp(1, CONVERGE.scale, eased);
            const Icon = ICONS[item.icon];
            return (
              <div
                key={item.label}
                className="absolute flex w-[168px] flex-none flex-col gap-2 sm:w-[188px]"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) translate(${x}vw, ${y}vh) rotate(${rotate}deg) scale(${scale})`,
                  zIndex: 10 + i,
                  transition: "transform 80ms linear",
                }}
              >
                <div className="flex items-center gap-2 rounded-full border border-sage-grey/40 bg-bright-cream px-3 py-1.5 shadow-sm">
                  <span className="flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full bg-forest-green/12 text-forest-green">
                    <Icon size={13} strokeWidth={2.2} />
                  </span>
                  <span className="truncate text-[12px] font-semibold text-near-black">{item.label}</span>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] border border-sage-grey/40 shadow-[0_10px_26px_rgba(0,0,0,0.14)]">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="190px"
                    className="object-cover"
                  />
                </div>
              </div>
            );
          })}

          <div
            className="relative z-0 w-full max-w-[640px] text-center"
            style={{
              opacity: lerp(0.35, 1, eased),
              transform: `scale(${lerp(0.94, 1, eased)})`,
            }}
          >
            {eyebrow && (
              <p className="mb-3.5 text-[13px] font-semibold tracking-[0.2em] text-forest-green/80 uppercase">
                {eyebrow}
              </p>
            )}
            <h2 className="font-serif text-[clamp(2rem,5vw,3.6rem)] leading-[1.05] font-bold tracking-tight text-near-black">
              {heading} <span className="text-maroon">{headingAccent}</span>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
