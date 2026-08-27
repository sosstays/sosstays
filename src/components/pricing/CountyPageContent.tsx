"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { Button } from "@/components/Button";
import { FaqSection } from "@/components/FaqSection";
import { CountyRevenueEstimator } from "@/components/pricing/CountyRevenueEstimator";
import { formatEuro } from "@/lib/revenueCalculator";
import { buildGenericCountyFaqs, mergeCountyFaqs } from "@/lib/countyFaqs";
import type { County } from "@/lib/pricingCounties";

// This design was approved with Poppins as the body font — a deliberate
// departure from the rest of the site's Inter body font, scoped to just
// this component rather than changed globally. Flagged for the team to
// decide if it should become the site-wide sans font later.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins-live-county",
});

const STR_RULES_URL = "/blog/str-rules-ireland-what-hosts-need-to-know";

const EASE = "cubic-bezier(.22,.61,.36,1)";

// Mirrors the design's mount-triggered (not scroll-triggered) reveal —
// this is the page a visitor lands on directly after picking a county, so
// content should animate in immediately rather than wait for scroll.
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useMountReveal() {
  const [shown, setShown] = useState(prefersReducedMotion);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, []);
  return shown;
}

// Cubic ease-out count-up, 0→1, matching the design's timer-driven
// animation (240ms lead-in, 1.5s duration).
function useCountUp(durationMs = 1500, delayMs = 240) {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0));
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const start = Date.now() + delayMs;
    const tick = () => {
      const e = Math.min(1, Math.max(0, (Date.now() - start) / durationMs));
      setProgress(1 - Math.pow(1 - e, 3));
      if (e < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, delayMs]);
  return progress;
}

function rise(shown: boolean, delayMs: number) {
  return {
    transition: `opacity 700ms ease-out ${delayMs}ms, transform 760ms ${EASE} ${delayMs}ms`,
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(18px)",
  } as const;
}

function grow(shown: boolean, pct: string, durationMs: number, delayMs: number) {
  return {
    transition: `width ${durationMs}ms ${EASE} ${delayMs}ms`,
    width: shown ? pct : "0%",
  } as const;
}

// The Louth design, used as the one template for every /pricing/[county]
// page. Every section below is conditional on the data actually existing
// for that county — a county without a countyPricingStats doc (or without
// drivers/realExample/faqs on it) simply skips that section rather than
// showing an empty or fabricated version of it. See the
// honesty-in-projections principle: never render placeholder numbers.
export function CountyPageContent({ county }: { county: County }) {
  const shown = useMountReveal();
  const p = useCountUp();
  const isRoi = county.region === "roi";
  const stats = county.stats;
  const hasDrivers = Boolean(stats?.drivers && stats.drivers.length > 0);
  const hasExample = Boolean(stats?.realExample);
  // The generic template always applies — a county-specific Sanity faqs
  // list adds to it rather than replacing it, so a county never loses the
  // baseline questions just for having its own addition.
  const faqs = mergeCountyFaqs(buildGenericCountyFaqs(county.name, county.region), stats?.faqs ?? []);

  return (
    <div className={`${poppins.className} flex flex-col gap-16 sm:gap-20 lg:gap-[84px]`}>
      <Hero county={county} shown={shown} />
      {stats && <StatStrip stats={stats} p={p} shown={shown} />}
      <PricingBandLive countyName={county.name} shown={shown} />
      {(hasDrivers || hasExample) && (
        <DriversAndExample
          countyName={county.name}
          drivers={hasDrivers ? stats!.drivers : []}
          example={hasExample ? stats!.realExample : undefined}
          shown={shown}
        />
      )}
      {isRoi ? <RulesTimeline shown={shown} /> : <NiRulesNote />}
      <div className="-mx-6 sm:-mx-10">
        <FaqSection
          heading={`Co. ${county.name} hosting questions, answered`}
          items={faqs}
          accent="forest-green"
          maxWidth="100%"
        />
      </div>
      <CountyRevenueEstimator countyName={county.name} />
    </div>
  );
}

