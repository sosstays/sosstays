import Image from "next/image";
import { client } from "@/sanity/client";
import { SHOP_PAGE_QUERY, SHOP_PRODUCTS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { Reveal } from "@/components/Reveal";
import { ShopClient, type ShopProduct } from "@/components/shop/ShopClient";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(SHOP_PAGE_QUERY);
  return buildMetadata(
    {
      title: page?.seo?.title || "Shop | Sos Stays",
      description:
        page?.seo?.description ||
        "eVouchers for local experiences and real things placed in the house before you arrive — from the team at Sos Stays.",
      image: page?.seo?.image,
      noIndex: page?.seo?.noIndex,
    },
    "/shop"
  );
}

// ---- Fallback content ----
// Driven by the "Shop Page" singleton (studio/schemaTypes/documents/
// shopPage.ts) for hero copy, and by "shopProduct" documents for the
// actual items — see shopProduct.ts. Falls back to this if the singleton
// hasn't been created yet, same pattern as every other page singleton.

const DEFAULT_STATS = [
  { value: "60s", label: "eVoucher delivery" },
  { value: "14", label: "local makers & partners" },
];

export default async function ShopPage() {
  const [page, products, siteNavLinks] = await Promise.all([
    client.fetch(SHOP_PAGE_QUERY),
    client.fetch(SHOP_PRODUCTS_QUERY),
    getGuestSiteNavLinks(),
  ]);

  const stats = page?.heroStats?.length ? page.heroStats : DEFAULT_STATS;

  const resolvedProducts: ShopProduct[] = (
    products as {
      _id: string;
      kind: "voucher" | "goods";
      name: string;
      tagline: string;
      badge: string;
      price: number;
      unit: string;
      maxQuantity: number;
      image?: { alt?: string | null } | null;
      shortDescription: string;
      description: string;
      includes: string[];
      deliveryNote: string;
      allowStayDelivery: boolean;
      allowAddressDelivery: boolean;
    }[]
  ).map((p) => ({
    ...p,
    image: p.image ? { src: urlFor(p.image).width(900).url(), alt: p.image.alt ?? p.name } : null,
  }));

  return (
    <main className="overflow-x-hidden bg-cream text-near-black">
      <HeroNav links={siteNavLinks} ctaHref="/shop" ctaLabel="Shop" sticky />

      {/* HERO */}
      <section className="relative overflow-hidden bg-cream px-8 pt-16 pb-18 sm:px-14 sm:pt-20">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <span className="mb-5 inline-flex items-center gap-2.5 text-xs font-bold tracking-widest text-forest-green/80 uppercase">
              <span className="h-px w-6.5 bg-forest-green/80" />
              {page?.heroEyebrow || "The Sos shop"}
            </span>
            <h1 className="font-serif mb-6 text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] font-bold tracking-tight text-deep-forest">
              {page?.heroHeading || "Two kinds of good surprise."}
            </h1>
            <p className="max-w-[46ch] text-lg leading-relaxed text-near-black/70">
              {page?.heroSubtext ||
                "Vouchers that land in an inbox in seconds — a day at Funtasia, an hour with a massage therapist. And real things we put in the house before anyone arrives: cookies, coffee, flowers, a bottle of something local."}
            </p>
            <div className="mt-8 flex flex-wrap gap-6.5">
              {stats.map((stat: { value: string; label: string }, i: number) => (
                <div key={stat.label} className="flex items-center gap-6.5">
                  {/* Hidden below sm: stats can wrap to their own line on
                      narrow screens, where a divider tied to the previous
                      item would render orphaned at the start of the row. */}
                  {i > 0 && <span className="hidden h-9 w-px bg-forest-green/25 sm:block" />}
                  <div>
                    <span className="font-condensed block text-[34px] font-bold text-deep-forest">
                      {stat.value}
                    </span>
                    <span className="text-sm text-near-black/60">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150} className="relative hidden h-[340px] lg:block">
            <div className="absolute top-[6%] left-[2%] h-[220px] w-[62%] overflow-hidden rounded-2xl shadow-[0_26px_60px_rgba(34,48,31,0.26)]">
              <Image
                src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=900&q=80"
                alt="Box of cookies"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute right-0 bottom-[4%] flex w-[66%] overflow-hidden rounded-2xl border border-forest-green/20 bg-cream shadow-[0_26px_60px_rgba(34,48,31,0.22)]">
              <div className="flex-1 px-5 py-5">
                <span className="font-condensed text-[10.5px] font-bold tracking-widest text-forest-green/70 uppercase">
                  eVoucher
                </span>
                <p className="font-serif mt-2 text-2xl font-bold text-deep-forest">Funtasia, for four</p>
                <p className="mt-1.5 text-[13px] text-near-black/55">Valid 12 months · Drogheda</p>
              </div>
              <div className="flex w-[84px] flex-none items-center justify-center border-l-2 border-dashed border-forest-green/35 bg-forest-green">
                <span className="font-condensed text-[22px] font-bold text-cream">€60</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SHOP GRID */}
      <ShopClient
        products={resolvedProducts}
        vouchersBlurb={
          page?.vouchersBlurb ||
          "Digital vouchers — a code and a PDF in the inbox within the minute. Good as a gift, good as a plan for the Wednesday nobody has thought about yet."
        }
        goodsBlurb={
          page?.goodsBlurb ||
          "Real things, put in the house before anyone arrives. Ordered by 2pm the day before, left on the counter by the cleaner."
        }
      />
    </main>
  );
}
