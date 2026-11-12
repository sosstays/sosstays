"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import type { PublicCorporateStayProperty } from "@/lib/corporateStayProperties";

const ADVANCE_MS = 5000;

function formatPrice(pricePerPersonPerNight: number | null): string {
  if (pricePerPersonPerNight === null) return "Price on request";
  return `From €${Math.round(pricePerPersonPerNight)}/night, per person`;
}

// Cross-sell to corporate/crew bookers from an area guide page — one
// property shown at a time, auto-advancing, pause on hover. Same Supabase
// source as CorporateStayPropertyCarousel, just a single-card presentation
// to fit this split hero-style layout rather than a multi-card row.
export function CorporateStaysAreaCta({
  properties,
  id,
}: {
  properties: PublicCorporateStayProperty[];
  id?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || properties.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % properties.length);
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, properties.length]);

  if (properties.length === 0) return null;

  const property = properties[index];

  return (
    <section id={id || "corporate-stays"} className="bg-maroon px-8 py-20 sm:px-14 sm:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-3.5 text-xs font-bold tracking-widest text-sage-grey uppercase">
            For crews and project teams
          </p>
          <h2 className="font-serif mb-4 text-[28px] leading-[1.25] font-bold tracking-tight text-cream sm:text-[34px]">
            Working nearby? Booking for a crew or project team?
          </h2>
          <p className="mb-7 max-w-[38ch] text-[15px] leading-relaxed text-cream/75">
            One invoice, one contact, monthly minimum.
          </p>
          <Button link="/corporate-stays#brief" variant="primary" bgColor="cream" color="maroon" animateColor="maroon">
            Send your SOS
          </Button>
        </div>

        <div
          className="rounded-2xl bg-cream p-5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-52 w-full overflow-hidden rounded-[10px] bg-sage-grey/20 sm:h-60">
            {property.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element -- owner-submitted URL, any host
              <img
                key={property.id}
                src={property.photos[0]}
                alt={property.propertyName}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-lg font-bold text-maroon">{property.propertyName}</h3>
            <p className="mt-1 text-sm text-near-black/60">
              {[property.area, property.county].filter(Boolean).join(", ") || "Ireland"}
              {property.maxGuestsStandard ? ` · Sleeps ${property.maxGuestsStandard}` : ""}
            </p>
            <p className="mt-1 text-sm font-semibold text-maroon">{formatPrice(property.pricePerPersonPerNight)}</p>
          </div>

          {properties.length > 1 && (
            <div className="mt-5 flex justify-center gap-[7px]">
              {properties.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Show ${p.propertyName}`}
                  onClick={() => setIndex(i)}
                  className="h-[7px] cursor-pointer rounded-full transition-all"
                  style={{
                    width: i === index ? "16px" : "7px",
                    background: i === index ? "var(--maroon)" : "rgba(71,45,48,0.2)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
