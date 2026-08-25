import { notFound } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/client";
import { LANDING_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { buildUplistingBookingUrl } from "@/sanity/uplisting";
import { JsonLd, buildBreadcrumbSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { Button } from "@/components/Button";
import { PropertyCard } from "@/components/PropertyCard";
import { ThingsToDoTabs } from "@/components/ThingsToDoTabs";
import type { Metadata } from "next";

export const revalidate = 60;

const SLUG = "hotels-near-funtasia";

async function getData() {
  const [page, siteSettings] = await Promise.all([
    client.fetch(LANDING_PAGE_QUERY, { slug: SLUG }),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);
  return { page, siteSettings };
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getData();
  if (!page) return {};
  return buildMetadata(page.seo, `/${SLUG}`);
}

export default async function HotelsNearFuntasiaPage() {
  const { page, siteSettings } = await getData();
  if (!page) notFound();

  const bookingUrl =
    page.primaryCtaUrl ||
    (page.featuredProperty?.uplistingPropertySlug && siteSettings?.bookingSubdomainUrl
      ? buildUplistingBookingUrl({
          bookingSubdomain: siteSettings.bookingSubdomainUrl,
          propertySlug: page.featuredProperty.uplistingPropertySlug,
        })
      : undefined);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: page.heroHeadline || "Hotels near Funtasia", url: `${SITE_URL}/${SLUG}` },
  ]);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={breadcrumbSchema} />

      {/* HERO */}
      <section className="relative min-h-[560px] w-full bg-forest-green px-8 pt-[180px] pb-16 sm:px-14 sm:pt-[200px]">
        {page.heroImage && (
          <Image
            src={urlFor(page.heroImage).width(1800).height(1200).url()}
            alt={page.heroImage.alt ?? page.heroHeadline}
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center 42%" }}
          />
        )}
        <div className="absolute inset-0 bg-forest-green/50" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-b from-forest-green/0 to-forest-green/70" />

        <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" />

        <div className="relative mx-auto max-w-3xl">
          {page.heroEyebrow && (
            <p className="mb-3.5 text-xs font-medium tracking-widest text-light-sage uppercase">
              {page.heroEyebrow}
            </p>
          )}
          <h1 className="font-serif text-4xl leading-[1.08] font-extrabold tracking-tight text-cream sm:text-6xl">
            {page.heroHeadline}
          </h1>
          {page.heroSubtext && (
            <p className="mt-5 max-w-2xl text-lg text-cream/85">{page.heroSubtext}</p>
          )}

          {page.heroTags && page.heroTags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {page.heroTags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-light-sage/50 bg-cream/10 px-4 py-1.5 text-sm font-semibold text-cream"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3.5">
            {bookingUrl && (
              <Button link={bookingUrl} bgColor="cream" color="forest-green" external>
                {page.primaryCtaLabel || "Book direct"}
              </Button>
            )}
            {page.secondaryCtaUrl && (
              <Button
                link={page.secondaryCtaUrl}
                variant="secondary"
                color="cream"
                external
              >
                {page.secondaryCtaLabel}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* DISTANCE STRIP — only renders if distanceStat is filled in Sanity */}
      {page.distanceStat && (
        <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-8 border-b border-sage-grey/40 px-8 py-10 sm:px-14">
          <div>
            <div className="font-serif text-4xl leading-none font-bold text-forest-green">
              {page.distanceStat}
            </div>
            {page.distanceLabel && (
              <div className="mt-1.5 text-sm text-near-black/60">{page.distanceLabel}</div>
            )}
          </div>
          {page.distanceText && (
            <p className="max-w-2xl min-w-[240px] flex-1 text-near-black/70">
              {page.distanceText}
            </p>
          )}
        </section>
      )}

      {/* DIRECT BOOKING PUSH — only renders if headline is filled */}
      {page.directBookingHeadline && (
        <section className="mx-auto max-w-6xl px-8 pt-14 sm:px-14">
          <div className="rounded-[18px] border border-sage-grey/40 bg-light-sage/15 p-8 sm:p-10">
            {page.directBookingBadge && (
              <span className="mb-3 inline-block rounded-full bg-forest-green px-3.5 py-1.5 text-xs font-bold text-cream">
                {page.directBookingBadge}
              </span>
            )}
            <h3 className="font-serif text-xl font-bold text-forest-green">
              {page.directBookingHeadline}
            </h3>
            {page.directBookingText && (
              <p className="mt-2 text-near-black/70">{page.directBookingText}</p>
            )}
          </div>
        </section>
      )}

      {/* FEATURED PROPERTY — only renders if a property is linked */}
      {page.featuredProperty && (
        <section className="mx-auto max-w-6xl px-8 pt-14 pb-5 sm:px-14">
          <h2 className="mb-6 font-serif text-[26px] font-bold tracking-tight text-forest-green">
            Where you&apos;ll stay
          </h2>
          <PropertyCard
            slug={page.featuredProperty.slug}
            name={page.featuredProperty.name}
            location={page.featuredProperty.location}
            shortDescription={page.featuredProperty.shortDescription}
            sleeps={page.featuredProperty.sleeps}
            coverImage={page.featuredProperty.coverImage}
            gallery={page.featuredProperty.gallery}
            surface="framed"
          />
        </section>
      )}

      {/* FLEXIBLE INFO SECTIONS */}
      {page.infoSections?.map((section: any, i: number) => (
        <section key={i} className="mx-auto max-w-6xl px-8 pt-14 sm:px-14">
          {section.eyebrow && (
            <p className="mb-2 text-xs font-semibold tracking-widest text-near-black/55 uppercase">
              {section.eyebrow}
            </p>
          )}
          {section.heading && (
            <h2 className="mb-2 font-serif text-[26px] font-bold tracking-tight text-forest-green">
              {section.heading}
            </h2>
          )}
          {section.body && <p className="mb-7 max-w-2xl text-near-black/70">{section.body}</p>}
          {section.items?.length > 0 && (
            <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
              {section.items.map((item: any, j: number) => (
                <div
                  key={j}
                  className="rounded-[10px] border border-sage-grey/40 bg-light-sage/10 p-5"
                >
                  {item.tag && (
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide text-forest-green uppercase">
                      {item.tag}
                    </span>
                  )}
                  {item.title && (
                    <h3 className="font-serif font-bold text-near-black">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="mt-1 text-[13px] leading-normal text-near-black/65">
                      {item.description}
                    </p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[13px] font-semibold text-forest-green"
                    >
                      Learn more →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* RELATED AREA GUIDE CONTENT — "while you're here", sourced from
          the referenced areaGuide rather than duplicated content */}
      {page.relatedAreaGuide?.thingsToDo && page.relatedAreaGuide.thingsToDo.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pt-14 pb-5 sm:px-14">
          <h2 className="mb-2 font-serif text-[26px] font-bold tracking-tight text-forest-green">
            While you&apos;re in the area
          </h2>
          <p className="mb-7 text-sm text-near-black/60">
            More from our {page.relatedAreaGuide.areaName} guide.
          </p>
          <ThingsToDoTabs items={page.relatedAreaGuide.thingsToDo} />
          <a
            href={`/areas/${page.relatedAreaGuide.slug}`}
            className="mt-6 inline-block text-sm font-semibold text-forest-green underline"
          >
            See the full area guide →
          </a>
        </section>
      )}

      {/* FINAL CTA */}
      {page.finalCtaHeadline && (
        <section className="mx-auto mt-14 mb-20 max-w-6xl px-8 sm:px-14">
          <div className="rounded-[18px] bg-forest-green px-10 py-14 text-center sm:px-14">
            <h2 className="font-serif text-2xl font-bold text-cream">{page.finalCtaHeadline}</h2>
            {page.finalCtaText && (
              <p className="mx-auto mt-3 max-w-lg text-light-sage">{page.finalCtaText}</p>
            )}
            {bookingUrl && (
              <div className="mt-6 flex justify-center">
                <Button link={bookingUrl} bgColor="cream" color="forest-green" external>
                  {page.primaryCtaLabel || "Book direct"}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
