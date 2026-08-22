"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { PlatformIcon, type Platform } from "@/components/PlatformIcons";

type Step = {
  title: string;
  bullets: string[];
};

const STEPS: Step[] = [
  {
    title: "Listing & pricing",
    bullets: [
      "Multi-platform listings, written and photographed",
      "Dynamic pricing tuned to local demand",
      "Calendar and minimum-stay strategy",
    ],
  },
  {
    title: "Guest experience",
    bullets: [
      "Guest screening and verified check-in",
      "Cross-sell to local experiences and tours",
      "Local-area guides written for each stay",
      "Review recovery and repeat-guest offers",
    ],
  },
  {
    title: "Property management",
    bullets: [
      "Cleaning and turnover coordination",
      "Maintenance callouts and trusted trades",
      "Linen, consumables and restocking",
      "Monthly owner statements and payouts",
    ],
  },
];

const PLATFORMS: { label: string; platform: Platform | "sosStays" }[] = [
  { label: "Airbnb", platform: "airbnb" },
  { label: "Booking.com", platform: "booking" },
  { label: "Vrbo", platform: "vrbo" },
  { label: "Expedia", platform: "expedia" },
  { label: "TripAdvisor", platform: "tripadvisor" },
  { label: "Sos Stays direct", platform: "sosStays" },
];

const COMMISSION_RATE = 12;
const AUTO_ADVANCE_MS = 4200;

// Scroll-entrance timing: the stepper wipes open over STEPPER_REVEAL_MS,
// and each card's image arrives just after the wipe passes its tab.
const STEPPER_REVEAL_MS = 900;
const CARD_REVEAL_STEP_MS = STEPPER_REVEAL_MS / STEPS.length;

