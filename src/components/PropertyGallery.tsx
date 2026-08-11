"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { Button } from "@/components/Button";

type SanityImageWithAlt = { alt?: string } & Record<string, unknown>;

export type PropertyGalleryHighlight = {
  headline: string;
  description: string;
  /** Optional photo that cross-fades onto the hero tile while this highlight is active. */
  image?: SanityImageWithAlt;
  /**
   * Up to 2 photos that cross-fade onto the two side gallery tiles while
   * this highlight is active. Matched positionally: supportingImages[0]
   * replaces the first side tile, supportingImages[1] the second.
   */
  supportingImages?: SanityImageWithAlt[];
  ctaLabel: string;
  /** External link for the CTA. Omit to open the lightbox instead. */
  ctaHref?: string;
};

export type PropertyGalleryPromo = {
  /** Exactly 3 rotating highlights, one per dot in the indicator. */
  highlights: PropertyGalleryHighlight[];
  /** Delay before the promo reveals over the hero tile. Default 2500ms. */
  delayMs?: number;
  /** Interval between autoplay dot advances once revealed. Default 4000ms. */
  autoplayMs?: number;
};

export function PropertyGallery({
  images,
  alt,
  promo,
}: {
  images: SanityImageWithAlt[];
  alt: string;
  promo?: PropertyGalleryPromo;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [promoActive, setPromoActive] = useState(false);
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const [cycleTick, setCycleTick] = useState(0);
  // Bumped whenever a dot is clicked, so the autoplay effect below tears
  // down and restarts its interval instead of firing on the old schedule.
  const [manualToken, setManualToken] = useState(0);

  const pillRef = useRef<HTMLSpanElement>(null);
  const [pillCompactWidth, setPillCompactWidth] = useState<number | null>(null);

  const delayMs = promo?.delayMs ?? 2500;
  const autoplayMs = promo?.autoplayMs ?? 4000;

  // Capture the pill's natural (label-only) width before the promo
  // activates, so the width transition below has a real pixel value to
  // animate from instead of "auto" (which CSS can't tween).
  useEffect(() => {
    if (pillRef.current && pillCompactWidth === null) {
      setPillCompactWidth(pillRef.current.getBoundingClientRect().width);
    }
  }, [pillCompactWidth]);

  // Reveal the promo overlay once, after `delayMs`, then cycle the dot
  // indicator every `autoplayMs` until the gallery unmounts.
  useEffect(() => {
    if (!promo) return;
    const t = setTimeout(() => setPromoActive(true), delayMs);
    return () => clearTimeout(t);
  }, [promo, delayMs]);

  useEffect(() => {
    if (!promo || !promoActive) return;
    const id = setInterval(() => {
      setActiveDotIndex((i) => (i + 1) % 3);
      setCycleTick((t) => t + 1);
    }, autoplayMs);
    return () => clearInterval(id);
    // manualToken restarts this interval on a manual dot click, so the
    // next auto-advance is a full autoplayMs away instead of picking up
    // mid-cycle.
  }, [promo, promoActive, autoplayMs, manualToken]);

  const goToDot = (i: number) => {
    setActiveDotIndex(i);
    setCycleTick((t) => t + 1);
    setManualToken((t) => t + 1);
  };

  if (images.length === 0) return null;

  const tiles = images.slice(0, 5);
  const remaining = images.length - tiles.length;
  const activeHighlight = promo?.highlights[activeDotIndex];

  return (
    <div className="grid h-[460px] grid-cols-4 grid-rows-2 gap-3 sm:h-[560px]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setLightboxOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
        }}
        className="relative col-span-4 row-span-2 cursor-pointer overflow-hidden rounded-[14px] sm:col-span-2"
      >
        <div
          className="absolute inset-0 transition-opacity duration-[600ms] ease-out"
          style={{
            opacity: promoActive && activeHighlight?.image ? 0 : 1,
          }}
        >
          <Image
            src={urlFor(tiles[0]).width(1400).height(1600).url()}
            alt={tiles[0].alt ?? alt}
            fill
            priority
            className="object-cover"
          />
        </div>

        {promo?.highlights.map((highlight, i) =>
          highlight.image ? (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-[600ms] ease-out"
              style={{
                opacity: promoActive && activeDotIndex === i ? 1 : 0,
                transitionDelay: promoActive && activeDotIndex === i ? "200ms" : "0ms",
              }}
            >
              <Image
                src={urlFor(highlight.image).width(1400).height(1600).url()}
                alt={highlight.image.alt ?? alt}
                fill
                className="object-cover"
              />
            </div>
          ) : null,
        )}

        {promo && (
          <>
            <div
              aria-hidden
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{
                background:
                  "linear-gradient(180deg, rgba(74,93,72,0.88) 0%, rgba(74,93,72,0.75) 45%, rgba(74,93,72,0.55) 100%)",
                opacity: promoActive ? 1 : 0,
              }}
            />
            <div
              className="absolute inset-x-0 top-0 flex flex-col gap-2.5 p-6 transition-all duration-700 ease-out sm:p-10"
              style={{
                opacity: promoActive ? 1 : 0,
                transform: promoActive ? "translateY(0)" : "translateY(12px)",
                transitionDelay: "150ms",
              }}
            >
              <div
                key={activeDotIndex}
                className="flex flex-col gap-2.5"
                style={{ animation: "sos-highlight-fade-in 400ms ease-out" }}
              >
                <div className="font-serif text-2xl leading-[1.15] font-bold text-cream sm:text-[34px]">
                  {activeHighlight?.headline}
                </div>
                <div className="max-w-[480px] text-sm leading-snug text-light-sage sm:text-[17px]">
                  {activeHighlight?.description}
                </div>
                {activeHighlight && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    {activeHighlight.ctaHref ? (
                      <Button
                        link={activeHighlight.ctaHref}
                        external={activeHighlight.ctaHref.startsWith("http")}
                        size="sm"
                      >
                        {activeHighlight.ctaLabel}
                      </Button>
                    ) : (
                      <Button type="button" size="sm" onClick={() => setLightboxOpen(true)}>
                        {activeHighlight.ctaLabel}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <span
          ref={pillRef}
          className="absolute right-5 bottom-5 overflow-hidden rounded-full bg-cream px-5 py-2.5 shadow-md transition-[width] duration-500 ease-out"
          style={{
            width:
              promo && promoActive
                ? "calc(100% - 40px)"
                : (pillCompactWidth ?? undefined),
          }}
        >
          <span className="flex h-full items-center text-sm font-semibold whitespace-nowrap text-near-black">
            {promo && (
              <span
                className="flex flex-none items-center overflow-hidden transition-[max-width,gap,opacity] duration-500 ease-out"
                style={{
                  maxWidth: promoActive ? "130px" : "0px",
                  gap: promoActive ? "8px" : "0px",
                  opacity: promoActive ? 1 : 0,
                  pointerEvents: promoActive ? "auto" : "none",
                  transitionDelay: promoActive ? "0ms, 0ms, 200ms" : "0ms",
                }}
              >
                {[0, 1, 2].map((i) => {
                  const isActive = i === activeDotIndex;
                  const key = `${i}-${cycleTick}`;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Show promotion ${i + 1}`}
                      aria-current={isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToDot(i);
                      }}
                      className="relative flex h-7 w-7 flex-none items-center justify-center"
                    >
                      {isActive ? (
                        <span key={key} className="relative inline-block h-6 w-6">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 26 26"
                            style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
                          >
                            <circle cx="13" cy="13" r="11" fill="none" stroke="rgba(74,93,72,0.2)" strokeWidth="2" />
                            <circle
                              cx="13"
                              cy="13"
                              r="11"
                              fill="none"
                              stroke="var(--maroon)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeDasharray="69.1"
                              style={{
                                strokeDashoffset: 69.1,
                                animation: `sos-ring-progress ${autoplayMs}ms linear forwards`,
                              }}
                            />
                          </svg>
                          <span
                            className="absolute inset-0 flex items-center justify-center"
                            aria-hidden
                          >
                            <span
                              style={{
                                width: 0,
                                height: 0,
                                marginLeft: 1,
                                borderTop: "5px solid transparent",
                                borderBottom: "5px solid transparent",
                                borderLeft: "7px solid var(--forest-green)",
                              }}
                            />
                          </span>
                        </span>
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-light-sage" />
                      )}
                    </button>
                  );
                })}
              </span>
            )}
            <span className="ml-auto">View All {images.length} Photos</span>
          </span>
        </span>
      </div>

      {tiles.slice(1).map((image, i) => {
        const isLastTile = i === tiles.length - 2;
        return (
          <button
            type="button"
            key={i}
            onClick={() => setLightboxOpen(true)}
            className="relative col-span-2 row-span-1 hidden overflow-hidden rounded-[14px] sm:block"
          >
            <div
              className="absolute inset-0 transition-opacity duration-[600ms] ease-out"
              style={{
                opacity: promoActive && activeHighlight?.supportingImages?.[i] ? 0 : 1,
              }}
            >
              <Image
                src={urlFor(image).width(700).height(560).url()}
                alt={image.alt ?? alt}
                fill
                className="object-cover"
              />
            </div>

            {promo?.highlights.map((highlight, h) => {
              const supportingImage = highlight.supportingImages?.[i];
              if (!supportingImage) return null;
              return (
                <div
                  key={h}
                  className="absolute inset-0 transition-opacity duration-[600ms] ease-out"
                  style={{
                    opacity: promoActive && activeDotIndex === h ? 1 : 0,
                    transitionDelay: promoActive && activeDotIndex === h ? "200ms" : "0ms",
                  }}
                >
                  <Image
                    src={urlFor(supportingImage).width(700).height(560).url()}
                    alt={supportingImage.alt ?? alt}
                    fill
                    className="object-cover"
                  />
                </div>
              );
            })}

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
