import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { client } from "@/sanity/client";
import { GIFT_MAKER_PAGE_QUERY, SHOP_PRODUCTS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { FaqSection } from "@/components/FaqSection";
import { GiftMakerWizard, type GiftCatalogueItem } from "@/components/GiftMakerWizard";
import { Button } from "@/components/Button";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(GIFT_MAKER_PAGE_QUERY);
  if (!page) return {};
  return buildMetadata(page.seo, "/gift-maker");
}

function buildGiftMakerServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Corporate & Personal Irish Gift Building",
    serviceType: "Corporate and personal gift curation",
    description:
      "A guided tool that builds real Irish gift packages — led by an SOS Stays gift voucher and filled out with local treats and experiences — matched to budget, recipient and delivery needs, for corporate gifting and personal occasions.",
    provider: {
      "@type": "Organization",
      name: "SOS Stays",
      url: "https://sosstays.com",
      email: "hello@sosstays.com",
    },
    areaServed: { "@type": "Country", name: "Ireland" },
  };
}

function buildGiftMakerOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SOS Stays",
    url: "https://sosstays.com",
    email: "hello@sosstays.com",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@sosstays.com",
      contactType: "customer service",
      areaServed: "IE",
    },
  };
}

export default async function GiftMakerPage() {
  const [page, shopProducts, siteNavLinks] = await Promise.all([
    client.fetch(GIFT_MAKER_PAGE_QUERY),
    client.fetch(SHOP_PRODUCTS_QUERY),
    getGuestSiteNavLinks(),
  ]);
  if (!page) notFound();

  const catalogue: GiftCatalogueItem[] = (
    shopProducts as { _id: string; name: string; price: number; kind: "goods" | "voucher" }[]
  ).map((p) => ({ _id: p._id, name: p.name, price: p.price, kind: p.kind }));

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Gift Maker", url: `${SITE_URL}/gift-maker` },
  ]);
  const faqSchema = buildFaqSchema(page.faqs);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={buildGiftMakerServiceSchema()} />
      <JsonLd data={buildGiftMakerOrganizationSchema()} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* HERO */}
      <section className="relative flex min-h-[76vh] flex-col justify-end overflow-hidden bg-deep-forest px-8 pt-[180px] pb-16 sm:px-14 sm:pt-[200px]">
        {page.heroImage && (
          <div className="absolute inset-[-10%_0]">
            <Image
              src={urlFor(page.heroImage).width(1800).height(1400).url()}
              alt={page.heroImage.alt ?? page.heading}
              fill
              priority
              className="object-cover"
              style={{ objectPosition: "center 55%" }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-forest/70 via-deep-forest/40 to-deep-forest/88" />

        <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" />

        <div className="relative mx-auto w-full max-w-[760px]">
          {page.heroEyebrow && (
            <Eyebrow className="mb-4" tone="sage" delay={0}>
              {page.heroEyebrow}
            </Eyebrow>
          )}
          <Reveal as="h1" delay={130} className="mb-5 font-serif text-4xl leading-[1.08] font-extrabold tracking-tight text-cream sm:text-6xl">
            {page.heading}
          </Reveal>
          {page.subhead && (
            <Reveal as="p" delay={200} className="mb-6 max-w-2xl text-xl font-semibold leading-snug text-light-sage">
              {page.subhead}
            </Reveal>
          )}
          {page.heroParagraph && (
            <Reveal as="p" delay={260} className="max-w-2xl text-lg leading-relaxed text-cream/88">
              {page.heroParagraph}
            </Reveal>
          )}
        </div>
      </section>

      {/* WHY GIFT WITH US */}
      {page.whyItems?.length > 0 && (
        <section className="bg-light-forest-green/25 px-8 py-28 sm:px-14">
          <div className="mx-auto max-w-6xl">
            <Reveal
              as="h2"
              className="mb-11 max-w-[26ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
            >
              {page.whyHeading}
            </Reveal>
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              {page.whyItems.map((item: { title: string; text: string }, i: number) => (
                <Reveal key={item.title} delay={i * 90} className="rounded-[18px] border border-sage-grey/40 bg-cream p-7">
                  <h3 className="font-serif text-xl font-bold text-forest-green">{item.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-near-black/75">{item.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      {page.howSteps?.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
          <Reveal
            as="h2"
            className="mb-11 max-w-[26ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
          >
            {page.howHeading}
          </Reveal>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
            {page.howSteps.map((item: { title: string; text: string }, i: number) => (
              <Reveal key={item.title} delay={i * 100} className="rounded-[18px] border border-sage-grey/40 bg-bright-cream p-7">
                <span className="font-serif text-4xl font-semibold text-maroon">{i + 1}</span>
                <h3 className="mt-3 font-serif text-xl font-bold text-forest-green">{item.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-near-black/75">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* THE GIFT MAKER TOOL */}
      <section id="build-a-gift" className="mx-auto max-w-3xl px-8 py-28 sm:px-14">
        <Reveal
          as="h2"
          className="mb-3 text-center font-serif text-[clamp(2rem,3.8vw,2.75rem)] leading-[1.06] font-bold tracking-tight text-deep-forest"
        >
          Build your gift
        </Reveal>
        <Reveal as="p" delay={80} className="mb-10 text-center text-[16px] leading-relaxed text-near-black/70">
          Takes about a minute — answer five quick questions and we&apos;ll put real options in front of you.
        </Reveal>
        <Reveal delay={140}>
          <GiftMakerWizard products={catalogue} />
        </Reveal>
      </section>

      {/* FAQ */}
      {page.faqs?.length > 0 && (
        <div className="pt-4">
          <FaqSection id="faq" heading={page.faqHeading} items={page.faqs} accent="forest-green" maxWidth="820px" />
        </div>
      )}

      {/* CLOSING CTA */}
      <section className="bg-maroon px-8 py-28 sm:px-14">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal
            as="h2"
            className="mb-3 font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-cream"
          >
            {page.ctaHeading}
          </Reveal>
          {page.ctaText && (
            <Reveal as="p" delay={80} className="mb-9 text-lg leading-relaxed text-cream/85">
              {page.ctaText}
            </Reveal>
          )}
          <Reveal delay={140}>
            <Button link="/contact?topic=About+a+booking#contact-form" variant="primary" bgColor="cream" color="maroon" size="md">
              Talk to our team
            </Button>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
