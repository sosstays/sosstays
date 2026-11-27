import Link from "next/link";

// Same deep-forest, pattern-tiled compact card as BespokeTripCta's
// "compact" variant, generalised so the blog sidebar can run several of
// these in a row (bespoke trips, gifts, partners) without duplicating the
// markup for each one.
export function SidebarPromoCard({
  heading,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  heading: string;
  text: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[14px] bg-deep-forest p-7 text-center">
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "url('/images/sos-mark-pattern.svg')", backgroundSize: "120px", backgroundRepeat: "repeat" }}
      />
      <div className="relative">
        <h3 className="font-serif text-xl leading-[1.15] font-bold tracking-tight text-cream">{heading}</h3>
        <p className="mx-auto mt-3 text-[14px] leading-relaxed text-light-sage">{text}</p>
        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-deep-forest transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(0,0,0,0.28)]"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-full border border-cream/55 px-6 py-2.5 text-sm font-medium text-cream transition-colors duration-200 hover:bg-cream/14"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
