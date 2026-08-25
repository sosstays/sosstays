import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";

type SanityImageWithAlt = { alt?: string } & Record<string, unknown>;

export type PropertyCardProps = {
  slug: string;
  name: string;
  location: string;
  shortDescription?: string | null;
  sleeps?: number | null;
  /**
   * Formatted price string, e.g. "From €150/night". Not currently sourced
   * from Sanity — pricing lives in Uplisting, never in the CMS (see
   * propertyPage.ts) — but kept as a prop so a future Uplisting-backed
   * caller can pass one in without changing this component.
   */
  price?: string;
  coverImage?: SanityImageWithAlt | null;
  gallery?: SanityImageWithAlt[] | null;
  /**
   * "plain" sits directly on the page background (homepage's featured
   * stay). "framed" wraps it in a white surface + shadow (area guide's
   * "Stay here" list).
   */
  surface?: "plain" | "framed";
};

export function PropertyCard({
  slug,
  name,
  location,
  shortDescription,
  sleeps,
  price,
  coverImage,
  gallery,
  surface = "plain",
}: PropertyCardProps) {
  // GROQ returns `null` (not `undefined`) for an empty array field, which
  // skips a destructuring default — normalize explicitly.
  const images = gallery ?? [];
  const singleHeightClass = surface === "framed" ? "h-[220px]" : "h-[260px]";
  const collageHeightClass = surface === "framed" ? "sm:h-[280px]" : "sm:h-[400px]";

  // Shared on every image tile: clips the zoom, and eases it in slower than
  // the card lift so the photo feels like it's drifting rather than snapping.
  const imageClass = "object-cover transition-transform duration-700 ease-out group-hover:scale-110";

  const card = (
    <>
      {images.length >= 3 ? (
        <>
          {/* single image below sm, 3-photo collage from sm up */}
          <div className={`relative ${singleHeightClass} overflow-hidden rounded-[10px] sm:hidden`}>
            <Image
              src={urlFor(images[0]).width(700).height(500).url()}
              alt={images[0].alt ?? name}
              fill
              className={imageClass}
            />
          </div>
          <div
            className={`hidden ${collageHeightClass} sm:grid sm:grid-cols-[1.6fr_1fr] sm:grid-rows-2 sm:gap-2.5`}
          >
            <div className="relative row-span-2 overflow-hidden rounded-[10px]">
              <Image
                src={urlFor(images[0]).width(900).height(800).url()}
                alt={images[0].alt ?? name}
                fill
                className={imageClass}
              />
            </div>
            <div className="relative overflow-hidden rounded-[10px]">
              <Image
                src={urlFor(images[1]).width(500).height(390).url()}
                alt={images[1].alt ?? name}
                fill
                className={imageClass}
              />
            </div>
            <div className="relative overflow-hidden rounded-[10px]">
              <Image
                src={urlFor(images[2]).width(500).height(390).url()}
                alt={images[2].alt ?? name}
                fill
                className={imageClass}
              />
            </div>
          </div>
        </>
      ) : coverImage ? (
        <div className={`relative ${singleHeightClass} ${collageHeightClass} overflow-hidden rounded-[10px]`}>
          <Image
            src={urlFor(coverImage).width(1200).height(800).url()}
            alt={coverImage.alt ?? name}
            fill
            className={imageClass}
          />
        </div>
      ) : null}

      <div className={surface === "framed" ? "pt-5" : "pt-6 sm:max-w-[60%] sm:pt-7"}>
        <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">{location}</p>
        <div className="mb-3.5 flex flex-wrap items-center gap-3.5">
          <h3 className="font-serif text-lg font-bold text-near-black sm:text-2xl">{name}</h3>
          {price && (
            <span className="rounded-full bg-light-sage/35 px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-forest-green">
              {price}
            </span>
          )}
          {!price && sleeps && (
            <span className="rounded-full bg-light-sage/35 px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-forest-green">
              Sleeps {sleeps}
            </span>
          )}
        </div>
        {shortDescription && (
          <p className="mb-6 leading-relaxed text-near-black/70">{shortDescription}</p>
        )}
        <span className="inline-flex items-center gap-2 rounded-full bg-forest-green px-6 py-3.5 text-[15px] font-semibold text-cream transition-colors duration-300 group-hover:bg-light-sage group-hover:text-forest-green">
          Have a look →
        </span>
      </div>
    </>
  );

  return (
    <Link
      href={`/stays/${slug}`}
      className={
        surface === "framed"
          ? "group block rounded-[18px] border border-sage-grey/40 p-5 shadow-[0_12px_32px_-18px_rgba(63,82,64,0.2)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-16px_rgba(63,82,64,0.32)]"
          : "group block transition-transform duration-300 ease-out hover:-translate-y-1"
      }
    >
      {card}
    </Link>
  );
}
