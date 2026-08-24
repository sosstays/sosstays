"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { PlatformIcon, type Platform } from "@/components/PlatformIcons";
import { urlFor } from "@/sanity/image";

type SanityImageWithAlt = { alt?: string } & Record<string, unknown>;

export type HostsModuleStep = {
  title: string;
  bullets: string[];
  image: SanityImageWithAlt;
};

// Shape of the `hostsModule` singleton, as returned by HOSTS_MODULE_QUERY.
// The platform logos in the marquee are bespoke SVG components (see
// PlatformIcons.tsx), not editorial content, so they aren't part of this —
// PLATFORMS below stays hardcoded.
export type HostsModuleData = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  commissionRate?: number;
  commissionLabel?: string;
  commissionSuffix?: string;
  commissionNote?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  stepperEyebrow?: string;
  stepperHeading?: string;
  steps?: HostsModuleStep[];
  marqueeHeading?: string;
  marqueeSubtext?: string;
};

const PLATFORMS: { label: string; platform: Platform | "sosStays" }[] = [
  { label: "Airbnb", platform: "airbnb" },
  { label: "Booking.com", platform: "booking" },
  { label: "Vrbo", platform: "vrbo" },
  { label: "Expedia", platform: "expedia" },
  { label: "TripAdvisor", platform: "tripadvisor" },
  { label: "Sos Stays direct", platform: "sosStays" },
];

const AUTO_ADVANCE_MS = 4200;

// Scroll-entrance timing: the stepper wipes open left-to-right over
// STEPPER_REVEAL_MS. Each card's image arrives just after the wipe reaches
// its tab — tabs sit at 0%, 50%, 100% of the row's width, not evenly split
// into thirds, so delays are computed from that position (plus a small lag
// so the image visibly follows the line rather than appearing with it).
const STEPPER_REVEAL_MS = 2200;
const CARD_REVEAL_LAG_MS = 200;

