import { Suspense } from "react";
import Image from "next/image";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY, SHOP_PRODUCTS_QUERY, PARTNERS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { ContactForm } from "@/components/ContactForm";
import { ContactPromiseBubble } from "@/components/ContactPromiseBubble";
import { ContactMethodsGrid } from "@/components/ContactMethodsGrid";
import { ShopCarousel, type ShopCarouselProduct } from "@/components/ShopCarousel";
import { PartnerCarousel, type PartnerCarouselItem } from "@/components/PartnerCarousel";
import { BespokeTripCta } from "@/components/BespokeTripCta";
import { Button } from "@/components/Button";
import { Eyebrow } from "@/components/Eyebrow";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(
    {
      title: "Contact Sos Stays | Drogheda, Co. Louth",
      description:
        "Contact Sos Stays in Drogheda. Email hello@sosstays.com, WhatsApp +353 89 480 1345, or send the form. Irish company, CRO 746631.",
    },
    "/contact",
  );
}

export default async function ContactPage() {
  const [siteSettings, siteNavLinks, shopProducts, partners] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    getGuestSiteNavLinks(),
    client.fetch(SHOP_PRODUCTS_QUERY),
    client.fetch(PARTNERS_QUERY),
  ]);

  const shopCarouselProducts: ShopCarouselProduct[] = (
    shopProducts as { _id: string; name: string; price: number; image?: { alt?: string | null } | null }[]
  ).map((p) => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    image: p.image ? { src: urlFor(p.image).width(600).height(600).url(), alt: p.image.alt ?? p.name } : null,
  }));

  const partnerCarouselItems: PartnerCarouselItem[] = (
    partners as {
      _id: string;
      name: string;
      tagline?: string | null;
      href: string;
      profileHref?: string | null;
      slug?: string | null;
      image?: { alt?: string | null } | null;
    }[]
  ).map((p) => ({
    _id: p._id,
    name: p.name,
    tagline: p.tagline,
    href: p.profileHref || (p.slug ? `/partners/${p.slug}` : p.href),
    image: p.image ? { src: urlFor(p.image).width(480).height(320).url(), alt: p.image.alt ?? p.name } : null,
  }));

  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="min-h-screen overflow-x-hidden bg-cream text-near-black">
        {/* HERO + FORM */}
        <div className="grid grid-cols-1 gap-10 px-5 py-10 sm:px-10 lg:grid-cols-[2fr_3fr] lg:items-center lg:gap-24 lg:px-[60px]">
          {/* IMAGE — stacked below the form on smaller screens, to the side on lg+ */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage-grey/20 sm:aspect-[16/9] lg:aspect-[4/5]">
              <Image
                src="https://plus.unsplash.com/premium_photo-1677529485307-34dc32286a21?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG290by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Two friends smiling together, warm portrait light"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 35vw, 90vw"
                priority
              />
              <Reveal delay={250} className="absolute right-4 bottom-4 left-4 z-10 sm:right-6 sm:bottom-6 sm:left-auto sm:w-[360px]">
                <ContactPromiseBubble />
              </Reveal>
            </div>

            <Reveal delay={300} className="mt-6 rounded-2xl bg-pale-sage p-6 sm:p-7">
              <h2 className="font-serif mb-3 text-lg font-bold text-deep-forest">Sos Stays Power Rangers Ltd</h2>
              <p className="text-[15px] leading-relaxed text-near-black/80">
                CRO 746631
                <br />
                The Mill Enterprise Centre, Drogheda, Co. Louth, Ireland
              </p>
            </Reveal>
          </div>

          {/* CONTENT */}
          <div className="order-1 lg:order-2">
            <Reveal as="h1" className="font-serif mb-5 text-4xl font-bold tracking-tight text-forest-green sm:text-5xl">
              Contact Us
            </Reveal>

            <Reveal delay={150} id="contact-form" className="scroll-mt-28 border-t border-sage-grey/50 pt-12">
              <Suspense>
                <ContactForm contactEmail={siteSettings?.contactEmail} />
              </Suspense>
            </Reveal>
          </div>
        </div>

        {/* ALTERNATIVE WAYS TO REACH US */}
        <section className="bg-pale-sage px-8 py-20 sm:px-14 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal as="h2" className="font-serif mb-12 text-center text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
              Alternative ways to reach us
            </Reveal>
            <ContactMethodsGrid />
          </div>
        </section>

        {/* PARTNERS — carousel of who we already work with, driving toward
            the form above with "Partner outreach" pre-selected. */}
        {partnerCarouselItems.length > 0 && (
          <section className="px-8 py-20 sm:px-14 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <Eyebrow className="mb-2">Partner with us</Eyebrow>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-forest-green sm:text-3xl">
                    Join our partner network
                  </h2>
                  <p className="mt-2 max-w-[480px] text-[15px] text-near-black/65">
                    Cleaners, photographers, tour operators and local businesses we already send guests to.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button link="/partners" variant="secondary" color="forest-green" animateColor="cream" animateBgColor="forest-green" size="custom" className="px-6 py-3 text-sm font-semibold">
                    See all partners
                  </Button>
                  <Button
                    link="/contact?topic=Partner+outreach#contact-form"
                    variant="primary"
                    bgColor="forest-green"
                    color="cream"
                    size="custom"
                    className="px-6 py-3 text-sm font-semibold"
                  >
                    Become a partner
                  </Button>
                </div>
              </div>
              <PartnerCarousel partners={partnerCarouselItems} />
            </div>
          </section>
        )}

        {/* SHOP — same contained marquee strip as the thank-you page's shop
            band, driving toward the form above with "Add to shop"
            pre-selected. */}
        {shopCarouselProducts.length > 0 && (
          <section className="bg-maroon px-8 py-20 sm:px-14 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <Eyebrow tone="sage" className="mb-2">
                    Sell to our guests
                  </Eyebrow>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                    Get your product in our shop
                  </h2>
                  <p className="mt-2 max-w-[480px] text-[15px] text-cream/75">
                    Vouchers and local goods we hand-pick and sell straight to guests booking a stay.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button link="/shop" variant="secondary" color="cream" animateColor="maroon" size="custom" className="px-6 py-3 text-sm font-semibold">
                    Visit the shop
                  </Button>
                  <Button
                    link="/contact?topic=Add+to+shop#contact-form"
                    variant="primary"
                    bgColor="cream"
                    color="maroon"
                    size="custom"
                    className="px-6 py-3 text-sm font-semibold"
                  >
                    Add your product
                  </Button>
                </div>
              </div>
              <ShopCarousel products={shopCarouselProducts} />
            </div>
          </section>
        )}

        {/* BESPOKE TRIP CTA */}
        <div className="py-24 sm:py-28">
          <BespokeTripCta />
        </div>
      </main>
    </>
  );
}
