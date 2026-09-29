"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DynamicIcon } from "@/components/DynamicIcon";

export type FounderCardData = {
  name: string;
  title: string;
  plainTitle: string;
  photo?: { src: string; alt: string } | null;
  highlights: { icon: string; text: string }[];
};

// Matches Tailwind's `sm` breakpoint — below it there's no room for the
// highlights panel to open sideways next to the photo, so it opens
// downward (full width) instead. See isWide below.
const WIDE_QUERY = "(min-width: 640px)";

// How far the photo pokes above the card's own top edge — see the photo
// overlay below for why it has to live outside the card's clipped box.
const PHOTO_OVERHANG = 40;

// Interactive founder grid for the About page. From `sm` up, opening a card
// widens it into the next grid column and slides the highlights panel in
// beside the photo, within the shaded top region — see the `highlights`
// field on teamMember in studio/schemaTypes/documents/aboutPage.ts. Below
// that, the card stays full width and the panel drops down under the photo
// instead, since there's no room to grow sideways on a phone screen. Name/
// title sit in their own full-width footer strip below, same two-tier shape
// as the reference card. The photo is a transparent PNG cutout — see that
// field's description for the recommended crop — so it's rendered
// bottom-aligned (object-contain + object-bottom), sitting flush with the
// bottom of the shaded region and rising above the card's own top edge.
export function FounderCards({ members }: { members: FounderCardData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={member.name} className="relative">
            {/* Photo overlay: sits outside the card's own clipped/rounded
                box (below) so it can rise above the card's top edge instead
                of being cut off there. Purely decorative — clicks pass
                through to the card underneath. */}
            {member.photo && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 z-10 w-full sm:w-[220px]"
                style={{ top: -PHOTO_OVERHANG, height: 260 + PHOTO_OVERHANG }}
              >
                <Image
                  src={member.photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 220px, 100vw"
                  className="object-contain object-bottom"
                />
              </div>
            )}

            <div
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenIndex(isOpen ? null : i);
                }
              }}
              className={`flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-sage-grey/25 bg-cream text-left outline-none transition-shadow duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-forest-green ${
                isOpen && isWide ? "sm:col-span-2" : ""
              }`}
            >
              {/* Shaded top region: photo backdrop (badge flush at the
                  corner). From `sm` up the highlights panel slides in
                  beside it; below that it drops down underneath instead.
                  The section itself is bg-deep-forest (see about/page.tsx's
                  Meet the Team section) so pale-sage here reads clearly
                  against it, collapsed or open. */}
              <div className="flex flex-col bg-pale-sage sm:flex-row">
                <div className="relative h-[260px] w-full shrink-0 sm:w-[220px]">
                  <span className="absolute top-0 left-0 z-20 rounded-br-2xl bg-light-sage py-1.5 pr-4 pl-3.5 text-[11px] font-bold tracking-widest text-deep-forest uppercase">
                    Co-Founder
                  </span>
                  {!member.photo && (
                    <div className="absolute inset-x-0 bottom-0 flex h-[190px] items-end justify-center pb-6">
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream text-2xl font-semibold text-forest-green">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="overflow-hidden"
                  style={
                    isWide
                      ? {
                          maxWidth: isOpen ? "420px" : "0px",
                          maxHeight: "none",
                          opacity: isOpen ? 1 : 0,
                          transition: "max-width 440ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease 100ms",
                        }
                      : {
                          maxWidth: "none",
                          maxHeight: isOpen ? "600px" : "0px",
                          opacity: isOpen ? 1 : 0,
                          transition: "max-height 440ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease 100ms",
                        }
                  }
                >
                  <div className="flex w-full flex-col justify-center gap-4 px-6 py-6 sm:h-[260px] sm:w-[min(420px,80vw)]">
                    {member.highlights.map((h, hi) => (
                      <div key={hi} className="flex items-start gap-3">
                        <DynamicIcon
                          name={h.icon}
                          className="mt-0.5 h-4 w-4 flex-none text-forest-green"
                          strokeWidth={1.75}
                        />
                        <span className="text-[14.5px] leading-relaxed text-near-black/80">{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer strip: name/title, full width, always visible — the
                  "Classic T-shirt / price" row in the reference layout. */}
              <div className="flex flex-col gap-1 px-6 py-5">
                <span className="text-[11.5px] font-bold tracking-widest text-forest-green/70 uppercase">
                  {member.title}
                </span>
                <h3 className="font-serif text-xl font-bold text-deep-forest">{member.name}</h3>
                <span className="text-[13.5px] text-near-black/65">{member.plainTitle}</span>
                {!isOpen && (
                  <span className="pt-2 text-[13px] font-semibold text-forest-green">Read more →</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
