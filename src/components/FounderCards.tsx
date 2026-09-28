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

// Interactive founder grid for the About page. Each card opens in place to
// show a short list of icon + one-line facts (see the `highlights` field on
// teamMember in studio/schemaTypes/documents/aboutPage.ts) rather than the
// old single long-form bio paragraph. The photo is a transparent PNG
// cutout — see that field's description for the recommended crop — so it's
// rendered bottom-aligned (object-contain + object-bottom) with no frame
// around it, sitting flush with the bottom of the image area.
export function FounderCards({ members }: { members: FounderCardData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={member.name}
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
            className="group flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-sage-grey/25 bg-cream text-left outline-none transition-shadow duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-forest-green"
          >
            <div className="relative h-[300px] shrink-0 overflow-hidden bg-pale-sage">
              <span className="absolute top-6 left-0 z-10 rounded-r-full bg-light-sage py-1.5 pr-4 pl-4 text-[11px] font-bold tracking-widest text-deep-forest uppercase">
                Co-Founder
              </span>
              {member.photo ? (
                <Image
                  src={member.photo.src}
                  alt={member.photo.alt || member.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain object-bottom transition-transform duration-500 ease-out group-hover:-translate-y-1.5"
                />
              ) : (
                <div className="absolute inset-x-0 bottom-0 flex h-[220px] items-end justify-center pb-8">
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-cream text-3xl font-semibold text-forest-green">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 px-6 pt-5">
              <span className="text-[11.5px] font-bold tracking-widest text-forest-green/70 uppercase">
                {member.title}
              </span>
              <h3 className="font-serif text-xl font-bold text-deep-forest">{member.name}</h3>
              <span className="text-[13.5px] text-near-black/65">{member.plainTitle}</span>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 420ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-3.5 px-6 pt-4 pb-2">
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

            <span className="px-6 pt-1 pb-6 text-[13px] font-semibold text-forest-green">
              {isOpen ? "Close ×" : "Read more →"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
