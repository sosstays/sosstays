import type { ReactNode } from "react";
import Image from "next/image";
import { HeroNav } from "@/components/HeroNav";
import { Reveal } from "@/components/Reveal";
import type { NavLink } from "@/lib/navLinks";

type HeroImage = { src: string; alt: string };

// A two-column hero: nav + free-form content on the left, one or two
// images bleeding edge-to-edge on the right (desktop only — pass your own
// contained image inside `children` for smaller screens, the way
// corporate-stays/page.tsx does). The image column is a clean, hard split
// against the background colour — no fade/gradient blend on the seam.
//
// Reused across any page that wants this "boxed copy, full-bleed photo(s)"
// hero treatment instead of a full-width background image — see
// app/corporate-stays/page.tsx for the reference usage.
export function SplitHero({
  navLinks,
  ctaHref,
  ctaLabel,
  navVariant = "landlords",
  bgClassName = "bg-maroon",
  images,
  minHeight = 660,
  children,
}: {
  navLinks: NavLink[];
  ctaHref: string;
  ctaLabel: string;
  navVariant?: "default" | "landlords";
  /** Tailwind background class for the whole hero section. Defaults to the
   *  site's maroon B2B/owner-context band. */
  bgClassName?: string;
  /** One image fills the full height on the right; two stack as an
   *  edge-to-edge diptych (each half the height). Desktop (lg+) only. */
  images: [HeroImage] | [HeroImage, HeroImage];
  /** Minimum height (px) of the hero on desktop, so the image column has
   *  something to fill. Defaults to 660. */
  minHeight?: number;
  /** The left column's content — eyebrow, heading, copy, CTAs, whatever
   *  the page needs, including its own mobile-only image if wanted. */
  children: ReactNode;
}) {
  return (
    <section className={`relative overflow-hidden ${bgClassName}`}>
      <HeroNav links={navLinks} variant={navVariant} ctaHref={ctaHref} ctaLabel={ctaLabel} sticky />

      <div className="relative lg:grid lg:grid-cols-2 lg:items-center">
        {children}

        <Reveal
          delay={120}
          className="relative hidden lg:col-start-2 lg:row-start-1 lg:block lg:self-stretch"
          style={{ minHeight }}
        >
          {images.length === 2 ? (
            <div className="grid h-full grid-rows-2 gap-[3px]">
              {images.map((img) => (
                <div key={img.src} className="relative overflow-hidden">
                  <Image src={img.src} alt={img.alt} fill priority className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-full overflow-hidden">
              <Image src={images[0].src} alt={images[0].alt} fill priority className="object-cover" />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
