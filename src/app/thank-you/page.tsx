import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import {
  HOMEPAGE_QUERY,
  HOMEPAGE_BLOG_QUERY,
  SITE_SETTINGS_QUERY,
  SHOP_PRODUCTS_QUERY,
  PROPERTY_ORDER_QUERY,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { orderProperties } from "@/lib/propertyOrder";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Eyebrow } from "@/components/Eyebrow";
import { PropertyCard, type PropertyCardProps } from "@/components/PropertyCard";
import { HomeBlogGrid } from "@/components/HomeBlogGrid";
import { ShopCarousel, type ShopCarouselProduct } from "@/components/ShopCarousel";

export const revalidate = 60;

// Dead-end confirmation page — every lead form on the site (contact,
// corporate stays, partner signup) redirects here on success instead of
// showing its own inline "thanks" message. The landlord lead form is the
// one exception: it keeps visitors on its own page so it can reveal the
// revenue calculator right after submission, pre-filled with their details.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ThankYouPage() {
  const [{ properties: allProperties }, homeBlog, siteSettings, shopProducts, propertyOrder] = await Promise.all([
    client.fetch(HOMEPAGE_QUERY),
    client.fetch(HOMEPAGE_BLOG_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
    client.fetch(SHOP_PRODUCTS_QUERY),
    client.fetch(PROPERTY_ORDER_QUERY),
  ]);
  const properties = orderProperties<PropertyCardProps & { _id: string }>(
    allProperties,
    propertyOrder?.orderedSlugs
  ).slice(0, 3);

  const instagramUrl = siteSettings?.socialLinks?.find(
    (link: { platform: string; url: string }) => link.platform === "instagram"
  )?.url;

  const carouselProducts: ShopCarouselProduct[] = (
    shopProducts as { _id: string; name: string; price: number; image?: { alt?: string | null } | null }[]
  ).map((p) => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    image: p.image ? { src: urlFor(p.image).width(600).height(600).url(), alt: p.image.alt ?? p.name } : null,
  }));

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <header className="flex items-center justify-between px-8 py-[22px] sm:px-14">
        <Link href="/" className="flex items-center">
          <Logo className="h-[30px] w-auto text-forest-green" />
        </Link>
      </header>

      {/* CONFIRMATION */}
      <section className="mx-auto max-w-[640px] px-6 pt-10 pb-16 text-center sm:pt-14">
        <div className="rounded-[18px] border border-sage-grey/40 bg-bright-cream px-8 py-12 sm:px-12 sm:py-14">
          <Eyebrow tone="maroon" className="mb-5">
            Message sent
          </Eyebrow>
          <CheckCircle2 size={64} stroke="var(--forest-green)" strokeWidth={1.75} className="mx-auto mb-5" />
          <h1 className="mb-2.5 font-serif text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] font-extrabold tracking-tight text-forest-green">
            Thank you!
          </h1>
          <p className="mx-auto max-w-[420px] text-lg leading-[1.55] text-near-black/70">
            One of our team members will be in touch with you shortly.
          </p>
          <p className="mx-auto mt-2.5 max-w-[420px] text-sm leading-[1.55] text-near-black/60">
            Need us sooner? Message us on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Button
              link="/"
              variant="primary"
              bgColor="forest-green"
              color="cream"
              animateColor="forest-green"
              size="custom"
              className="px-6 py-3 text-sm font-semibold"
            >
              <span className="inline-flex items-center gap-2">
                <ArrowLeft size={15} />
                Back to homepage
              </span>
            </Button>
            <Button
              link="https://wa.me/353894801345"
              external
              variant="secondary"
              color="forest-green"
              animateBgColor="forest-green"
              animateColor="cream"
              size="custom"
              className="border-forest-green/50 px-6 py-3 text-sm font-semibold"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle size={15} />
                Message us on WhatsApp
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* INSTAGRAM — same embed/follow-button pattern as the homepage. Plain
          cream (not a full-bleed colored band) so it reads as a normal
          content section between the confirmation card and the maroon
          shop band below, rather than another full-width strip. */}
      <section className="px-8 py-16 sm:px-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
            <div>
              <Eyebrow className="mb-2" delay={0}>
                While you wait
              </Eyebrow>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-forest-green sm:text-3xl">
                On Instagram
              </h2>
            </div>
            {instagramUrl && (
              <Button link={instagramUrl} external variant="primary" size="custom" className="px-7 py-3.5 text-[15px] font-semibold">
                Follow us on Instagram
              </Button>
            )}
          </div>
          <behold-widget feed-id="WcXQ8APwHKWEf2AxzA0R"></behold-widget>
        </div>
      </section>
      <Script src="https://w.behold.so/widget.js" type="module" strategy="afterInteractive" />

      {/* SHOP STRIP — maroon band matching the owner-context accent used
          elsewhere on the site, with a contained (not full-bleed), always-
          moving product marquee instead of a manually-advanced carousel. */}
      {carouselProducts.length > 0 && (
        <section className="bg-maroon px-8 py-16 sm:px-14 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <Eyebrow tone="sage" className="mb-2" delay={0}>
                  From the shop
                </Eyebrow>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                  Gift a getaway
                </h2>
              </div>
              <Button
                link="/shop"
                variant="secondary"
                color="cream"
                animateColor="maroon"
                size="custom"
                className="px-7 py-3.5 text-[15px] font-semibold"
              >
                Visit the shop
              </Button>
            </div>
            <ShopCarousel products={carouselProducts} />
          </div>
        </section>
      )}

      {/* BLOG — featured post + two most recent, same component as homepage */}
      <HomeBlogGrid data={homeBlog} />

      {/* STAYS — light-forest-green tint band so the page closes on a third
          distinct brand-color zone (cream → maroon → forest-green),
          matching the homepage's own alternating rhythm. */}
      {properties.length > 0 && (
        <section className="bg-light-forest-green/30 px-8 py-16 sm:px-14 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
                Our stays
              </h2>
              <p className="max-w-[380px] text-near-black/60">Have a proper look around each one.</p>
            </div>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property: PropertyCardProps & { _id: string }) => (
                <PropertyCard
                  key={property._id}
                  slug={property.slug}
                  name={property.name}
                  location={property.location}
                  shortDescription={property.shortDescription}
                  sleeps={property.sleeps}
                  coverImage={property.coverImage}
                  surface="framed"
                  hideSleeps
                />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button link="/stays" variant="primary" bgColor="forest-green" color="cream">
                View all stays
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
