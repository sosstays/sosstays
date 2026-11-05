"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const money = (n: number) => `€${n}`;

export type ShopCarouselProduct = {
  _id: string;
  name: string;
  price: number;
  image: { src: string; alt: string } | null;
};

const AUTO_ADVANCE_MS = 3500;

// Square-tile product carousel for the thank-you page: a single scrolling
// row (not a grid, unlike the shop page's own cards) with prev/next arrows
// and a timer that auto-advances every few seconds, pausing while the
// visitor's pointer is over the row.
export function ShopCarousel({ products }: { products: ShopCarouselProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function tileStep() {
    const track = trackRef.current;
    const tile = track?.querySelector<HTMLElement>("[data-shop-tile]");
    return tile ? tile.offsetWidth + 12 : 150;
  }

  function scrollNext() {
    const track = trackRef.current;
    if (!track) return;
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: tileStep(), behavior: "smooth" });
    }
  }

  function scrollPrev() {
    trackRef.current?.scrollBy({ left: -tileStep(), behavior: "smooth" });
  }

  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(scrollNext, AUTO_ADVANCE_MS);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  useEffect(() => {
    if (products.length === 0) return;
    startTimer();
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <div className="relative px-8 sm:px-14">
      <button
        type="button"
        onClick={() => {
          scrollPrev();
          startTimer();
        }}
        aria-label="Previous products"
        className="absolute top-1/2 left-1 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-sage-grey/50 bg-cream text-maroon shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => {
          scrollNext();
          startTimer();
        }}
        aria-label="Next products"
        className="absolute top-1/2 right-1 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-sage-grey/50 bg-cream text-maroon shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={trackRef}
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
        className="shop-carousel-track flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/shop/checkout?product=${product._id}&qty=1`}
            data-shop-tile
            className="group relative aspect-square w-[150px] flex-none snap-start overflow-hidden rounded-[14px] border border-sage-grey/40 bg-bright-cream sm:w-[170px]"
          >
            {product.image && (
              <Image
                src={product.image.src}
                alt={product.image.alt || product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8">
              <p className="truncate text-[13px] font-semibold text-cream">{product.name}</p>
              <p className="text-[12px] font-medium text-cream/85">{money(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
