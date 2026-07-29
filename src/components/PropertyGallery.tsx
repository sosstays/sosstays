"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/image";

type SanityImageWithAlt = { alt?: string } & Record<string, unknown>;

const ADVANCE_MS = 4200;

export function PropertyGallery({
  images,
  alt,
}: {
  images: SanityImageWithAlt[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length]);

  function advance(dir: 1 | -1) {
    if (timerRef.current) clearInterval(timerRef.current);
    setIndex((i) => (i + dir + images.length) % images.length);
    if (images.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
      }, ADVANCE_MS);
    }
  }

  if (images.length === 0) return null;

  return (
    <div className="relative h-[64vh] min-h-[440px] w-full overflow-hidden">
      {images.map((image, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={urlFor(image).width(1800).height(1400).url()}
            alt={image.alt ?? alt}
            fill
            priority={i === 0}
            className="object-cover"
          />
        </div>
      ))}

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => advance(-1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-5 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-forest-green/55 text-xl text-cream"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => advance(1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-5 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-forest-green/55 text-xl text-cream"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-[18px] flex justify-center gap-[7px]">
            {images.map((_, i) => (
              <div
                key={i}
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: i === index ? "var(--cream)" : "rgba(254,254,227,0.4)" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