export function HostsModule() {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const stepperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>(() => STEPS.map(() => false));

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((a) => (a + 1) % STEPS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const el = stepperRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setInView(true);
      setRevealed(STEPS.map(() => true));
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const timers = STEPS.map((_, i) =>
      setTimeout(() => {
        setRevealed((r) => {
          if (r[i]) return r;
          const next = [...r];
          next[i] = true;
          return next;
        });
      }, CARD_REVEAL_STEP_MS * (i + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const current = hover ?? active;

  return (
    <section className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
      <div className="flex flex-col gap-10 sm:gap-12">
        {/* INTRO + PRICING */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <span className="block h-px w-6 bg-maroon" />
              <span className="text-xs font-semibold tracking-widest text-maroon uppercase">
                For property owners
              </span>
            </div>
            <h2 className="font-serif text-4xl leading-[1.05] font-bold tracking-tight text-forest-green text-balance sm:text-5xl">
              We sell the break, not just the booking
            </h2>
            <p className="max-w-[52ch] text-[16.5px] leading-relaxed text-near-black text-pretty">
              Sos Stays builds a guest-facing brand around your property — promoting Ireland and the
              local area, driving direct bookings, and turning one-off stays into repeat guests. Most
              Airbnb management companies simply list and wait. We market the break itself.
            </p>
            <div className="mt-1 flex flex-wrap gap-2.5">
              {["Direct-booking site", "Local destination content", "Repeat-guest programme"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-sage-grey bg-light-forest-green px-3.5 py-1.5 text-[13px] font-medium text-forest-green"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col rounded-[18px] bg-maroon p-8 text-cream">
            <span className="text-xs font-semibold tracking-widest text-light-sage uppercase">
              Commission-based pricing
            </span>
            <div className="mt-5 flex items-baseline gap-2.5">
              <span className="font-serif text-6xl leading-[0.9] font-semibold text-cream sm:text-7xl">
                From {COMMISSION_RATE}%
              </span>
            </div>
            <span className="mt-2.5 text-sm font-medium text-light-sage">of your rental revenue</span>
            <div className="my-6 h-px bg-cream/20" />
            <p className="text-sm leading-relaxed text-cream/80">
              Your exact commission depends on property type and location — coastal cottages, city
              apartments and multi-unit portfolios are priced differently.
            </p>
            <Button
              link="#estimate"
              variant="secondary"
              color="cream"
              animateBgColor="cream"
              animateColor="maroon"
              size="custom"
              className="mt-6 self-start px-6.5 py-3.5 text-sm font-semibold"
            >
              Get an estimate
            </Button>
          </div>
        </div>

        {/* STEPPER */}
        <div ref={stepperRef} className="flex flex-col gap-5" onMouseLeave={() => setPaused(false)}>
          <div
            className="flex items-center gap-3.5"
            style={{
              clipPath: inView ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
              transition: `clip-path ${STEPPER_REVEAL_MS}ms cubic-bezier(.22,.61,.36,1)`,
            }}
          >
            {STEPS.map((step, i) => {
              const isOn = current === i;
              const isDone = current > i;
              return (
                <div key={step.title} className="contents">
                  <button
                    onClick={() => {
                      setActive(i);
                      setHover(null);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 bg-transparent transition-opacity duration-200"
                    style={{ opacity: isOn ? 1 : 0.62 }}
                  >
                    <span
                      className="flex h-6.5 w-6.5 flex-none items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200"
                      style={{
                        background: isOn ? "var(--maroon)" : isDone ? "var(--light-sage)" : "transparent",
                        color: isOn ? "var(--cream)" : "var(--forest-green)",
                        borderColor: isOn ? "var(--maroon)" : isDone ? "var(--light-sage)" : "var(--sage-grey)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="font-serif text-[19px] whitespace-nowrap transition-colors duration-200"
                      style={{ color: isOn ? "var(--maroon)" : "var(--forest-green)" }}
                    >
                      {step.title}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="relative h-px flex-1 border-t border-dashed border-sage-grey">
                      <span
                        className="absolute -top-px left-0 h-px bg-forest-green transition-all duration-500 ease-out"
                        style={{ width: current > i ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-3">
            {STEPS.map((step, i) => {
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
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-[14px] bg-light-forest-green transition-[border-color,transform,opacity] duration-500 ease-out"
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
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-forest-green/50">
                    {step.title} photo
                  </div>

                  {/* info overlay — only shown on hover/click, per square image */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end gap-2.5 p-5 transition-opacity duration-300"
                    style={{
                      opacity: isOn ? 1 : 0,
                      pointerEvents: isOn ? "auto" : "none",
                      background: isOn
                        ? "linear-gradient(to top, rgba(71,45,48,0.96) 0%, rgba(71,45,48,0.86) 55%, rgba(71,45,48,0.35) 100%)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-6.5 w-6.5 flex-none items-center justify-center rounded-full border text-xs font-semibold"
                        style={{
                          background: "var(--light-sage)",
                          color: "var(--maroon)",
                          borderColor: "var(--light-sage)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <h3 className="font-serif text-lg font-semibold text-cream">{step.title}</h3>
                    </div>
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                      {step.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-[12.5px] leading-snug text-cream">
                          <span className="font-bold text-light-sage">—</span>
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
        <div className="flex flex-col gap-6 border-t border-sage-grey pt-7">
          <div className="flex flex-col gap-1">
            <span className="font-serif text-[22px] font-semibold text-forest-green">
              Earn more with multiple platforms
            </span>
            <span className="text-[13.5px] text-near-black/70">
              One calendar, synced across every channel your guests book on.
            </span>
          </div>
          <div
            className="relative min-w-0 overflow-hidden"
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            }}
          >
            <div className="sos-marquee flex w-max gap-2.5">
              {[...PLATFORMS, ...PLATFORMS].map(({ label, platform }, i) => (
                <span
                  key={`${label}-${i}`}
                  aria-hidden={i >= PLATFORMS.length}
                  className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
                  style={
                    platform === "sosStays"
                      ? { background: "var(--light-forest-green)", borderColor: "var(--light-sage)", color: "var(--maroon)" }
                      : { background: "var(--cream)", borderColor: "var(--sage-grey)", color: "var(--forest-green)" }
                  }
                >
                  {platform === "sosStays" ? (
                    <Logo className="h-4 w-auto" />
                  ) : (
                    <PlatformIcon platform={platform} className="h-4 w-4" />
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
