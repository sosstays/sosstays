import { notFound } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { PROPERTY_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { buildUplistingBookingUrl } from "@/sanity/uplisting";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
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
import { ReviewScoreCard } from "@/components/ReviewScore";
import { FaqSection } from "@/components/FaqSection";
import { AreaGuideCard } from "@/components/AreaGuideCard";
import { RoomTypesTable } from "@/components/RoomTypesTable";
import { Button, type ButtonColor } from "@/components/Button";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: re-fetch at most once a minute

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"] });

function BookNowCta({
  bookingUrl,
  className,
  bgColor,
  color,
}: {
  bookingUrl: string | null;
  className: string;
  bgColor: ButtonColor;
  color: ButtonColor;
}) {
  return bookingUrl ? (
    <Button link={bookingUrl} external bgColor={bgColor} color={color} size="custom" className={className}>
      Book now
    </Button>
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
    <div className={`${poppins.className} mb-10 flex flex-wrap gap-x-14 gap-y-8 border-b border-sage-grey/40 pb-10`}>
      {items.map(({ label, value, Icon }) => (
        <div key={label} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <Icon />
            <span className="text-base text-near-black">{value}</span>
          </div>
          <span className="text-base text-near-black/55">{label}</span>
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

      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />

      {/* GALLERY */}
      <section className="mx-auto max-w-6xl px-8 pt-6 sm:px-14">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-near-black/55">
          <Link href="/" className="hover:text-near-black">
            Home
          </Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-near-black">{property.name}</span>
        </nav>
        <PropertyGallery
          images={property.gallery ?? []}
          alt={property.name}
          promo={
            property.galleryPromotion?.enabled && property.galleryPromotion.highlights?.length === 3
              ? {
                  highlights: property.galleryPromotion.highlights.map(
                    (highlight: {
                      headline: string;
                      description: string;
                      image?: Record<string, unknown>;
                      supportingImages?: Record<string, unknown>[];
                      ctaLabel?: string;
                      ctaHref?: string;
                    }) => ({
                      headline: highlight.headline,
                      description: highlight.description,
                      image: highlight.image,
                      supportingImages: highlight.supportingImages ?? [],
                      ctaLabel: highlight.ctaLabel || "Book Now",
                      ctaHref: highlight.ctaHref ?? bookingUrl ?? undefined,
                    }),
                  ),
                  delayMs: (property.galleryPromotion.delaySeconds ?? 2.5) * 1000,
                  autoplayMs: (property.galleryPromotion.autoplaySeconds ?? 4) * 1000,
                }
              : undefined
          }
        />
      </section>

      {/* TITLE BLOCK */}
      <section className="mx-auto max-w-6xl px-8 pt-9 sm:px-14">
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
      <section className="mx-auto max-w-6xl px-8 pt-7 sm:px-14">
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
            bgColor="forest-green"
            color="cream"
            className="px-7 py-3.5 text-[15px] font-semibold"
          />
        </div>
      </section>

      {/* STORY + REVIEWS */}
      <section className="mx-auto max-w-6xl px-8 pt-12 pb-14 sm:px-14">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-14">
          <div>
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
              <p className="mb-5 text-lg leading-[1.65] text-near-black">
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
              <div className="prose prose-neutral max-w-none text-near-black/80 [&_p]:my-3">
                <PortableText value={property.fullDescription} />
              </div>
            )}
          </div>

          {property.reviewScore && (
            <div className="mt-14 lg:sticky lg:top-24 lg:mt-0">
              {/* <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight text-forest-green">
                Reviews
              </h2> */}
              <ReviewScoreCard
                score={property.reviewScore}
                reviewCount={property.reviewCount}
                categories={property.reviewCategories}
                compact
              />
            </div>
          )}
        </div>
      </section>

      {/* VIDEO TOUR */}
      {property.videoUrl && (
        <section className="mx-auto max-w-6xl px-8 pb-14 sm:px-14">
          <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight text-forest-green">
            Take a video tour
          </h2>
          <div className="aspect-video overflow-hidden rounded-[10px] border border-sage-grey/40">
            <video controls playsInline className="h-full w-full object-cover">
              <source src={property.videoUrl} type={property.videoMimeType ?? undefined} />
            </video>
          </div>
        </section>
      )}

      {/* ROOM TYPES */}
      {property.roomTypes?.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pb-14 sm:px-14">
          <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight text-forest-green">
            Room types
          </h2>
          <RoomTypesTable roomTypes={property.roomTypes} />
        </section>
      )}

      {/* AREAS */}
      <section id="areas" className="mx-auto max-w-6xl px-8 py-14 sm:px-14">
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
              <AreaGuideCard key={guide._id} guide={guide} />
            ))}
          </div>
        )}
      </section>

      <FaqSection heading="Good to know" items={property.faqs} maxWidth="72rem" />

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-8 pb-24 text-center sm:px-14">
        <div className="rounded-[18px] bg-forest-green px-8 py-14">
          <h2 className="mb-3 font-serif text-2xl font-bold tracking-tight text-cream">
            Ready to stay at {property.name}?
          </h2>
          <p className="mb-7 text-[15px] text-light-sage">Check your dates and send it.</p>
          <BookNowCta
            bookingUrl={bookingUrl}
            bgColor="cream"
            color="forest-green"
            className="px-8 py-4 text-[15px] font-semibold"
          />
        </div>
      </section>
    </main>
  );
}
