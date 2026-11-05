import Image from "next/image";
import Link from "next/link";

export type PartnerCarouselItem = {
  _id: string;
  name: string;
  tagline?: string | null;
  href: string;
  image: { src: string; alt: string } | null;
};

// Same continuous, doubled-list marquee as ShopCarousel's product strip
// (pauses on hover/focus via the shared .sos-shop-marquee class) — used
// here for the /contact page's "Partners" section instead of a
// timed/manually-advanced carousel.
export function PartnerCarousel({ partners }: { partners: PartnerCarouselItem[] }) {
  if (partners.length === 0) return null;

  const doubled = [...partners, ...partners];

  return (
    <div
      className="relative min-w-0 overflow-hidden"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div className="sos-shop-marquee flex w-max items-center gap-5">
        {doubled.map((partner, i) => (
          <Link
            key={`${partner._id}-${i}`}
            href={partner.href}
            target={partner.href.startsWith("http") ? "_blank" : undefined}
            rel={partner.href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-hidden={i >= partners.length}
            tabIndex={i >= partners.length ? -1 : 0}
            className="group relative flex h-[220px] w-[220px] flex-none flex-col overflow-hidden rounded-[14px] border border-sage-grey/25 bg-cream sm:h-[240px] sm:w-[240px]"
          >
            <div className="relative h-[130px] w-full flex-none bg-pale-sage sm:h-[145px]">
              {partner.image ? (
                <Image
                  src={partner.image.src}
                  alt={partner.image.alt || partner.name}
                  fill
                  sizes="240px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-warm-cream text-2xl font-semibold text-forest-green">
                  {partner.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center p-4">
              <p className="truncate text-[14px] font-semibold text-near-black">{partner.name}</p>
              {partner.tagline && (
                <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-near-black/60">
                  {partner.tagline}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
