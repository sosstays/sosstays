import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const HEADING = "Planning more than one stay?";
const TEXT =
  "Tell us your dates, group size and what you want to do — we'll connect our houses into one bespoke Irish itinerary, routes, tee times, days out and all.";

// Shared sitewide CTA for /bespoke-ireland-trip — same deep-forest band +
// tiled brand-mark pattern as the landing-page template's "FINAL CTA"
// section (src/app/[slug]/page.tsx), pulled out so it can be dropped into
// any page without duplicating that markup. `variant="compact"` is a
// smaller card for tight spaces (the blog sidebar) instead of a full-width
// band.
export function BespokeTripCta({ variant = "band" }: { variant?: "band" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="relative overflow-hidden rounded-[14px] bg-deep-forest p-7 text-center">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/images/sos-mark-pattern.svg')", backgroundSize: "120px", backgroundRepeat: "repeat" }}
        />
        <div className="relative">
          <h3 className="font-serif text-xl leading-[1.15] font-bold tracking-tight text-cream">{HEADING}</h3>
          <p className="mx-auto mt-3 text-[14px] leading-relaxed text-light-sage">{TEXT}</p>
          <div className="mt-5 flex flex-col gap-2.5">
            <Link
              href="/bespoke-ireland-trip"
              className="inline-flex items-center justify-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-deep-forest transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(0,0,0,0.28)]"
            >
              Plan your Ireland trip
            </Link>
            <Link
              href="/contact?topic=About+a+booking#contact-form"
              className="inline-flex items-center justify-center rounded-full border border-cream/55 px-6 py-2.5 text-sm font-medium text-cream transition-colors duration-200 hover:bg-cream/14"
            >
              Ask us a question
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-8 sm:px-14">
      <Reveal className="relative overflow-hidden rounded-[18px] bg-deep-forest px-8 py-20 text-center sm:px-16">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/images/sos-mark-pattern.svg')", backgroundSize: "150px", backgroundRepeat: "repeat" }}
        />
        <div className="relative mx-auto max-w-[660px]">
          <h2 className="font-serif text-[clamp(2rem,3.8vw,3.25rem)] leading-[1.06] font-bold tracking-tight text-cream">
            {HEADING}
          </h2>
          <p className="mx-auto mt-5 max-w-[50ch] text-[17px] leading-relaxed text-light-sage">{TEXT}</p>
          <div className="mt-8.5 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/bespoke-ireland-trip"
              className="inline-flex items-center rounded-full bg-cream px-8.5 py-4.5 text-base font-semibold text-deep-forest transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.3)]"
            >
              Plan your Ireland trip
            </Link>
            <Link
              href="/contact?topic=About+a+booking#contact-form"
              className="inline-flex items-center rounded-full border border-cream/55 px-8 py-4 text-base font-medium text-cream transition-colors duration-200 hover:bg-cream/14"
            >
              Ask us a question
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