function Hero({ county, shown }: { county: County; shown: boolean }) {
  const isLive = county.state === "live";
  return (
    <div className="relative isolate overflow-hidden pt-2">
      <div
        aria-hidden
        className="absolute -top-[70px] -right-5 h-[220px] w-[220px] opacity-50 [animation:sos-mark-spin_90s_linear_infinite] sm:-top-[140px] sm:h-[420px] sm:w-[420px]"
        style={{
          background: "var(--light-sage)",
          maskImage: "url(/logo-varient-sm.svg)",
          WebkitMaskImage: "url(/logo-varient-sm.svg)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[44ch] flex-col gap-4">
          <div className="flex items-center gap-2.5" style={rise(shown, 0)}>
            <span className="block h-px w-[26px] bg-maroon" />
            <span className="text-xs font-semibold tracking-[0.14em] text-maroon uppercase">
              Step 2 · Your area
            </span>
          </div>
          <h2
            className="m-0 font-serif text-[36px] leading-[1.05] font-bold tracking-[-0.02em] text-forest-green sm:text-[44px] lg:text-[54px] lg:leading-none"
            style={rise(shown, 80)}
          >
            Short-term rental pricing &amp; earnings
            <br />
            <span className="text-maroon">Co. {county.name}</span>
          </h2>
          <div className="flex items-center gap-2.5" style={rise(shown, 160)}>
            <span className="relative block h-[9px] w-[9px] flex-none">
              <span
                className="absolute inset-0 block rounded-full"
                style={{ background: isLive ? "var(--forest-green)" : "var(--sage-grey)" }}
              />
              {isLive && (
                <span className="absolute inset-0 block rounded-full border border-forest-green [animation:sos-live-ping_2.4s_ease-out_infinite]" />
              )}
            </span>
            <span
              className="text-[13.5px] font-medium"
              style={{ color: isLive ? "var(--forest-green)" : "#5a6157" }}
            >
              {isLive
                ? "Live Sos Stays performance data for this county"
                : `We're expanding into Co. ${county.name} — no managed properties here yet`}
            </span>
          </div>
        </div>
        <Link
          href="/pricing"
          style={rise(shown, 220)}
          className="rounded-full border border-sage-grey/60 bg-cream px-5 py-2.5 text-[13px] font-medium text-forest-green transition-colors hover:border-light-sage hover:bg-light-forest-green/40"
        >
          ← Change area
        </Link>
      </div>
    </div>
  );
}

function StatStrip({
  stats,
  p,
  shown,
}: {
  stats: NonNullable<County["stats"]>;
  p: number;
  shown: boolean;
}) {
  const { realExample } = stats;
  const upliftCell = realExample
    ? {
        value: `${(Math.round(((realExample.afterOccupancy - realExample.beforeOccupancy) / realExample.beforeOccupancy) * 100) * p).toFixed(1)}%`,
        label: (
          <>
            Occupancy uplift, real Sos Stays property{" "}
            <span className="font-normal text-near-black/55">
              ({realExample.beforeLabel} → {realExample.afterLabel})
            </span>
          </>
        ),
        barPct: "94%",
        rowDelay: 340,
        barDelay: 620,
      }
    : null;

  const cells = [
    {
      value: formatEuro(stats.adr * p),
      label: (
        <>
          Local market ADR <span className="font-normal text-near-black/55">(AirDNA)</span>
        </>
      ),
      barPct: "64%",
      rowDelay: 100,
      barDelay: 320,
    },
    {
      value: `${(stats.occupancy * p).toFixed(1)}%`,
      label: "Avg local comp-set occupancy",
      barPct: "58%",
      rowDelay: 180,
      barDelay: 420,
    },
    {
      value: formatEuro(stats.annualRevenue * p),
      label: "Avg annual revenue, comparable local listings",
      barPct: "78%",
      rowDelay: 260,
      barDelay: 520,
    },
    ...(upliftCell ? [upliftCell] : []),
  ];

  const cols = cells.length >= 4 ? "sm:grid-cols-4" : cells.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div>
      <div className={`grid grid-cols-2 border-t border-b border-sage-grey/60 ${cols}`}>
        {cells.map((cell, i) => {
          const mobileRightCol = i % 2 === 1;
          const mobileTopRow = i < cells.length - (cells.length % 2 === 0 ? 2 : 1);
          const desktopLastCol = i === cells.length - 1;
          return (
            <div
              key={i}
              className={`flex flex-col gap-3 px-4 py-6 sm:py-[34px] sm:pr-[30px] sm:pl-[30px] ${
                mobileRightCol ? "border-r-0" : "border-r"
              } ${desktopLastCol ? "sm:border-r-0" : "sm:border-r"} ${
                mobileTopRow ? "border-b" : "border-b-0"
              } sm:border-b-0 border-sage-grey/60 ${i === 0 ? "sm:pl-0" : ""}`}
              style={rise(shown, cell.rowDelay)}
            >
              <span className="font-serif text-3xl leading-none text-maroon [font-variant-numeric:tabular-nums] sm:text-4xl">
                {cell.value}
              </span>
              <span className="text-[12.5px] leading-relaxed font-medium text-forest-green">{cell.label}</span>
              <span className="relative block h-0.5 overflow-hidden bg-forest-green/[0.18]">
                <span className="absolute inset-y-0 left-0 block bg-forest-green" style={grow(shown, cell.barPct, 900, cell.barDelay)} />
              </span>
            </div>
          );
        })}
      </div>
      <p className="mx-auto mt-5 max-w-[96ch] text-[12.5px] leading-relaxed text-near-black/60 text-pretty">
        {stats.statsSourceNote}
      </p>
    </div>
  );
}

function PricingBandLive({ countyName, shown }: { countyName: string; shown: boolean }) {
  // Dublin's higher property values put it on a wider commission band than
  // the rest of the counties — everywhere else quotes the same 20–30%.
  const commissionRange = countyName === "Dublin" ? "15–30%" : "20–30%";

  return (
    <div
      className="relative isolate grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[18px] bg-maroon p-6 sm:grid-cols-[1.25fr_1fr] sm:gap-[52px] sm:p-14"
      style={{ transition: "opacity 900ms ease-out 100ms", opacity: shown ? 1 : 0 }}
    >
      <div
        aria-hidden
        className="absolute -bottom-[100px] -left-16 h-[220px] w-[220px] opacity-30 [animation:sos-mark-spin-reverse_120s_linear_infinite] sm:-bottom-[150px] sm:-left-20 sm:h-[330px] sm:w-[330px]"
        style={{
          background: "var(--light-sage)",
          maskImage: "url(/logo-varient-sm.svg)",
          WebkitMaskImage: "url(/logo-varient-sm.svg)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      <div className="relative flex flex-col gap-3.5">
        <span className="text-[11.5px] font-semibold tracking-[0.14em] text-light-sage uppercase">
          Commission-based pricing — Co. {countyName}
        </span>
        <span
          className="font-serif text-[30px] leading-[1.1] text-cream sm:text-[38px] lg:text-[46px] lg:leading-[1.04]"
          style={{
            transition: `clip-path 1000ms ${EASE} 250ms`,
            clipPath: `inset(0 ${shown ? "0" : "100%"} 0 0)`,
          }}
        >
          From 15% of your rental revenue
        </span>
        <p className="m-0 max-w-[52ch] text-[14.5px] leading-relaxed text-cream/85">
          Exact commission depends on property type and exact location within the county. No setup
          fee, no monthly charge, no booking fee — you only pay when your property earns.
        </p>
      </div>
      <div className="relative flex flex-col items-start gap-4">
        <span className="text-[13px] leading-relaxed font-medium text-light-sage">
          Full listing, guest management, cleaning coordination and dynamic pricing included
        </span>
        <Button
          link="#estimate"
          variant="primary"
          bgColor="cream"
          color="maroon"
          animateColor="maroon"
          size="custom"
          className="px-7 py-[15px] text-[14.5px] font-semibold"
        >
          Get my free earnings estimate
        </Button>
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[11.5px] leading-relaxed text-cream/60">
            {commissionRange} commission, depending on property type and location.
          </p>
          <p className="m-0 text-[11.5px] leading-relaxed text-cream/60">
            Hosts typically see up to a 40% revenue uplift after switching to full management.
          </p>
        </div>
        <Link href="/landlords" className="text-[13px] text-cream/80 underline underline-offset-[3px]">
          See everything included in full management →
        </Link>
      </div>
    </div>
  );
}

function DriversAndExample({
  countyName,
  drivers,
  example,
  shown,
}: {
  countyName: string;
  drivers: string[];
  example: NonNullable<County["stats"]>["realExample"] | undefined;
  shown: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const hasDrivers = drivers.length > 0;
  const singleCol = !hasDrivers || !example;

  return (
    <div className={`grid grid-cols-1 items-start gap-10 ${singleCol ? "" : "lg:grid-cols-[1.1fr_0.9fr] lg:gap-14"}`}>
      {hasDrivers && (
        <div className="flex flex-col gap-1.5">
          <h3 className="m-0 mb-3.5 font-serif text-2xl font-semibold text-forest-green sm:text-[26px]">
            What drives pricing in Co. {countyName}
          </h3>
          {drivers.map((text, i) => {
            const on = hover === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="-mx-3 flex items-start gap-4 rounded-[10px] px-3 py-[15px]"
                style={{
                  borderTop: `1px solid ${i === 0 ? "transparent" : "var(--sage-grey)"}`,
                  transition: `background 240ms ease-out, transform 240ms ease-out, opacity 700ms ease-out ${150 + i * 90}ms`,
                  opacity: shown ? 1 : 0,
                  background: on ? "var(--light-forest-green)" : "transparent",
                  transform: on ? "translateX(4px)" : "none",
                }}
              >
                <span
                  className="w-[26px] flex-none pt-0.5 font-serif text-[15px] transition-colors duration-200"
                  style={{ color: on ? "var(--maroon)" : "var(--light-sage)" }}
                >
                  0{i + 1}
                </span>
                <span className="text-[14.5px] leading-relaxed text-near-black text-pretty">{text}</span>
              </div>
            );
          })}
        </div>
      )}

      {example && (
        <RealExampleCard countyName={countyName} example={example} shown={shown} />
      )}
    </div>
  );
}

function RealExampleCard({
  example,
  shown,
}: {
  countyName: string;
  example: NonNullable<NonNullable<County["stats"]>["realExample"]>;
  shown: boolean;
}) {
  const upliftPercent = Math.round(((example.afterOccupancy - example.beforeOccupancy) / example.beforeOccupancy) * 100);
  return (
    <div className="flex flex-col gap-4.5 rounded-[18px] bg-light-forest-green/60 p-6 sm:p-9">
      <span className="text-[11.5px] font-semibold tracking-[0.14em] text-maroon uppercase">
        A real example
      </span>
      <h3 className="m-0 font-serif text-xl leading-[1.2] font-semibold text-forest-green sm:text-[23px]">
        {example.propertyName}, {example.propertyLocation}
      </h3>
      <div className="flex flex-col gap-3.5">
        <ExampleBar label={example.beforeLabel} pct={example.beforeOccupancy} shown={shown} color="var(--light-sage)" delay={300} duration={1000} />
        <ExampleBar label={example.afterLabel} pct={example.afterOccupancy} shown={shown} color="var(--maroon)" delay={520} duration={1200} bold />
      </div>
      <p className="m-0 text-[13.5px] leading-relaxed text-near-black text-pretty">
        {example.note} Occupancy went from {example.beforeOccupancy}% to {example.afterOccupancy}%
        ({upliftPercent >= 0 ? "+" : ""}
        {upliftPercent}%) in the same period, year on year.
      </p>
    </div>
  );
}

function ExampleBar({
  label,
  pct,
  shown,
  color,
  delay,
  duration,
  bold,
}: {
  label: string;
  pct: number;
  shown: boolean;
  color: string;
  delay: number;
  duration: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-[74px] flex-none text-xs ${bold ? "font-semibold text-maroon" : "font-medium text-near-black/55"}`}>
        {label}
      </span>
      <span className="block h-[26px] flex-1 overflow-hidden rounded-[6px] bg-forest-green/[0.12]">
        <span
          className="block h-full rounded-[6px]"
          style={{ background: color, ...grow(shown, `${pct}%`, duration, delay) }}
        />
      </span>
      <span className="w-10 flex-none text-right text-sm font-semibold text-forest-green [font-variant-numeric:tabular-nums]">
        {pct}%
      </span>
    </div>
  );
}

function RulesTimeline({ shown }: { shown: boolean }) {
  const stages = [
    { dotBg: "var(--light-forest-green)", dotBorder: "var(--light-sage)", label: "Today", color: "var(--forest-green)", text: "We handle the practical steps with every managed property in this county.", delay: 200 },
    { dotBg: "var(--light-sage)", dotBorder: "var(--forest-green)", label: "1 Dec 2026", color: "var(--forest-green)", text: "Fáilte Ireland's Short-Term Letting Register opens for registration.", delay: 340 },
    { dotBg: "var(--maroon)", dotBorder: "var(--maroon)", label: "31 Dec 2026", color: "var(--maroon)", text: "Compliance deadline. Applies to the Republic of Ireland, not Northern Ireland.", delay: 480 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3.5">
        <div className="flex flex-col gap-2">
          <span className="text-[11.5px] font-semibold tracking-[0.14em] text-maroon uppercase">
            New rules — Republic of Ireland only
          </span>
          <h3 className="m-0 font-serif text-2xl font-semibold text-forest-green sm:text-[26px]">
            Short-term letting rules in Ireland are changing
          </h3>
        </div>
        <Link href={STR_RULES_URL} className="text-[13.5px] font-medium text-maroon underline underline-offset-[3px]">
          Read the full guide to the new rules →
        </Link>
      </div>
      <div className="relative px-1">
        <span className="absolute top-[11px] right-0 left-0 hidden h-px border-t border-dashed border-sage-grey/70 sm:block" />
        <span
          className="absolute top-[11px] left-0 hidden h-px bg-forest-green sm:block"
          style={grow(shown, "100%", 1400, 400)}
        />
        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stages.map((s) => (
            <div key={s.label} className="flex flex-col gap-3" style={rise(shown, s.delay)}>
              <span
                className="block h-[22px] w-[22px] rounded-full border"
                style={{ background: s.dotBg, borderColor: s.dotBorder }}
              />
              <span className="font-serif text-[19px]" style={{ color: s.color }}>
                {s.label}
              </span>
              <span className="max-w-[30ch] text-[13px] leading-relaxed text-near-black/60">{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NiRulesNote() {
  return (
    <div className="rounded-[14px] border border-sage-grey/40 bg-cream p-6 text-center sm:p-7">
      <p className="text-sm leading-relaxed text-near-black/70">
        Northern Ireland runs a separate regulatory system to the Fáilte Ireland STL Register used
        in the Republic — it doesn&apos;t apply here. We&apos;ll walk you through what does apply
        for your property.
      </p>
    </div>
  );
}
