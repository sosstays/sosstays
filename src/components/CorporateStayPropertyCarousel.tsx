"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicCorporateStayProperty } from "@/lib/corporateStayProperties";

const ADVANCE_MS = 5000;

function formatPrice(pricePerPersonPerNight: number | null): string {
  if (pricePerPersonPerNight === null) return "Price on request";
  return `From €${Math.round(pricePerPersonPerNight)}/night, per person`;
}

// Public showcase of owner-sourced candidate properties for corporate/
// monthly-stay sourcing — same auto-advance/pause-on-hover pattern as the
// homepage's PropertyCarousel, but its own card: this data comes from
// Supabase (corporate_stay_properties), not Sanity, and only ever shows
// fields cleared for public display (see getPublicCorporateStayProperties).
export function CorporateStayPropertyCarousel({
  properties,
}: {
  properties: PublicCorporateStayProperty[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    function updatePerView() {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    }
    updatePerView();
    window.addEventListener("resize", updatePerView);
    return () => window.removeEventListener("resize", updatePerView);
  }, []);

  const maxIndex = Math.max(0, properties.length - perView);
  const canScroll = properties.length > perView;

  useEffect(() => {
    if (paused || !canScroll) return;
    const timer = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, canScroll, maxIndex]);

  // Resizing can leave `index` past the new `maxIndex` (e.g. going from 1
  // to 3 cards per view) — clamp it here for display rather than feeding it
  // back into state from an effect.
  const displayIndex = Math.min(index, maxIndex);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[0] as HTMLElement | undefined;
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    track.scrollTo({ left: displayIndex * (card.offsetWidth + gap), behavior: "smooth" });
  }, [displayIndex]);

  if (properties.length === 0) return null;

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div ref={trackRef} className="flex gap-5 overflow-x-hidden" style={{ scrollSnapType: "x mandatory" }}>
        {properties.map((property) => (
          <div
            key={property.id}
            className="w-full flex-none sm:w-[calc(50%-10px)] lg:w-[calc((100%-40px)/3)]"
            style={{ scrollSnapAlign: "start" }}
          >
            <article className="flex h-full flex-col overflow-hidden rounded-[16px] border border-sage-grey/40 bg-bright-cream">
              <div className="relative h-44 w-full bg-sage-grey/20">
                {property.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- owner-submitted URL, any host
                  <img src={property.photos[0]} alt={property.propertyName} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-serif text-lg font-bold text-maroon">{property.propertyName}</h3>
                <p className="text-sm text-near-black/60">
                  {[property.area, property.county].filter(Boolean).join(", ") || "Ireland"}
                </p>
                <p className="text-sm text-near-black/70">
                  {[
                    property.maxGuestsStandard && `${property.maxGuestsStandard} guests`,
                    property.bedrooms && `${property.bedrooms} bed`,
                    property.bathrooms && `${property.bathrooms} bath`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {property.description && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-near-black/65">{property.description}</p>
                )}
                <p className="mt-auto pt-2 text-sm font-semibold text-maroon">{formatPrice(property.pricePerPersonPerNight)}</p>
              </div>
            </article>
          </div>
        ))}
      </div>

      {canScroll && (
        <div className="mt-6 flex justify-center gap-[7px]">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to properties ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-[7px] w-[7px] cursor-pointer rounded-full transition-colors"
              style={{ background: i === displayIndex ? "var(--maroon)" : "rgba(71,45,48,0.2)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
