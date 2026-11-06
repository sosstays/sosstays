import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { client } from "@/sanity/client";
import { BESPOKE_TRIP_PAGE_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { FaqSection } from "@/components/FaqSection";
import { BespokeTripForm } from "@/components/BespokeTripForm";
import { DetailsScrollStack } from "@/components/DetailsScrollStack";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(BESPOKE_TRIP_PAGE_QUERY);
  if (!page) return {};
  return buildMetadata(page.seo, "/bespoke-ireland-trip");
}

function buildBespokeTripServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Bespoke Ireland Trip Planning & Concierge",
    serviceType: "Bespoke Ireland trip planning and concierge",
    description:
      "Bespoke concierge for families and groups travelling to Ireland — accommodation in our Irish houses, event and transport planning, golf tee times and family itineraries, for events like the Ryder Cup, weddings and Paddy's weekend.",
    provider: {
      "@type": "Organization",
      name: "SOS Stays",
      url: "https://sosstays.com",
      email: "hello@sosstays.com",
    },
    areaServed: { "@type": "Country", name: "Ireland" },
  };
}

function buildBespokeTripOrganizationSchema() {
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

export default async function BespokeIrelandTripPage() {
  const [page, siteNavLinks] = await Promise.all([
    client.fetch(BESPOKE_TRIP_PAGE_QUERY),
    getGuestSiteNavLinks(),
  ]);
  if (!page) notFound();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Bespoke Ireland Trip", url: `${SITE_URL}/bespoke-ireland-trip` },
  ]);
  const faqSchema = buildFaqSchema(page.faqs);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={buildBespokeTripServiceSchema()} />
      <JsonLd data={buildBespokeTripOrganizationSchema()} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* HERO */}
      <section className="relative flex min-h-[86vh] flex-col justify-end overflow-hidden bg-deep-forest px-8 pt-[180px] pb-16 sm:px-14 sm:pt-[200px]">
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

      {/* WE TAKE CARE OF EVERY DETAIL — scroll-converge photo stack */}
      {page.detailItems?.length > 0 && (
        <DetailsScrollStack
          eyebrow={page.detailsEyebrow}
          heading={page.detailsHeading}
          headingAccent={page.detailsHeadingAccent}
          items={page.detailItems}
        />
      )}

      {/* HOW IT WORKS */}
      {page.howItWorksSteps?.length > 0 && (
        <section className="bg-light-forest-green/25 px-8 py-28 sm:px-14">
          <div className="mx-auto max-w-6xl">
            <Reveal
              as="h2"
              className="mb-11 max-w-[26ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
            >
              {page.howItWorksHeading}
            </Reveal>
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
              {page.howItWorksSteps.map((item: { title: string; text: string }, i: number) => (
                <Reveal
                  key={item.title}
                  delay={i * 100}
                  className="rounded-[18px] border border-sage-grey/40 bg-cream p-7"
                >
                  <span className="font-serif text-4xl font-semibold text-maroon">{i + 1}</span>
                  <h3 className="mt-3 font-serif text-xl font-bold text-forest-green">{item.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-near-black/75">{item.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHAT WE ARRANGE */}
      {page.whatWeArrangeItems?.length > 0 && (
        <section className="bg-maroon px-8 py-28 sm:px-14">
          <div className="mx-auto max-w-6xl">
            <Reveal
              as="h2"
              className="mb-8 max-w-[22ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-cream"
            >
              {page.whatWeArrangeHeading}
            </Reveal>
            <Reveal delay={100}>
              <ul className="grid max-w-3xl grid-cols-1 gap-3">
                {page.whatWeArrangeItems.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-cream/88">
                    <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-light-sage" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {/* THE HOUSES */}
      {page.houses?.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
          <Reveal
            as="h2"
            className="mb-10 font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
          >
            {page.housesHeading}
          </Reveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {page.houses.map(
              (
                house: {
                  _id: string;
                  name: string;
                  slug: string;
                  location?: string;
                  shortDescription?: string;
                  coverImage?: Record<string, unknown>;
                },
                i: number
              ) => (
                <Reveal key={house._id} delay={i * 100}>
                  <a
                    href={`/stays/${house.slug}`}
                    className="group block overflow-hidden rounded-[18px] border border-sage-grey/40 bg-bright-cream transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                  >
                    {house.coverImage && (
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <Image
                          src={urlFor(house.coverImage).width(900).height(560).url()}
                          alt={(house.coverImage.alt as string | undefined) ?? house.name}
                          fill
                          sizes="(min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6.5">
                      {house.location && (
                        <span className="text-[11.5px] font-semibold tracking-[0.14em] text-maroon uppercase">
                          {house.location}
                        </span>
                      )}
                      <h3 className="mt-2 font-serif text-xl font-bold text-forest-green">{house.name}</h3>
                      {house.shortDescription && (
                        <p className="mt-2 text-[14.5px] leading-relaxed text-near-black/72">
                          {house.shortDescription}
                        </p>
                      )}
                      <span className="mt-3.5 inline-block text-[13.5px] font-semibold text-forest-green">
                        See the stay →
                      </span>
                    </div>
                  </a>
                </Reveal>
              )
            )}
          </div>
          {page.housesFooterNote && (
            <Reveal delay={180} as="p" className="mt-6 text-[15px] font-medium text-near-black/60">
              {page.housesFooterNote}
            </Reveal>
          )}
        </section>
      )}

      {/* EXPLORE IRELAND BY AREA */}
      {(page.areaGuides?.length > 0 || page.moreAreasLabel) && (
        <section className="bg-warm-cream px-8 py-28 sm:px-14">
          <div className="mx-auto max-w-6xl">
            {page.areasEyebrow && (
              <Reveal
                as="p"
                className="mb-3.5 text-[13px] font-semibold tracking-[0.2em] text-forest-green/80 uppercase"
              >
                {page.areasEyebrow}
              </Reveal>
            )}
            <Reveal
              as="h2"
              delay={80}
              className="mb-10 max-w-[24ch] font-serif text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.06] font-bold tracking-tight text-deep-forest"
            >
              {page.areasHeading}
            </Reveal>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {(page.areaGuides ?? []).map(
                (
                  area: { _id: string; areaName: string; slug: string; heroImage?: Record<string, unknown> },
                  i: number
                ) => (
                  <Reveal key={area._id} delay={140 + i * 80}>
                    <a
                      href={`/areas/${area.slug}`}
                      className="group relative block h-[300px] overflow-hidden rounded-[14px] border border-sage-grey/40 bg-deep-forest"
                    >
                      {area.heroImage && (
                        <>
                          <Image
                            src={urlFor(area.heroImage).width(900).height(900).url()}
                            alt={(area.heroImage.alt as string | undefined) ?? area.areaName}
                            fill
                            sizes="(min-width: 640px) 33vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                        </>
                      )}
                      <div className="absolute right-5 bottom-5 left-5">
                        <h3 className="font-serif text-lg font-bold text-cream">{area.areaName}</h3>
                        <span className="mt-3 inline-block text-[13px] font-semibold text-light-sage">
                          See the guide →
                        </span>
                      </div>
                    </a>
                  </Reveal>
                )
              )}
              {page.moreAreasLabel && (
                <Reveal delay={140 + (page.areaGuides?.length ?? 0) * 80}>
                  <a
                    href="/areas"
                    className="group relative block h-[300px] overflow-hidden rounded-[14px] border border-sage-grey/40 bg-light-forest-green/20"
                  >
                    <div className="absolute right-5 bottom-5 left-5">
                      <h3 className="font-serif text-lg font-bold text-forest-green">{page.moreAreasLabel}</h3>
                      {page.moreAreasDescription && (
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-near-black/70">
                          {page.moreAreasDescription}
                        </p>
                      )}
                      <span className="mt-3 inline-block text-[13px] font-semibold text-maroon">See the guide →</span>
                    </div>
                  </a>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SAMPLE ITINERARIES */}
      {page.itineraries?.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
          <Reveal
            as="h2"
            className="mb-10 max-w-[22ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
          >
            {page.itinerariesHeading}
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {page.itineraries.map((it: { title: string; text: string }, i: number) => (
              <Reveal
                key={it.title}
                delay={i * 90}
                className="rounded-[18px] border border-sage-grey/40 bg-light-forest-green/20 p-7"
              >
                <h3 className="font-serif text-lg font-bold text-maroon">{it.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-near-black/78">{it.text}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {page.faqs?.length > 0 && (
        <div className="pt-28">
          <FaqSection
            id="faq"
            heading={page.faqHeading}
            items={page.faqs}
            accent="forest-green"
            maxWidth="820px"
          />
        </div>
      )}

      {/* START THE CONVERSATION */}
      <section id="enquire" className="bg-maroon px-8 py-28 sm:px-14">
        <div className="mx-auto max-w-3xl">
          <Reveal
            as="h2"
            className="mb-3 font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-cream"
          >
            {page.enquireHeading}
          </Reveal>
          {page.enquireText && (
            <Reveal as="p" delay={80} className="mb-9 text-lg leading-relaxed text-cream/85">
              {page.enquireText}
            </Reveal>
          )}
          <Reveal delay={140}>
            <BespokeTripForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
