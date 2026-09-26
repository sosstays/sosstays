import { notFound } from "next/navigation";
import Link from "next/link";
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
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { PropertyGallery } from "@/components/PropertyGallery";
import { ReviewScoreCard } from "@/components/ReviewScore";
import { FaqSection } from "@/components/FaqSection";
import { AreaGuideCard } from "@/components/AreaGuideCard";
import { RoomTypesTable } from "@/components/RoomTypesTable";
import { SearchResultCard, type SearchResultRoom } from "@/components/SearchResultCard";
import { SearchBar } from "@/components/SearchBar";
import { searchUplistingAvailability } from "@/lib/uplisting/client";
import { withApproxPrices } from "@/lib/uplisting/approxPrice";
import { BookNowCta, PropertyOverview } from "@/components/PropertyOverview";
import { Eyebrow } from "@/components/Eyebrow";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: re-fetch at most once a minute

type Props = { params: Promise<{ slug: string }> };
type PageProps = Props & {
  searchParams: Promise<{ check_in?: string; check_out?: string; guests?: string }>;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function formatDateLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await client.fetch(PROPERTY_PAGE_QUERY, { slug });
  if (!property) return {};
  return buildMetadata(property.seo, `/stays/${slug}`);
}

export default async function PropertyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { check_in, check_out, guests } = await searchParams;
  const [property, siteSettings, siteNavLinks] = await Promise.all([
    client.fetch(PROPERTY_PAGE_QUERY, { slug }),
    client.fetch(SITE_SETTINGS_QUERY),
    getGuestSiteNavLinks(),
  ]);

  if (!property) notFound();

  // uplistingPropertySlug is documented (and validated) in Studio as a
  // short Uplisting property_slug, to be combined with Site Settings'
  // bookingSubdomainUrl. In practice it's currently been filled in with a
  // ready-to-use booking URL directly (and Site Settings has no
  // bookingSubdomainUrl set at all) — so use it as-is when it's already a
  // full URL, and only fall back to the slug+subdomain construction
  // otherwise.
  const externalBookingUrl = property.uplistingPropertySlug?.startsWith("http")
    ? property.uplistingPropertySlug
    : siteSettings?.bookingSubdomainUrl && property.uplistingPropertySlug
      ? buildUplistingBookingUrl({
          bookingSubdomain: siteSettings.bookingSubdomainUrl,
          propertySlug: property.uplistingPropertySlug,
        })
      : null;

  // Dates/guests the guest already entered in this page's own availability
  // search bar — carried through to the on-site checkout link below so
  // /book doesn't ask for them a second time.
  const checkIn = check_in && ISO_DATE.test(check_in) ? check_in : undefined;
  const checkOut = check_out && ISO_DATE.test(check_out) ? check_out : undefined;
  const guestCount = Number(guests) > 0 ? Number(guests) : undefined;

  // When uplistingPropertyId is also set, prefer the on-site embedded
  // checkout (/book) over Uplisting's own hosted page, so pricing and
  // payment stay on this site.
  const bookNowParams = new URLSearchParams();
  if (checkIn) bookNowParams.set("checkIn", checkIn);
  if (checkOut) bookNowParams.set("checkOut", checkOut);
  if (guestCount) bookNowParams.set("guests", String(guestCount));
  const bookNowQuery = bookNowParams.toString();
  const genericBookingUrl = property.uplistingPropertyId
    ? `/stays/${slug}/book${bookNowQuery ? `?${bookNowQuery}` : ""}`
    : externalBookingUrl;

  // A property page covers a whole guesthouse, which can have several
  // separately-bookable Uplisting rooms — there's no single checkout link
  // for "the property". When at least one room type has one (roomId),
  // send guests to the room types table below to pick a specific room's
  // real booking link instead of a generic/property-level one (which, in
  // practice, has often just been the bare booking domain with no
  // property or dates attached — see uplistingPropertySlug above).
  const hasBookableRooms = (property.roomTypes ?? []).some((room: { roomId?: string }) => room.roomId);
  const bookingUrl = hasBookableRooms ? "#room-types" : genericBookingUrl;
  const bookingIsExternal = Boolean(bookingUrl?.startsWith("http"));
  const bookingLabel = hasBookableRooms ? "See room types" : "Book now";

  // Whole-house properties (room types are informational only, no roomId
  // set) still get a live availability check, scoped to the property's own
  // wholeHouseAvailabilityId — just without a room list, since there's
  // nothing to pick between.
  const hasWholeHouseAvailability = !hasBookableRooms && Boolean(property.wholeHouseAvailabilityId);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stays", url: `${SITE_URL}/stays` },
    { name: property.name, url: `${SITE_URL}/stays/${slug}` },
  ]);

  // Room search: dates and/or guest count from the property-page search
  // bar (parsed above, alongside genericBookingUrl). Like /search, matching
  // is against Uplisting's live availability (a room is available when its
  // roomId — the Uplisting property_slug — comes back), scoped here to just
  // this property's own rooms. If the lookup fails, fall back to listing
  // every room rather than an empty table that reads as "fully booked".
  const hasDateSearch = Boolean(checkIn || checkOut || guestCount);
  const hasRoomSearch = hasBookableRooms && hasDateSearch;
  const hasWholeHouseSearch = hasWholeHouseAvailability && hasDateSearch;

  const allRooms: SearchResultRoom[] = property.roomTypes ?? [];
  const availability =
    hasRoomSearch || hasWholeHouseSearch
      ? await searchUplistingAvailability({ checkIn, checkOut, guests: guestCount }).catch((error) => {
          console.error("Uplisting availability search failed:", error);
          return null;
        })
      : null;
  const availableRoomIds = availability ? new Set(availability.map((room) => room.propertySlug)) : null;
  const wholeHouseAvailable =
    hasWholeHouseSearch && availableRoomIds && property.wholeHouseAvailabilityId
      ? availableRoomIds.has(property.wholeHouseAvailabilityId)
      : null;
  // Uplisting's calendar (used for pricing) is keyed by numeric property
  // id, not the property_slug Sanity's roomTypes[].roomId stores — the
  // availability search carries both, so build the lookup once.
  const slugToPropertyId = new Map((availability ?? []).map((room) => [room.propertySlug, room.id]));
  const wholeHousePricePerNight =
    wholeHouseAvailable && checkIn && checkOut && property.wholeHouseAvailabilityId
      ? await withApproxPrices(slugToPropertyId.get(property.wholeHouseAvailabilityId), checkIn, checkOut)
      : undefined;
  const matchedRooms: SearchResultRoom[] = availableRoomIds
    ? await Promise.all(
        allRooms
          .filter((room) => room.roomId && availableRoomIds.has(room.roomId))
          .map(async (room) => ({
            ...room,
            fromPricePerNight:
              checkIn && checkOut && room.roomId
                ? await withApproxPrices(slugToPropertyId.get(room.roomId), checkIn, checkOut)
                : undefined,
          }))
      )
    : [];
  const roomSearchSummary = [
    checkIn && checkOut ? `${formatDateLabel(checkIn)} – ${formatDateLabel(checkOut)}` : null,
    guestCount ? `${guestCount} guest${guestCount === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const faqSchema = buildFaqSchema(property.faqs);
  const mapEmbedSrc = await toGoogleMapsEmbedSrc(property.locationLink, `${property.location}, Ireland`);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={buildLodgingBusinessSchema(property, siteSettings)} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" sticky />

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
                      image?: Record<string, unknown> | null;
                      supportingImages?: Record<string, unknown>[] | null;
                      ctaLabel?: string | null;
                      ctaHref?: string | null;
                    }) => ({
                      headline: highlight.headline,
                      description: highlight.description,
                      image: highlight.image ?? undefined,
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
        <Eyebrow className="mb-3" tone="forest">{property.location}</Eyebrow>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-3xl leading-tight font-extrabold tracking-tight text-forest-green sm:text-4xl">
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
        {hasWholeHouseAvailability ? (
          <div id="availability" className="scroll-mt-24">
            <SearchBar
              action={`/stays/${slug}#availability`}
              hideLocation
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialGuests={guestCount}
            />

            {hasWholeHouseSearch && (
              <div className="mt-7">
                <p className="mb-4 text-sm text-near-black/60">
                  {availableRoomIds ? (
                    <>
                      {roomSearchSummary}
                      {roomSearchSummary && " · "}
                      <Link href={`/stays/${slug}`} className="font-medium text-forest-green underline">
                        Clear search
                      </Link>
                    </>
                  ) : (
                    "We couldn't check live availability just now — get in touch and we'll confirm dates directly."
                  )}
                </p>
                {availableRoomIds &&
                  (wholeHouseAvailable ? (
                    <div className="flex flex-wrap items-center justify-between gap-5 rounded-[10px] border border-sage-grey/40 px-6 py-5">
                      <div>
                        <span className="block text-[15px] font-semibold text-forest-green">
                          Available for your dates
                        </span>
                        {wholeHousePricePerNight !== undefined && (
                          <span className="mt-1 block text-sm text-near-black/70">
                            ~€{wholeHousePricePerNight} <span className="text-near-black/50">/ night</span>
                          </span>
                        )}
                      </div>
                      <BookNowCta
                        bookingUrl={genericBookingUrl}
                        external={Boolean(genericBookingUrl?.startsWith("http"))}
                        label="Book now"
                        bgColor="forest-green"
                        color="cream"
                        className="px-7 py-3.5 text-[15px] font-semibold"
                      />
                    </div>
                  ) : (
                    <p className="rounded-[10px] border border-sage-grey/40 px-6 py-8 text-near-black/70">
                      {property.name} isn&apos;t available for those dates — try a different range.
                    </p>
                  ))}
              </div>
            )}
          </div>
        ) : hasBookableRooms ? (
          // Submits back to this page (GET); the results render right
          // below the bar off the resulting query params. The
          // #availability fragment keeps the guest on them afterwards.
          <div id="availability" className="scroll-mt-24">
            <SearchBar
              action={`/stays/${slug}#availability`}
              hideLocation
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialGuests={guestCount}
            />

            {hasRoomSearch && (
              <div className="mt-7">
                <p className="mb-4 text-sm text-near-black/60">
                  {availableRoomIds ? (
                    <>
                      {roomSearchSummary}
                      {roomSearchSummary && " · "}
                      <Link href={`/stays/${slug}`} className="font-medium text-forest-green underline">
                        Clear search
                      </Link>
                    </>
                  ) : (
                    "We couldn't check live availability just now — see the room types below, or get in touch and we'll confirm dates directly."
                  )}
                </p>
                {availableRoomIds &&
                  (matchedRooms.length > 0 ? (
                    <SearchResultCard
                      slug={slug}
                      name={property.name}
                      location={property.location}
                      sleeps={property.sleeps ?? undefined}
                      coverImage={property.gallery?.[0]}
                      rooms={matchedRooms}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      guests={guestCount}
                    />
                  ) : (
                    <p className="rounded-[10px] border border-sage-grey/40 px-6 py-8 text-near-black/70">
                      No rooms at {property.name} are available for those dates — try a different range.
                    </p>
                  ))}
              </div>
            )}
          </div>
        ) : (
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
              external={bookingIsExternal}
              label={bookingLabel}
              bgColor="forest-green"
              color="cream"
              className="px-7 py-3.5 text-[15px] font-semibold"
            />
          </div>
        )}
      </section>

      {/* STORY + REVIEWS */}
      <section className="mx-auto max-w-6xl px-8 pt-12 pb-14 sm:px-14">
        <div
          className={
            property.reviewScore
              ? "lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-14"
              : ""
          }
        >
          <div>
            {property.amenities && property.amenities.length > 0 && (
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
      {(property.roomTypes?.length ?? 0) > 0 && (
        <section id="room-types" className="mx-auto max-w-6xl scroll-mt-24 px-8 pb-14 sm:px-14">
          <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight text-forest-green">
            Room types
          </h2>
          <RoomTypesTable slug={slug} roomTypes={property.roomTypes} />
        </section>
      )}

      {/* AREAS */}
      <section id="areas" className="mx-auto max-w-6xl px-8 py-14 sm:px-14">
        <Eyebrow className="mb-2">Areas</Eyebrow>
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

        {property.relatedAreaGuides && property.relatedAreaGuides.length > 0 && (
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
            external={bookingIsExternal}
            label={bookingLabel}
            bgColor="cream"
            color="forest-green"
            className="px-8 py-4 text-[15px] font-semibold"
          />
        </div>
      </section>
    </main>
  );
}
