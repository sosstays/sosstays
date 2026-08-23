"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { PlatformIcon, type Platform } from "@/components/PlatformIcons";

type Step = {
  title: string;
  bullets: string[];
  image: string;
};

const STEPS: Step[] = [
  {
    title: "Listing & pricing",
    bullets: [
      "Multi-platform listings, written and photographed",
      "Dynamic pricing tuned to local demand",
      "Calendar and minimum-stay strategy",
    ],
    image:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Guest experience",
    bullets: [
      "Guest screening and verified check-in",
      "Cross-sell to local experiences and tours",
      "Local-area guides written for each stay",
      "Review recovery and repeat-guest offers",
    ],
    image:
      "https://images.unsplash.com/photo-1698399480539-327a5f6975f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Property management",
    bullets: [
      "Cleaning and turnover coordination",
      "Maintenance callouts and trusted trades",
      "Linen, consumables and restocking",
      "Monthly owner statements and payouts",
    ],
    image:
      "https://images.unsplash.com/photo-1737442886747-9fb768b96ed2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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

const COMMISSION_RATE = 15;
const AUTO_ADVANCE_MS = 4200;

// Scroll-entrance timing: the stepper wipes open left-to-right over
// STEPPER_REVEAL_MS. Each card's image arrives just after the wipe reaches
// its tab — tabs sit at 0%, 50%, 100% of the row's width, not evenly split
// into thirds, so delays are computed from that position (plus a small lag
// so the image visibly follows the line rather than appearing with it).
const STEPPER_REVEAL_MS = 2200;
const CARD_REVEAL_LAG_MS = 200;
const CARD_REVEAL_DELAYS_MS = STEPS.map(
  (_, i) => Math.round((STEPPER_REVEAL_MS * i) / (STEPS.length - 1)) + CARD_REVEAL_LAG_MS,
);

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
      }, CARD_REVEAL_DELAYS_MS[i]),
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const current = hover ?? active;

  return (
    <section className="bg-maroon px-8 py-24 sm:px-14 sm:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:gap-12">
        {/* INTRO + PRICING */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <span className="block h-px w-6 bg-light-sage" />
              <span className="text-xs font-semibold tracking-widest text-light-sage uppercase">
                For property owners
              </span>
            </div>
            <h2 className="font-serif text-4xl leading-[1.05] font-bold tracking-tight text-cream text-balance sm:text-5xl">
              We sell the break, not just the booking
            </h2>
            <p className="max-w-[52ch] text-[16.5px] leading-relaxed text-cream/85 text-pretty">
              Sos Stays builds a guest-facing brand around your property — promoting Ireland and the
              local area, driving direct bookings, and turning one-off stays into repeat guests. Most
              Airbnb management companies simply list and wait. We market the break itself.
            </p>
          </div>

          <div className="flex flex-col rounded-[18px] bg-cream p-8 text-near-black">
            <span className="text-xs font-semibold tracking-widest text-maroon uppercase">
              Commission-based pricing
            </span>
            <div className="mt-5 flex items-baseline gap-2.5">
              <span className="font-serif text-6xl leading-[0.9] font-semibold text-maroon sm:text-7xl">
                From {COMMISSION_RATE}%
              </span>
            </div>
            <span className="mt-2.5 text-sm font-medium text-forest-green">of your rental revenue</span>
            <div className="my-6 h-px bg-sage-grey/50" />
            <p className="text-sm leading-relaxed text-near-black/75">
              Your exact commission depends on property type and location — coastal cottages, city
              apartments and multi-unit portfolios are priced differently.
            </p>
            <Button
              link="/landlords-whats-next"
              variant="secondary"
              color="maroon"
              animateBgColor="maroon"
              animateColor="cream"
              size="custom"
              className="mt-6 self-start px-6.5 py-3.5 text-sm font-semibold"
            >
              Get an estimate
            </Button>
          </div>
        </div>

        {/* STEPPER */}
        <div ref={stepperRef} className="flex flex-col gap-7" onMouseLeave={() => setPaused(false)}>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-widest text-light-sage uppercase">
              How it works
            </span>
            <h3 className="font-serif text-2xl font-semibold text-cream sm:text-[28px]">
              What we take care of, start to finish
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
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
                  {i < STEPS.length - 1 && (
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
                    src={step.image}
                    alt={step.title}
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
        <div className="flex flex-col gap-6 border-t border-cream/20 pt-7">
          <div className="flex flex-col gap-1">
            <span className="font-serif text-[22px] font-semibold text-cream">
              Earn more with multiple platforms
            </span>
            <span className="text-[13.5px] text-cream/70">
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