// Fires `onEnter` once, the first time `ref`'s element crosses `threshold`
// into the viewport. Reduced-motion users skip straight to the "entered"
// state — no observer, no animation to wait on.
function useRevealOnce<T extends HTMLElement>(
  ref: RefObject<T | null>,
  threshold: number,
  onEnter: () => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onEnter();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnter();
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function HostsModule({ data }: { data: HostsModuleData | null }) {
  const steps = data?.steps ?? [];

  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionInView, setSectionInView] = useState(false);
  useRevealOnce(sectionRef, 0.15, () => setSectionInView(true));

  const stepperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>(() => steps.map(() => false));
  useRevealOnce(stepperRef, 0.3, () => {
    setInView(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(steps.map(() => true));
    }
  });

  const marqueeRef = useRef<HTMLDivElement>(null);
  const [marqueeInView, setMarqueeInView] = useState(false);
  useRevealOnce(marqueeRef, 0.4, () => setMarqueeInView(true));

  const cardRevealDelaysMs = useMemo(
    () =>
      steps.map(
        (_, i) => Math.round((STEPPER_REVEAL_MS * i) / Math.max(steps.length - 1, 1)) + CARD_REVEAL_LAG_MS,
      ),
    [steps.length],
  );

  useEffect(() => {
    if (paused || steps.length === 0) return;
    const timer = setInterval(() => {
      setActive((a) => (a + 1) % steps.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, steps.length]);

  useEffect(() => {
    if (!inView) return;
    const timers = steps.map((_, i) =>
      setTimeout(() => {
        setRevealed((r) => {
          if (r[i]) return r;
          const next = [...r];
          next[i] = true;
          return next;
        });
      }, cardRevealDelaysMs[i]),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (!data || steps.length === 0) return null;

  const current = hover ?? active;

  return (
    <section className="bg-maroon px-8 py-24 sm:px-14 sm:py-28">
      <div ref={sectionRef} className="mx-auto flex max-w-6xl flex-col gap-10 sm:gap-12">
        {/* INTRO + PRICING */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <div
            className="flex flex-col gap-5 transition-[opacity,transform] duration-700 ease-out"
            style={{
              opacity: sectionInView ? 1 : 0,
              transform: sectionInView ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {data.eyebrow && (
              <div className="flex items-center gap-2.5">
                <span className="block h-px w-6 bg-light-sage" />
                <span className="text-xs font-semibold tracking-widest text-light-sage uppercase">
                  {data.eyebrow}
                </span>
              </div>
            )}
            {data.heading && (
              <h2 className="font-serif text-4xl leading-[1.05] font-bold tracking-tight text-cream text-balance sm:text-5xl">
                {data.heading}
              </h2>
            )}
            {data.body && (
              <p className="max-w-[52ch] text-[16.5px] leading-relaxed text-cream/85 text-pretty">
                {data.body}
              </p>
            )}
          </div>

          <div
            className="flex flex-col rounded-[18px] bg-cream p-8 text-near-black transition-[opacity,transform] duration-700 ease-out"
            style={{
              opacity: sectionInView ? 1 : 0,
              transform: sectionInView ? "translateY(0)" : "translateY(20px)",
              transitionDelay: sectionInView ? "150ms" : "0ms",
            }}
          >
            {data.commissionLabel && (
              <span className="text-xs font-semibold tracking-widest text-maroon uppercase">
                {data.commissionLabel}
              </span>
            )}
            <div className="mt-5 flex items-baseline gap-2.5">
              <span className="font-serif text-6xl leading-[0.9] font-semibold text-maroon sm:text-7xl">
                From {data.commissionRate ?? 0}%
              </span>
            </div>
            {data.commissionSuffix && (
              <span className="mt-2.5 text-sm font-medium text-forest-green">{data.commissionSuffix}</span>
            )}
            <div className="my-6 h-px bg-sage-grey/50" />
            {data.commissionNote && (
              <p className="text-sm leading-relaxed text-near-black/75">{data.commissionNote}</p>
            )}
            {data.ctaLabel && (
              <Button
                link={data.ctaUrl || "/landlords-whats-next"}
                variant="secondary"
                color="maroon"
                animateBgColor="maroon"
                animateColor="cream"
                size="custom"
                className="mt-6 self-start px-6.5 py-3.5 text-sm font-semibold"
              >
                {data.ctaLabel}
              </Button>
            )}
          </div>
        </div>

        {/* STEPPER */}
        <div ref={stepperRef} className="flex flex-col gap-7" onMouseLeave={() => setPaused(false)}>
          {(data.stepperEyebrow || data.stepperHeading) && (
            <div
              className="flex flex-col gap-1.5 transition-[opacity,transform] duration-700 ease-out"
              style={{
                opacity: sectionInView ? 1 : 0,
                transform: sectionInView ? "translateY(0)" : "translateY(20px)",
                transitionDelay: sectionInView ? "300ms" : "0ms",
              }}
            >
              {data.stepperEyebrow && (
                <span className="text-xs font-semibold tracking-widest text-light-sage uppercase">
                  {data.stepperEyebrow}
                </span>
              )}
              {data.stepperHeading && (
                <h3 className="font-serif text-2xl font-semibold text-cream sm:text-[28px]">
                  {data.stepperHeading}
                </h3>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3.5">
            {steps.map((step, i) => {
              const isOn = current === i;
              const isDone = current > i;
              return (
                <div key={step.title} className="contents">
                  <button
                    onClick={() => {
                      setActive(i);
                      setHover(null);
                    }}
                    aria-label={step.title}
                    className="flex cursor-pointer items-center gap-2.5 bg-transparent transition-opacity duration-200"
                    style={{ opacity: isOn ? 1 : 0.62 }}
                  >
                    <span
                      className="flex h-6.5 w-6.5 flex-none items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200"
                      style={{
                        background: isOn ? "var(--cream)" : isDone ? "var(--light-sage)" : "transparent",
                        color: isOn || isDone ? "var(--maroon)" : "rgba(254,254,227,0.7)",
                        borderColor: isOn || isDone ? "transparent" : "rgba(254,254,227,0.4)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="hidden font-serif text-[19px] whitespace-nowrap transition-colors duration-200 lg:inline"
                      style={{ color: isOn ? "var(--cream)" : "rgba(254,254,227,0.6)" }}
                    >
                      {step.title}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className="relative h-px flex-1 border-t border-dashed border-cream/30">
                      <span
                        className="absolute -top-px left-0 h-px bg-light-sage transition-all duration-500 ease-out"
                        style={{ width: current > i ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 items-start gap-4.5 lg:grid-cols-3">
            {steps.map((step, i) => {
              const isOn = current === i;
              return (
                <div
                  key={step.title}
                  onClick={() => {
                    setActive(i);
                    setHover(null);
                  }}
                  onMouseEnter={() => {
                    setHover(i);
                    setPaused(true);
                  }}
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-[14px] bg-light-forest-green transition-[border-color,transform,opacity] duration-700 ease-out"
                  style={{
                    border: isOn ? "1px solid var(--light-sage)" : "1px solid var(--sage-grey)",
                    opacity: revealed[i] ? 1 : 0,
                    transform: revealed[i]
                      ? isOn
                        ? "translateY(-3px)"
                        : "none"
                      : "translateY(28px)",
                  }}
                >
                  <Image
                    src={urlFor(step.image).width(800).height(800).url()}
                    alt={step.image.alt ?? step.title}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />

                  {/* info overlay — only shown on hover/click, sized to the bullet text rather than a fixed height: it only covers as much of the image as the content needs, growing up to the full image on smaller cards where the text needs more room */}
                  <div
                    className="absolute inset-x-0 bottom-0 flex max-h-full flex-col justify-end gap-2.5 overflow-hidden p-5 transition-opacity duration-300"
                    style={{
                      opacity: isOn ? 1 : 0,
                      pointerEvents: isOn ? "auto" : "none",
                      background: "var(--maroon)",
                    }}
                  >
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                      {step.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-[14px] leading-relaxed text-cream">
                          <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-light-sage" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MULTI-PLATFORM MARQUEE — below the "Earn more" copy, not beside it */}
        <div
          ref={marqueeRef}
          className="flex flex-col gap-6 border-t border-cream/20 pt-7 transition-[opacity,transform] duration-700 ease-out"
          style={{
            opacity: marqueeInView ? 1 : 0,
            transform: marqueeInView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {(data.marqueeHeading || data.marqueeSubtext) && (
            <div className="flex flex-col gap-1">
              {data.marqueeHeading && (
                <span className="font-serif text-[22px] font-semibold text-cream">
                  {data.marqueeHeading}
                </span>
              )}
              {data.marqueeSubtext && (
                <span className="text-[13.5px] text-cream/70">{data.marqueeSubtext}</span>
              )}
            </div>
          )}
          <div
            className="relative min-w-0 overflow-hidden"
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            }}
          >
            <div className="sos-marquee flex w-max items-center gap-10">
              {[...PLATFORMS, ...PLATFORMS].map(({ label, platform }, i) => (
                <span
                  key={`${label}-${i}`}
                  aria-hidden={i >= PLATFORMS.length}
                  className="flex items-center gap-3 text-base font-semibold whitespace-nowrap"
                  style={{ color: platform === "sosStays" ? "var(--light-sage)" : "var(--cream)" }}
                >
                  {platform === "sosStays" ? (
                    <Logo className="h-7 w-auto" />
                  ) : (
                    <PlatformIcon platform={platform} className="h-8 w-8" />
                  )}
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
