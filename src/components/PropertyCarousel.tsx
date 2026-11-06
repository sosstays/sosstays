"use client";

import { useEffect, useRef, useState } from "react";
import { PropertyCard, type PropertyCardProps } from "@/components/PropertyCard";

const ADVANCE_MS = 4500;

// Horizontal auto-advancing carousel for the homepage's featured stays —
// only really needed once the property count grows past what fits on
// screen, but wired up now so new stays just slot in. Pauses on hover/focus
// (and whenever the tab isn't visible) so it never fights a reader trying
// to look at a card; same setInterval + index pattern as
// AreaSpotlightCarousel, but scrolling a row instead of crossfading.
export function PropertyCarousel({
  properties,
}: {
  properties: (PropertyCardProps & { _id: string })[];
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

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [maxIndex, index]);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[0] as HTMLElement | undefined;
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    track.scrollTo({ left: index * (card.offsetWidth + gap), behavior: "smooth" });
  }, [index]);

  function goTo(i: number) {
    setIndex((i + maxIndex + 1) % (maxIndex + 1));
  }

  if (properties.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-10 overflow-x-hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {properties.map((property) => (
          <div
            key={property._id}
            className="w-full flex-none sm:w-[calc(50%-20px)] lg:w-[calc((100%-80px)/3)]"
            style={{ scrollSnapAlign: "start" }}
          >
            <PropertyCard
              slug={property.slug}
              name={property.name}
              location={property.location}
              destinationHeading={property.destinationHeading}
              shortDescription={property.shortDescription}
              sleeps={property.sleeps}
              coverImage={property.coverImage}
              surface="framed"
              hideSleeps
            />
          </div>
        ))}
      </div>

      {canScroll && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous stays"
            className="absolute top-1/2 left-[-18px] z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-forest-green/20 bg-cream text-xl text-forest-green shadow-md transition-colors hover:bg-light-forest-green/30 sm:left-[-22px]"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next stays"
            className="absolute top-1/2 right-[-18px] z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-forest-green/20 bg-cream text-xl text-forest-green shadow-md transition-colors hover:bg-light-forest-green/30 sm:right-[-22px]"
          >
            ›
          </button>
          <div className="mt-8 flex justify-center gap-[7px]">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to stays ${i + 1}`}
                onClick={() => setIndex(i)}
                className="h-[7px] w-[7px] cursor-pointer rounded-full transition-colors"
                style={{ background: i === index ? "var(--forest-green)" : "rgba(74,93,72,0.25)" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
