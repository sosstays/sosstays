import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { PROPERTY_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { buildUplistingBookingUrl } from "@/sanity/uplisting";
import { buildMetadata } from "@/sanity/metadata";
import { portableTextToPlain } from "@/sanity/portableText";
import { urlFor } from "@/sanity/image";
import { toGoogleMapsEmbedSrc } from "@/lib/googleMapsEmbed";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { PropertyGallery } from "@/components/PropertyGallery";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: re-fetch at most once a minute

function BookNowCta({
  bookingUrl,
  className,
}: {
  bookingUrl: string | null;
  className?: string;
}) {
  return bookingUrl ? (
    <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className={className}>
      Book now
    </a>
  ) : (
    <span className={`${className} cursor-not-allowed opacity-60`}>Booking coming soon</span>
  );
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await client.fetch(PROPERTY_PAGE_QUERY, { slug });
  if (!property) return {};
  return buildMetadata(property.seo, `/stays/${slug}`);
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const [property, siteSettings] = await Promise.all([
    client.fetch(PROPERTY_PAGE_QUERY, { slug }),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);

  if (!property) notFound();

  // uplistingPropertySlug is documented (and validated) in Studio as a
  // short Uplisting property_slug, to be combined with Site Settings'
  // bookingSubdomainUrl. In practice it's currently been filled in with a
  // ready-to-use booking URL directly (and Site Settings has no
  // bookingSubdomainUrl set at all) — so use it as-is when it's already a
  // full URL, and only fall back to the slug+subdomain construction
  // otherwise.
  const bookingUrl = property.uplistingPropertySlug?.startsWith("http")
    ? property.uplistingPropertySlug
    : siteSettings?.bookingSubdomainUrl && property.uplistingPropertySlug
      ? buildUplistingBookingUrl({
          bookingSubdomain: siteSettings.bookingSubdomainUrl,
          propertySlug: property.uplistingPropertySlug,
        })
      : null;

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      {/* HERO GALLERY */}
      <section className="relative">
        <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Send your SOS" />
        <PropertyGallery images={property.gallery ?? []} alt={property.name} />
      </section>

      {/* TITLE BLOCK */}
      <section className="mx-auto max-w-4xl px-8 pt-9 sm:px-14">
        <p className="mb-3 text-xs font-medium tracking-widest text-forest-green uppercase">
          {property.location}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-3xl leading-tight font-extrabold tracking-tight text-near-black sm:text-4xl">
            {property.name}
          </h1>
          {property.sleeps && (
            <span className="rounded-full bg-light-sage/35 px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-forest-green">
              Sleeps {property.sleeps}
            </span>
          )}
        </div>
      </section>

      {/* AVAILABILITY BAR */}
      <section className="mx-auto max-w-4xl px-8 pt-7 sm:px-14">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-[10px] border border-sage-grey/40 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--forest-green)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-none"
            >
              <rect x="4" y="5" width="16" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M4 11h16" />
            </svg>
            <span className="text-[15px] font-medium text-near-black">
              Check availability for your dates
            </span>
          </div>
          <BookNowCta
            bookingUrl={bookingUrl}
            className="inline-block rounded-full bg-forest-green px-7 py-3.5 text-[15px] font-semibold whitespace-nowrap text-cream transition-opacity hover:opacity-85"
          />
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-4xl px-8 pt-12 pb-14 sm:px-14">
        {property.amenities?.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2.5">
            {property.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="rounded-full bg-light-sage/25 px-4 py-2 text-[13px] text-near-black"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
        {(property.sleeps || property.bedrooms) && (
          <p className="mb-5 text-sm text-near-black/60">
            {[
              property.sleeps && `Sleeps ${property.sleeps}`,
              property.bedrooms && `${property.bedrooms} bedrooms`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {property.shortDescription && (
          <p className="mb-5 max-w-[720px] text-lg leading-[1.65] text-near-black">
            {property.shortDescription}
          </p>
        )}
        {property.fullDescription && (
          <div className="prose prose-neutral max-w-[720px] text-near-black/80 [&_p]:my-3">
            <PortableText value={property.fullDescription} />
          </div>
        )}
      </section>

      {/* AREAS */}
      <section id="areas" className="mx-auto max-w-[1100px] px-8 py-14 sm:px-14">
        <p className="mb-2 text-xs tracking-widest text-near-black/55 uppercase">Areas</p>
        <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight text-forest-green">
          In the area
        </h2>

        <div className="h-[320px] overflow-hidden rounded-[10px] border border-sage-grey/40">
          <iframe
            src={toGoogleMapsEmbedSrc(property.locationLink, `${property.location}, Ireland`)}
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>

        {property.relatedAreaGuides?.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {property.relatedAreaGuides.map((guide: any) => (
              <Link
                key={guide._id}
                href={`/areas/${guide.slug}`}
                className="block overflow-hidden rounded-[10px] border border-sage-grey/40 bg-white"
              >
                {guide.heroImage ? (
                  <div className="relative h-40">
                    <Image
                      src={urlFor(guide.heroImage).width(500).height(320).url()}
                      alt={guide.heroImage.alt ?? guide.areaName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-light-sage/25" />
                )}
                <div className="p-5">
                  <h3 className="mb-2 font-serif text-lg font-bold text-near-black">
                    {guide.areaName}
                  </h3>
                  {guide.introduction && (
                    <p className="mb-3 text-sm leading-relaxed text-near-black/70">
                      {portableTextToPlain(guide.introduction, 140)}
                    </p>
                  )}
                  <span className="text-sm font-semibold text-forest-green">
                    Explore {guide.areaName} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      {property.faqs?.length > 0 && (
        <section className="mx-auto max-w-[720px] px-8 pb-24 sm:px-14">
          <h2 className="mb-6 font-serif text-2xl font-bold tracking-tight text-forest-green">
            Good to know
          </h2>
          <div className="border-t border-sage-grey/40">
            {property.faqs.map((faq: any, i: number) => (
              <details key={i} className="border-b border-sage-grey/40 py-4.5">
                <summary className="cursor-pointer text-[15px] font-semibold text-near-black marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-near-black/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl px-8 pb-24 text-center sm:px-14">
        <div className="rounded-[18px] bg-forest-green px-8 py-14">
          <h2 className="mb-3 font-serif text-2xl font-bold tracking-tight text-cream">
            Ready to stay at {property.name}?
          </h2>
          <p className="mb-7 text-[15px] text-light-sage">Check your dates and send it.</p>
          <BookNowCta
            bookingUrl={bookingUrl}
            className="inline-block rounded-full bg-cream px-8 py-4 text-[15px] font-semibold text-forest-green transition-opacity hover:opacity-85"
          />
        </div>
      </section>
    </main>
  );
}
