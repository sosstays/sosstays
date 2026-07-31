import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { PROPERTY_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { buildUplistingBookingUrl } from "@/sanity/uplisting";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { portableTextToPlain } from "@/sanity/portableText";
import { urlFor } from "@/sanity/image";
import {
  JsonLd,
  buildLodgingBusinessSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "@/sanity/jsonld";
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

const overviewIconProps = {
  width: 30,
  height: 30,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "var(--forest-green)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function GuestsIcon() {
  return (
    <svg {...overviewIconProps}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.5 12c2.6.2 4.5 2 4.5 5" />
    </svg>
  );
}

function BedsIcon() {
  return (
    <svg {...overviewIconProps}>
      <path d="M3 19v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
      <path d="M3 17h18" />
      <path d="M3 19v2M21 19v2" />
      <path d="M7 9V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
    </svg>
  );
}

function BedroomsIcon() {
  return (
    <svg {...overviewIconProps}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 12h6v8" />
    </svg>
  );
}

function BathroomsIcon() {
  return (
    <svg {...overviewIconProps}>
      <path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z" />
      <path d="M6 12V6a2 2 0 0 1 3.5-1.3" />
      <path d="M8 20v1.5M16 20v1.5" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <svg {...overviewIconProps}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function PropertyOverview({
  guests,
  beds,
  bedrooms,
  bathrooms,
  type,
}: {
  guests?: number | null;
  beds?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  type?: string | null;
}) {
  const items = [
    { label: "Guests", value: guests, Icon: GuestsIcon },
    { label: "Beds", value: beds, Icon: BedsIcon },
    { label: "Bedrooms", value: bedrooms, Icon: BedroomsIcon },
    { label: "Bathrooms", value: bathrooms, Icon: BathroomsIcon },
    { label: "Type", value: type, Icon: TypeIcon },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value !== "");

  if (items.length === 0) return null;

  return (
    <div className="mb-10 flex flex-wrap gap-x-14 gap-y-8 border-b border-sage-grey/40 pb-10">
      {items.map(({ label, value, Icon }) => (
        <div key={label} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 text-near-black/55">
            <Icon />
            <span className="text-base">{label}</span>
          </div>
          <span className="font-serif text-3xl font-bold text-near-black">{value}</span>
        </div>
      ))}
    </div>
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

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stays", url: `${SITE_URL}/stays` },
    { name: property.name, url: `${SITE_URL}/stays/${slug}` },
  ]);
  const faqSchema = buildFaqSchema(property.faqs);
  const mapEmbedSrc = await toGoogleMapsEmbedSrc(property.locationLink, `${property.location}, Ireland`);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={buildLodgingBusinessSchema(property, siteSettings)} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

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
          {property.priceLabel && (
            <span className="rounded-full bg-light-sage/35 px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-forest-green">
              {property.priceLabel}
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
        {property.shortDescription && (
          <p className="mb-5 max-w-[720px] text-lg leading-[1.65] text-near-black">
            {property.shortDescription}
          </p>
        )}
        <PropertyOverview
          guests={property.sleeps}
          beds={property.beds}
          bedrooms={property.bedrooms}
          bathrooms={property.bathrooms}
          type={property.propertyType}
        />
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
            src={mapEmbedSrc}
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
