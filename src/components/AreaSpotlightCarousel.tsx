"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { portableTextToPlain } from "@/sanity/portableText";
import { Button } from "@/components/Button";

type Area = {
  _id: string;
  areaName: string;
  slug: string;
  heroImage?: any;
  introduction?: any;
};

const ADVANCE_MS = 6000;

export function AreaSpotlightCarousel({ areas }: { areas: Area[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (areas.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % areas.length);
    }, ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [areas.length]);

  function advance(dir: 1 | -1) {
    if (timerRef.current) clearInterval(timerRef.current);
    setIndex((i) => (i + dir + areas.length) % areas.length);
    if (areas.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % areas.length);
      }, ADVANCE_MS);
    }
  }

  if (areas.length === 0) return null;

  return (
    <section
      id="areas"
      className="relative h-[78vh] min-h-[600px] w-full overflow-hidden bg-forest-green"
    >
      {areas.map((area, i) => (
        <div
          key={area._id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          aria-hidden={i !== index}
        >
          {area.heroImage && (
            <Image
              src={urlFor(area.heroImage).width(1800).height(1200).url()}
              alt={area.areaName}
              fill
              priority={i === 0}
              className="object-cover"
              style={{ objectPosition: "center 40%" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-forest-green/85 via-forest-green/50 to-forest-green/5" />

          <div className="relative flex h-full items-center px-8 sm:px-14">
            <div className="max-w-[520px]">
              <p className="mb-5 text-xs font-medium tracking-widest text-light-sage uppercase">
                Where to start
              </p>
              <h2 className="mb-5 font-serif text-4xl leading-tight font-bold tracking-tight text-cream sm:text-5xl">
                {area.areaName}
              </h2>
              {area.introduction && (
                <p className="mb-9 text-lg leading-relaxed text-cream/90">
                  {portableTextToPlain(area.introduction, 220)}
                </p>
              )}
              <Button
                link={`/areas/${area.slug}`}
                variant="primary"
                bgColor="cream"
                color="forest-green"
                size="custom"
                className="px-8 py-4 text-[15px] font-medium"
              >
                Explore
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute top-6 right-6 z-10 sm:top-8 sm:right-8">
        <Button
          link="/areas"
          variant="primary"
          bgColor="cream"
          color="forest-green"
          size="custom"
          className="px-6 py-3 text-sm font-medium"
        >
          View all areas
        </Button>
      </div>

      {areas.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => advance(-1)}
            aria-label="Previous area"
            className="absolute top-1/2 left-5 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-forest-green/55 text-xl text-cream sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => advance(1)}
            aria-label="Next area"
            className="absolute top-1/2 right-5 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-forest-green/55 text-xl text-cream sm:flex"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-[18px] z-10 flex justify-center gap-[7px]">
            {areas.map((area, i) => (
              <button
                key={area._id}
                type="button"
                aria-label={`Go to ${area.areaName}`}
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setIndex(i);
                  timerRef.current = setInterval(() => {
                    setIndex((cur) => (cur + 1) % areas.length);
                  }, ADVANCE_MS);
                }}
                className="h-[7px] w-[7px] cursor-pointer rounded-full"
                style={{ background: i === index ? "var(--cream)" : "rgba(254,254,227,0.4)" }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
