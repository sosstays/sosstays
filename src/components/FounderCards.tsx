"use client";

import { useState } from "react";
import Image from "next/image";
import { DynamicIcon } from "@/components/DynamicIcon";

export type FounderCardData = {
  name: string;
  title: string;
  plainTitle: string;
  photo?: { src: string; alt: string } | null;
  highlights: { icon: string; text: string }[];
};

// How far the photo pokes above the card's own top edge — see the photo
// overlay below for why it has to live outside the card's clipped box.
const PHOTO_OVERHANG = 40;

// Height of the shaded photo backdrop. The photo overlay is this plus the
// overhang so it ends flush with the bottom of the backdrop.
const PHOTO_REGION = 260;

// Interactive founder grid for the About page. From `xl` up the cards are a
// no-wrap flex row of compact fixed-width cards: opening one animates its
// flex-basis so it widens to the right while its neighbours shrink to make
// room (and the row stays left-aligned with the heading when there's slack), the photo slides left and
// the highlights open beside it. (Widening via a grid column span instead
// made neighbours jump columns or wrap onto a new row.) Below `xl` there's
// no room to grow sideways, so the panel drops down inside the card between
// the photo and the name strip, animating grid-template-rows (0fr -> 1fr)
// so it opens to its natural height with no max-height guess. See the `highlights` field on teamMember in
// studio/schemaTypes/documents/aboutPage.ts.
//
// The photo is a transparent PNG cutout — see that field's description for
// the recommended crop — so it's rendered bottom-aligned and centred
// (object-contain + object-bottom), sitting flush with the bottom of the
// shaded region and rising above the card's own top edge.
export function FounderCards({ members }: { members: FounderCardData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 items-start gap-x-7 gap-y-14 sm:grid-cols-2 xl:flex xl:gap-y-0">
      {members.map((member, i) => {
        const isOpen = openIndex === i;
        const toggle = () => setOpenIndex(isOpen ? null : i);
        return (
          <div
            key={member.name}
            className={`relative xl:min-w-0 xl:shrink xl:grow-0 xl:transition-[flex-basis] xl:duration-[480ms] xl:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:xl:transition-none ${
              isOpen ? "xl:basis-[620px]" : "xl:basis-[340px]"
            }`}
          >
            {/* Photo overlay: sits outside the card's own clipped/rounded
                box (below) so it can rise above the card's top edge instead
                of being cut off there. Purely decorative — clicks pass
                through to the card underneath. z-20 so the cutout renders
                in front of the shaded backdrop. */}
            {member.photo && (
              <div
                aria-hidden
                className={`pointer-events-none absolute left-0 z-20 w-full transition-[width] duration-[480ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  isOpen ? "xl:w-[220px]" : ""
                }`}
                style={{ top: -PHOTO_OVERHANG, height: PHOTO_REGION + PHOTO_OVERHANG }}
              >
                <Image
                  src={member.photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                  className="object-contain object-bottom"
                />
              </div>
            )}

            <div
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
              className="flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-sage-grey/25 bg-cream text-left outline-none transition-shadow duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-forest-green"
            >
              {/* Shaded region: photo backdrop with the badge flush at the
                  corner, then the highlights panel underneath. The section
                  itself is bg-deep-forest (see about/page.tsx's Meet the
                  Team section) so pale-sage here reads clearly against it,
                  collapsed or open. */}
              <div className="bg-pale-sage xl:flex">
                <div
                  className={`relative w-full shrink-0 transition-[width] duration-[480ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                    isOpen ? "xl:w-[220px]" : ""
                  }`}
                  style={{ height: PHOTO_REGION }}
                >
                  <span className="absolute top-0 left-0 z-10 rounded-br-2xl bg-light-sage py-1.5 pr-4 pl-3.5 text-[11px] font-bold tracking-widest text-deep-forest uppercase">
                    Co-Founder
                  </span>
                </div>

                <div
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-[440ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none xl:min-w-0 xl:flex-1 xl:grid-rows-[1fr] xl:overflow-hidden ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <ul className="flex min-h-0 list-none flex-col gap-4 overflow-hidden px-6 xl:h-[260px] xl:w-[380px] xl:justify-center xl:gap-3">
                    {/* Padding lives on the first/last rows, not the list,
                        so the closed (0fr) state collapses to exactly 0. */}
                    {member.highlights.map((h, hi) => (
                      <li
                        key={hi}
                        className={`flex items-start gap-3 ${hi === 0 ? "pt-6 xl:pt-0" : ""} ${
                          hi === member.highlights.length - 1 ? "pb-6 xl:pb-0" : ""
                        }`}
                      >
                        <DynamicIcon
                          name={h.icon}
                          className="mt-0.5 h-4 w-4 flex-none text-forest-green"
                          strokeWidth={1.75}
                        />
                        <span className="text-[14.5px] leading-relaxed text-near-black/80">{h.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer strip: name/title, full width, always visible. The
                  plain title reserves two lines and the toggle label stays
                  put (it only swaps text), so closed cards in a row share
                  one height and opening doesn't shift the footer. */}
              <div className="flex flex-col gap-1 px-6 py-5">
                <span className="text-[11.5px] font-bold tracking-widest text-forest-green/70 uppercase">
                  {member.title}
                </span>
                <h3 className="font-serif text-xl font-bold text-deep-forest">{member.name}</h3>
                <span className="min-h-10 text-[13.5px] leading-5 text-near-black/65">{member.plainTitle}</span>
                <span className="pt-1 text-[13px] font-semibold text-forest-green">
                  {isOpen ? "Show less" : "Read more"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
