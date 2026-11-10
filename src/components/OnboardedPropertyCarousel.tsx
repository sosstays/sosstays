"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";

export type OnboardedProperty = {
  _id: string;
  name: string;
  slug: string;
  location: string | null;
  coverImage: { alt?: string } | null;
};

const ADVANCE_MS = 4500;

// Auto-advancing carousel for the "Partner with us" section's onboarded
// properties — same pause-on-hover / per-view-by-breakpoint mechanics as
// the homepage's PropertyCarousel, but its own simple dark-overlay card
// (this grid never had PropertyCard's fuller stats/description layout).
export function OnboardedPropertyCarousel({ properties }: { properties: OnboardedProperty[] }) {
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
  const displayIndex = Math.min(index, maxIndex);

  useEffect(() => {
    if (paused || !canScroll) return;
    const timer = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, canScroll, maxIndex]);

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
      <div ref={trackRef} className="flex gap-4 overflow-x-hidden" style={{ scrollSnapType: "x mandatory" }}>
        {properties.map((property, i) => (
          <div
            key={property._id}
            className="w-full flex-none sm:w-[calc(50%-8px)] lg:w-[calc((100%-32px)/3)]"
            style={{ scrollSnapAlign: "start" }}
          >
            <Link
              href={`/stays/${property.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-near-black"
            >
              {property.coverImage && (
                <Image
                  src={urlFor(property.coverImage).width(700).height(880).url()}
                  alt={property.coverImage.alt ?? property.name}
                  fill
                  priority={i < perView}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-40% to-transparent" />
              <div className="absolute right-5 bottom-5 left-5">
                <h3 className="font-serif text-lg font-bold text-cream">{property.name}</h3>
                {property.location && <p className="mt-1 text-sm text-cream/75">{property.location}</p>}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {canScroll && (
        <div className="mt-5 flex justify-center gap-[7px]">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to properties ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-[7px] w-[7px] cursor-pointer rounded-full transition-colors"
              style={{ background: i === displayIndex ? "var(--cream)" : "rgba(255,255,255,0.3)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
