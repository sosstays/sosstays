import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/client";
import { PROPERTY_PAGE_QUERY } from "@/sanity/queries";
import { SITE_URL } from "@/sanity/metadata";
import { JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/sanity/jsonld";
import { toGoogleMapsEmbedSrc } from "@/lib/googleMapsEmbed";
import { getUplistingRoom } from "@/lib/uplisting/client";
import { HeroNav } from "@/components/HeroNav";
import { getSiteNavLinks } from "@/lib/navLinks";
import { PropertyGallery } from "@/components/PropertyGallery";
import { ReviewScoreCard } from "@/components/ReviewScore";
import { FaqSection } from "@/components/FaqSection";
import { AreaGuideCard } from "@/components/AreaGuideCard";
import { PropertyOverview } from "@/components/PropertyOverview";
import { RoomBookingBar } from "@/components/RoomBookingBar";
import type { Metadata } from "next";

// Live Uplisting data (photos, description, room counts) — not worth
// caching per Sanity's ISR window, but also not a live availability
// lookup, so a short revalidate keeps this from hammering their API on
// every request (see getUplistingRoom's own revalidate).
export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string; roomId: string }>;
  searchParams: Promise<{ check_in?: string; check_out?: string; guests?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, roomId } = await params;
  const [property, room] = await Promise.all([
    client.fetch(PROPERTY_PAGE_QUERY, { slug }),
    getUplistingRoom(roomId).catch(() => null),
  ]);
  if (!property || !room) return {};

  const title = `${room.name} | ${property.name} | Sos Stays`;
  const description = room.description?.slice(0, 160) || property.shortDescription || "";
  const path = `/stays/${slug}/rooms/${roomId}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Sos Stays",
      images: room.photos[0] ? [{ url: room.photos[0], width: 1200, height: 900 }] : undefined,
      locale: "en_IE",
      type: "website",
    },
  };
}

export default async function RoomPage({ params, searchParams }: Props) {
  const { slug, roomId } = await params;
  const { check_in, check_out, guests } = await searchParams;

  const [property, room, siteNavLinks] = await Promise.all([
    client.fetch(PROPERTY_PAGE_QUERY, { slug }),
    getUplistingRoom(roomId).catch(() => null),
    getSiteNavLinks(),
  ]);

  if (!property || !room) notFound();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stays", url: `${SITE_URL}/stays` },
    { name: property.name, url: `${SITE_URL}/stays/${slug}` },
    { name: room.name, url: `${SITE_URL}/stays/${slug}/rooms/${roomId}` },
  ]);
  const faqSchema = buildFaqSchema(property.faqs);
  const mapEmbedSrc = await toGoogleMapsEmbedSrc(property.locationLink, `${property.location}, Ireland`);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
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
          <Link href={`/stays/${slug}`} className="hover:text-near-black">
            {property.name}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-near-black">{room.name}</span>
        </nav>
        <PropertyGallery images={room.photos} alt={room.name} />
      </section>

      {/* TITLE BLOCK */}
      <section className="mx-auto max-w-6xl px-8 pt-9 sm:px-14">
        <p className="mb-3 text-xs font-medium tracking-widest text-forest-green uppercase">
          {property.location}
        </p>
        <h1 className="font-serif text-3xl leading-tight font-extrabold tracking-tight text-near-black sm:text-4xl">
          {room.name}
        </h1>
      </section>

      {/* STORY + REVIEWS */}
      <section className="mx-auto max-w-6xl px-8 pt-12 pb-14 sm:px-14">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-14">
          <div>
            {room.amenities.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2.5">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-light-sage/25 px-4 py-2 text-[13px] text-near-black"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
            {room.description && (
              <p className="mb-5 text-lg leading-[1.65] text-near-black whitespace-pre-line">
                {room.description}
              </p>
            )}
            <PropertyOverview
              guests={room.maximumCapacity}
              beds={room.beds}
              bedrooms={room.bedrooms}
              bathrooms={room.bathrooms}
            />
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

        {property.relatedAreaGuides && property.relatedAreaGuides.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {property.relatedAreaGuides.map((guide: any) => (
              <AreaGuideCard key={guide._id} guide={guide} />
            ))}
          </div>
        )}
      </section>

      <FaqSection heading="Good to know" items={property.faqs} maxWidth="72rem" />

      {/* STICKY BOOKING BAR */}
      <RoomBookingBar
        slug={slug}
        propertyId={room.id}
        roomName={room.name}
        initialCheckIn={check_in}
        initialCheckOut={check_out}
        initialGuests={guests ? Number(guests) : undefined}
        maxGuests={room.maximumCapacity}
        fees={room.fees}
      />
    </main>
  );
}
