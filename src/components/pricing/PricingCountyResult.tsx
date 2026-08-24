import Link from "next/link";
import { Button } from "@/components/Button";
import { formatEuro } from "@/lib/revenueCalculator";
import type { County } from "@/lib/pricingCounties";
import { PricingEstimatorForm } from "@/components/pricing/PricingEstimatorForm";

const STR_RULES_URL = "/blog/str-rules-ireland-what-hosts-need-to-know";

export function CountyResult({ county }: { county: County }) {
  const isRoi = county.region === "roi";

  return (
    <div className="flex flex-col gap-8">
      {county.state === "live" && county.stats ? (
        <LiveStats countyName={county.name} stats={county.stats} />
      ) : (
        <ExpandingNotice county={county} />
      )}

      {isRoi ? <RulesTeaser /> : <NiRulesNote />}

      <PricingBand county={county} />

      <PricingEstimatorForm countyName={county.name} />
    </div>
  );
}

function LiveStats({
  countyName,
  stats,
}: {
  countyName: string;
  stats: NonNullable<County["stats"]>;
}) {
  return (
    <div className="rounded-[18px] border border-sage-grey/40 bg-light-forest-green/30 p-8">
      <div className="mb-5 flex items-center justify-center gap-2">
        <span className="h-2 w-2 rounded-full bg-forest-green" aria-hidden />
        <span className="text-xs font-semibold tracking-widest text-forest-green uppercase">
          Live data from properties we manage in {countyName}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <Stat label="Avg. nightly rate" value={formatEuro(stats.adr)} />
        <Stat label="Avg. occupancy" value={`${stats.occupancy}%`} />
        <Stat label="Avg. monthly revenue" value={formatEuro(stats.monthlyRevenue)} />
        <Stat label="Best month" value={stats.bestMonth} sub={`${stats.uplift} demand`} />
      </div>
      <p className="mt-5 text-center text-[11px] text-near-black/55">
        Figures reflect properties currently managed by Sos Stays in {countyName}; individual
        results vary by property, location and season.
      </p>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[10px] border border-sage-grey/30 bg-cream p-4 text-center">
      <p className="mb-1.5 text-[11px] font-medium tracking-wide text-near-black/60 uppercase">
        {label}
      </p>
      <p className="font-serif text-2xl text-maroon">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-near-black/55">{sub}</p>}
    </div>
  );
}

function ExpandingNotice({ county }: { county: County }) {
  return (
    <div className="rounded-[18px] border border-sage-grey/40 bg-cream p-8 text-center">
      <p className="mb-2 text-xs font-semibold tracking-widest text-maroon uppercase">
        Expanding into {county.name}
      </p>
      <p className="mx-auto max-w-[52ch] text-sm leading-relaxed text-near-black/70">
        We don&apos;t have managed properties in {county.name} yet, so we won&apos;t invent numbers
        for it — but we&apos;re actively taking on new hosts here. Tell us about your property
        below and we&apos;ll put together a real, personal estimate.
      </p>
    </div>
  );
}

function RulesTeaser() {
  return (
    <div className="rounded-[14px] border border-sage-grey/40 bg-cream p-6 sm:p-7">
      <p className="mb-2 text-xs font-semibold tracking-widest text-forest-green uppercase">
        New rules — Fáilte Ireland STL Register
      </p>
      <p className="text-sm leading-relaxed text-near-black/75">
        Short-term let hosts across the Republic of Ireland now need to register with Fáilte
        Ireland before listing, with local planning and Rent Pressure Zone rules layered on top
        depending on your property and county.
      </p>
      <Link href={STR_RULES_URL} className="mt-3 inline-block text-sm font-semibold text-forest-green underline">
        Read the full rules guide →
      </Link>
    </div>
  );
}

function NiRulesNote() {
  return (
    <div className="rounded-[14px] border border-sage-grey/40 bg-cream p-6 sm:p-7 text-center">
      <p className="text-sm leading-relaxed text-near-black/70">
        Northern Ireland runs a separate regulatory system to the Fáilte Ireland STL Register used
        in the Republic — it doesn&apos;t apply here. We&apos;ll walk you through what does apply
        for your property.
      </p>
    </div>
  );
}

function PricingBand({ county }: { county: County }) {
  return (
    <div className="rounded-[18px] bg-light-forest-green/40 p-8 text-center sm:p-10">
      <p className="mb-2 text-xs font-semibold tracking-widest text-forest-green uppercase">
        Full management
      </p>
      <p className="font-serif text-5xl font-semibold text-maroon sm:text-6xl">From 15%</p>
      <p className="mt-2 text-sm text-near-black/65">
        of your rental revenue — no setup fee, no monthly retainer, commission-only.
      </p>
      <Link href="/landlords" className="mt-5 inline-block text-sm font-semibold text-forest-green underline">
        See everything included in full management →
      </Link>
      <div className="mt-6 flex justify-center">
        <Button
          link="/landlords-whats-next"
          variant="primary"
          bgColor="maroon"
          color="cream"
          animateColor="maroon"
          size="custom"
          className="px-7 py-3.5 text-sm font-semibold"
        >
          Get Started in {county.name}
        </Button>
      </div>
    </div>
  );
}
