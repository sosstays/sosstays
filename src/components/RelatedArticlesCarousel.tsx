"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";

const ADVANCE_MS = 5000;

type RelatedArticle = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: any;
};

// "Read more" row on an area guide page, upgraded from a plain link list
// into an arrowed card carousel — same auto-advance/arrows/dots pattern as
// PropertyCarousel, reused here for blog post cards instead of stays.
export function RelatedArticlesCarousel({ posts }: { posts: RelatedArticle[] }) {
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

  const maxIndex = Math.max(0, posts.length - perView);
  const canScroll = posts.length > perView;

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

  if (posts.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div ref={trackRef} className="flex gap-5 overflow-x-hidden" style={{ scrollSnapType: "x mandatory" }}>
        {posts.map((post) => (
          <div
            key={post._id}
            className="w-full flex-none sm:w-[calc(50%-10px)] lg:w-[calc((100%-40px)/3)]"
            style={{ scrollSnapAlign: "start" }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-sage-grey/40 bg-bright-cream"
            >
              <div className="relative h-36 w-full bg-sage-grey/20">
                {post.coverImage && (
                  <Image
                    src={urlFor(post.coverImage).width(600).height(360).url()}
                    alt={post.coverImage.alt ?? post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h3 className="font-serif text-[15px] leading-snug font-bold text-forest-green">{post.title}</h3>
                {post.excerpt && (
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-near-black/60">{post.excerpt}</p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {canScroll && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous articles"
            className="absolute top-1/2 left-[-18px] z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-forest-green/20 bg-cream text-xl text-forest-green shadow-md transition-colors hover:bg-light-forest-green/30 sm:left-[-22px]"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next articles"
            className="absolute top-1/2 right-[-18px] z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-forest-green/20 bg-cream text-xl text-forest-green shadow-md transition-colors hover:bg-light-forest-green/30 sm:right-[-22px]"
          >
            ›
          </button>
          <div className="mt-6 flex justify-center gap-[7px]">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to articles ${i + 1}`}
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
