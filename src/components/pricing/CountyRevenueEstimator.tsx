import { RevenueCalculator } from "@/components/RevenueCalculator";

// Shared "get your own numbers" section used on every /pricing/[county]
// page — live, expanding, and NI alike. Reuses the site's one revenue
// calculator rather than a bespoke lead-capture form, so results are
// real projections instead of "we'll get back to you" copy.
export function CountyRevenueEstimator({ countyName }: { countyName: string }) {
  return (
    <div id="estimate" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-[11.5px] font-semibold tracking-[0.14em] text-maroon uppercase">
          Get your own numbers
        </span>
        <h2 className="m-0 font-serif text-2xl leading-[1.15] font-bold text-forest-green sm:text-[28px]">
          What could your Co. {countyName} property actually earn?
        </h2>
        <p className="m-0 max-w-[62ch] text-[14.5px] leading-relaxed text-near-black">
          Already running an Airbnb, or currently renting long-term? A couple of minutes of
          questions gets you a real, honest estimate for your specific property — not a county
          average.
        </p>
      </div>
      <RevenueCalculator />
    </div>
  );
}
