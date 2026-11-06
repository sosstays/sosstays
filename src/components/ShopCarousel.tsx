import Image from "next/image";
import Link from "next/link";

const money = (n: number) => `€${n}`;

export type ShopCarouselProduct = {
  _id: string;
  name: string;
  price: number;
  image: { src: string; alt: string } | null;
};

// Square-tile product strip for the thank-you page: a continuous,
// always-moving marquee (same doubled-list CSS-animation technique as the
// platform strip in HostsModule) rather than a timed scrollBy — so it never
// reads as "stuck", and pauses only on hover/focus. Lives inside the maroon
// shop band on the thank-you page, contained to that section's max-width
// rather than running full-bleed.
export function ShopCarousel({ products }: { products: ShopCarouselProduct[] }) {
  if (products.length === 0) return null;

  const doubled = [...products, ...products];

  return (
    <div
      className="relative min-w-0 overflow-hidden"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div className="sos-shop-marquee flex w-max items-center gap-4">
        {doubled.map((product, i) => (
          <Link
            key={`${product._id}-${i}`}
            href={`/shop/checkout?product=${product._id}&qty=1`}
            aria-hidden={i >= products.length}
            tabIndex={i >= products.length ? -1 : 0}
            className="group relative aspect-square w-[160px] flex-none overflow-hidden rounded-[14px] border border-cream/25 bg-bright-cream sm:w-[180px]"
          >
            {product.image && (
              <Image
                src={product.image.src}
                alt={product.image.alt || product.name}
                fill
                sizes="180px"
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
