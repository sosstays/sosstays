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

// Interactive founder grid for the About page. Opening a card widens it
// into the next grid column (rather than growing taller) and slides in a
// panel of icon + one-line facts beside the photo, within the shaded top
// region — see the `highlights` field on teamMember in
// studio/schemaTypes/documents/aboutPage.ts. Name/title sit in their own
// full-width footer strip below, same two-tier shape as the reference card.
// The photo is a transparent PNG cutout — see that field's description for
// the recommended crop — so it's rendered bottom-aligned (object-contain +
// object-bottom) with no frame around it, sitting flush with the bottom of
// the shaded region.
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
            className={`group flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-sage-grey/25 bg-cream text-left outline-none transition-shadow duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-forest-green ${
              isOpen ? "sm:col-span-2" : ""
            }`}
          >
            {/* Shaded top region: photo (bottom-aligned, badge flush at the
                corner) with the highlights panel sliding in beside it. */}
            <div className="flex flex-row bg-pale-sage">
              <div className="relative h-[260px] w-[180px] shrink-0 overflow-hidden sm:w-[220px]">
                <span className="absolute top-0 left-0 z-10 rounded-br-2xl bg-light-sage py-1.5 pr-4 pl-3.5 text-[11px] font-bold tracking-widest text-deep-forest uppercase">
                  Co-Founder
                </span>
                {member.photo ? (
                  <Image
                    src={member.photo.src}
                    alt={member.photo.alt || member.name}
                    fill
                    sizes="220px"
                    className="object-contain object-bottom transition-transform duration-500 ease-out group-hover:-translate-y-1.5"
                  />
                ) : (
                  <div className="absolute inset-x-0 bottom-0 flex h-[190px] items-end justify-center pb-6">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream text-2xl font-semibold text-forest-green">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div
                className="overflow-hidden"
                style={{
                  maxWidth: isOpen ? "420px" : "0px",
                  opacity: isOpen ? 1 : 0,
                  transition: "max-width 440ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease 100ms",
                }}
              >
                <div className="flex h-[260px] w-[min(420px,80vw)] flex-col justify-center gap-4 px-6 py-6">
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
        );
      })}
    </div>
  );
}
