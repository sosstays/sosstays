"use client";

import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/image";

type SanityImageWithAlt = { alt?: string } & Record<string, unknown>;

export function PropertyGallery({
  images,
  alt,
}: {
  images: SanityImageWithAlt[];
  alt: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  const tiles = images.slice(0, 5);
  const remaining = images.length - tiles.length;

  return (
    <div className="grid h-[460px] grid-cols-4 grid-rows-2 gap-3 sm:h-[560px]">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative col-span-4 row-span-2 overflow-hidden rounded-[14px] sm:col-span-2"
      >
        <Image
          src={urlFor(tiles[0]).width(1400).height(1600).url()}
          alt={tiles[0].alt ?? alt}
          fill
          priority
          className="object-cover"
        />
        <span className="absolute right-5 bottom-5 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-near-black shadow-md">
          View All {images.length} Photos
        </span>
      </button>

      {tiles.slice(1).map((image, i) => {
        const isLastTile = i === tiles.length - 2;
        return (
          <button
            type="button"
            key={i}
            onClick={() => setLightboxOpen(true)}
            className="relative col-span-2 row-span-1 hidden overflow-hidden rounded-[14px] sm:block"
          >
            <Image
              src={urlFor(image).width(700).height(560).url()}
              alt={image.alt ?? alt}
              fill
              className="object-cover"
            />
            {isLastTile && remaining > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-near-black/45 text-sm font-semibold text-cream">
                Show More Photos
              </span>
            )}
          </button>
        );
      })}

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-near-black/95">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-near-black/95 px-6 py-4 sm:px-10">
            <span className="text-sm font-medium text-cream">
              {images.length} photo{images.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
              className="flex h-10 w-10 items-center justify-center rounded-full text-cream hover:bg-cream/10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="mx-auto max-w-4xl px-6 pb-16 sm:px-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {images.map((image, i) => (
                <div key={i} className="relative h-72 overflow-hidden rounded-[10px]">
                  <Image
                    src={urlFor(image).width(900).height(700).url()}
                    alt={image.alt ?? alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
