import { urlFor } from "@/sanity/image";
import { portableTextToPlain } from "@/sanity/portableText";
import { SITE_URL } from "@/sanity/metadata";

// Renders a schema.org JSON-LD <script> tag. `data` can be a single node
// or an array of nodes (schema.org allows either). Escaping "<" prevents
// content like a title containing "</script>" from breaking out of the tag.
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}

type SocialLink = { platform?: string | null; url?: string | null };
type SiteSettings = {
  siteName?: string | null;
  businessName?: string | null;
  contactEmail?: string | null;
  socialLinks?: SocialLink[] | null;
} | null | undefined;

const DEFAULT_SITE_NAME = "SOS Stays";
const LEGAL_NAME = "Power Rangers Ltd";
const DEFAULT_CONTACT_EMAIL = "info@sosstays.com";
const DEFAULT_LOGO_URL = `${SITE_URL}/logo.svg`;

// The brand name is always "SOS Stays" regardless of CMS content —
// previously this preferred `settings.businessName`, which is the legal
// entity name ("Power Rangers Ltd") — correct as `legalName`, wrong as the
// publisher's displayed `name`.
function organizationRef() {
  return {
    "@type": "Organization",
    name: DEFAULT_SITE_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: DEFAULT_LOGO_URL,
  };
}

// ---- Organization (homepage) ----

export function buildOrganizationSchema(settings?: SiteSettings) {
  const sameAs = (settings?.socialLinks ?? [])
    .map((link) => link.url)
    .filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.businessName || settings?.siteName || DEFAULT_SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_LOGO_URL,
    email: settings?.contactEmail || DEFAULT_CONTACT_EMAIL,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

// ---- LodgingBusiness (property page) ----
//
// This builder is fed entirely by verified Sanity fields — no per-property
// hardcoded facts. It used to be preceded by a PROPERTY_SCHEMA_OVERRIDES map
// of hand-typed payloads (retired here) that had already drifted from the
// CMS on 2 of 3 properties it covered (stale review counts), fabricated a
// "Pet-friendly" amenity/petsAllowed claim for a property whose real
// amenities list has no such entry, and fell back to a thinner, inconsistent
// shape for any property without an override. Every fact below is read
// straight from the field it names; anything the CMS doesn't hold is
// omitted rather than guessed.
type PropertyForSchema = {
  name: string;
  slug: string;
  location?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  geo?: { lat?: number | null; lng?: number | null } | null;
  locationLink?: string | null;
  shortDescription?: string | null;
  gallery?: any[] | null;
  amenities?: string[] | null;
  sleeps?: number | null;
  bedrooms?: number | null;
  propertyType?: string | null;
  priceLabel?: string | null;
  offerMinPrice?: number | null;
  offerMaxPrice?: number | null;
};

function isFiniteCoordinate(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function buildPropertyAddress(property: PropertyForSchema) {
  const addressLocality = property.city || property.location || undefined;
  const addressRegion = property.region || undefined;
  if (!addressLocality && !addressRegion && !property.country) return undefined;
  return {
    "@type": "PostalAddress",
    ...(addressLocality ? { addressLocality } : {}),
    ...(addressRegion ? { addressRegion } : {}),
    ...(property.country ? { addressCountry: property.country } : {}),
  };
}

// schema.org defines `numberOfBedrooms`, `occupancy` etc. on `Accommodation`
// (the physical unit being booked) — NOT on `LodgingBusiness` (the business
// operating it). A previous version of this builder put bedroom count and
// occupancy directly on the LodgingBusiness, which both conflated the two
// entities and used properties outside LodgingBusiness's own vocabulary.
// `isGuestHouseRoom` is true for a "Room" property (e.g. Rathescar Grove):
// there, `bedrooms` genuinely means "how many separately-bookable rooms this
// guest house has" — a true LodgingBusiness-level fact — not the bedroom
// count of any single accommodation, so no nested Accommodation entity is
// invented for it.
function isGuestHouseRoom(property: PropertyForSchema) {
  return (property.propertyType ?? "").trim().toLowerCase() === "room";
}

// Maps the CMS's free-text `propertyType` to a real schema.org Accommodation
// subtype where one applies, falling back to the generic `Accommodation`
// type rather than asserting a style (e.g. "House") the data doesn't confirm.
function accommodationTypeFor(propertyType?: string | null): string {
  const type = (propertyType ?? "").trim().toLowerCase();
  if (type === "apartment") return "Apartment";
  if (["entire house", "cottage", "cabin", "villa", "bungalow", "townhouse"].includes(type)) {
    return "House";
  }
  return "Accommodation";
}

// The accommodation actually being booked — distinct from the LodgingBusiness
// that operates it. Omitted entirely for a guest-house "Room" listing, where
// there's no single unit this would describe (see isGuestHouseRoom above).
function buildAccommodation(property: PropertyForSchema) {
  if (isGuestHouseRoom(property)) return undefined;
  const hasAnyFact = property.sleeps || property.bedrooms;
  if (!hasAnyFact) return undefined;
  return {
    "@type": accommodationTypeFor(property.propertyType),
    ...(property.sleeps
      ? { occupancy: { "@type": "QuantitativeValue", maxValue: property.sleeps } }
      : {}),
    ...(property.bedrooms ? { numberOfBedrooms: property.bedrooms } : {}),
  };
}

export function buildLodgingBusinessSchema(
  property: PropertyForSchema,
  settings?: SiteSettings
) {
  const images = (property.gallery ?? [])
    .slice(0, 5)
    .map((img) => urlFor(img).width(1600).height(1200).url());

  const address = buildPropertyAddress(property);
  // Guards against bad geopoint data entry (e.g. a longitude typed without
  // its sign/decimal point) rather than publishing coordinates that place
  // the property somewhere else on Earth.
  const hasValidGeo = property.geo && isFiniteCoordinate(property.geo.lat, property.geo.lng);
  const accommodation = buildAccommodation(property);

  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    ...(property.shortDescription ? { description: property.shortDescription } : {}),
    url: `${SITE_URL}/stays/${property.slug}`,
    ...(images.length > 0 ? { image: images } : {}),
    ...(address ? { address } : {}),
    ...(hasValidGeo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.geo!.lat,
            longitude: property.geo!.lng,
          },
        }
      : {}),
    ...(property.locationLink ? { hasMap: property.locationLink } : {}),
    // numberOfRooms here means "total separately-bookable rooms in this
    // guest house business" — only meaningful, and only ever set, for a
    // "Room"-type property. For every other type the total room count at
    // the business level isn't a distinct, known fact from the one
    // accommodation's own numberOfBedrooms below, so it's omitted rather
    // than assumed to be 1 (or equal to bedrooms).
    ...(isGuestHouseRoom(property) && property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
    ...(accommodation ? { containsPlace: accommodation } : {}),
    // Passed through exactly as entered in Studio — not reformatted into a
    // min–max range, since the CMS only holds a single price value/label.
    ...(property.priceLabel ? { priceRange: property.priceLabel } : {}),
    // Structured price range for search engines, from the property's own
    // manually-maintained offerMinPrice/offerMaxPrice fields — an
    // approximate figure, like priceRange above, not a live Uplisting rate.
    // Omitted unless both bounds are set.
    ...(typeof property.offerMinPrice === "number" && typeof property.offerMaxPrice === "number"
      ? {
          makesOffer: {
            "@type": "Offer",
            url: `${SITE_URL}/stays/${property.slug}`,
            priceCurrency: "EUR",
            priceSpecification: {
              "@type": "PriceSpecification",
              priceCurrency: "EUR",
              minPrice: property.offerMinPrice,
              maxPrice: property.offerMaxPrice,
            },
          },
        }
      : {}),
    // True of every property on the site — booking is always handled
    // on-platform via Uplisting, not a per-property editorial claim.
    acceptsReservations: true,
    ...(property.amenities && property.amenities.length > 0
      ? {
          amenityFeature: property.amenities.map((name) => ({
            "@type": "LocationFeatureSpecification",
            name,
            value: true,
          })),
        }
      : {}),
    // aggregateRating intentionally omitted: reviewScore/reviewCount are
    // plain editor-typed Sanity numbers with no stated third-party source,
    // so they aren't verifiable as genuine aggregated user reviews. See the
    // audit note on this — flagged for the owner, not silently published as
    // structured review data.
    email: settings?.contactEmail || DEFAULT_CONTACT_EMAIL,
    parentOrganization: organizationRef(),
  };
}

// ---- Place / TouristAttraction array (area guide page) ----

type ThingToDo = {
  title: string;
  category?: "Explore" | "Things to Do" | "Food" | "Transport" | null;
  description?: string | null;
  image?: any;
};

type AreaGuideForSchema = {
  areaName: string;
  slug: string;
  heroImage?: any;
  introduction?: any;
  thingsToDo?: ThingToDo[] | null;
};

function thingToDoType(category?: ThingToDo["category"]) {
  if (category === "Food") return "FoodEstablishment";
  if (category === "Transport") return "Place";
  return "TouristAttraction";
}

export function buildAreaGuideSchema(guide: AreaGuideForSchema) {
  const areaUrl = `${SITE_URL}/areas/${guide.slug}`;
  const description = portableTextToPlain(guide.introduction, 300);

  const area = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: guide.areaName,
    url: areaUrl,
    ...(description ? { description } : {}),
    ...(guide.heroImage
      ? { image: urlFor(guide.heroImage).width(1600).height(1200).url() }
      : {}),
  };

  const attractions = (guide.thingsToDo ?? []).map((item) => ({
    "@context": "https://schema.org",
    "@type": thingToDoType(item.category),
    name: item.title,
    ...(item.description ? { description: item.description } : {}),
    ...(item.image ? { image: urlFor(item.image).width(800).height(600).url() } : {}),
    containedInPlace: { "@type": "Place", name: guide.areaName },
  }));

  return [area, ...attractions];
}

// ---- BlogPosting (blog post page) ----

type BlogPostForSchema = {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: any;
  publishedAt?: string | null;
  _updatedAt?: string | null;
  author?: { name?: string | null } | null;
};

export function buildArticleSchema(post: BlogPostForSchema, settings?: SiteSettings) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(post.coverImage
      ? { image: urlFor(post.coverImage).width(1200).height(675).url() }
      : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post._updatedAt ? { dateModified: post._updatedAt } : {}),
    author: post.author?.name
      ? { "@type": "Person", name: post.author.name }
      : organizationRef(),
    publisher: {
      ...organizationRef(),
      logo: { "@type": "ImageObject", url: DEFAULT_LOGO_URL },
    },
  };
}

// ---- Service (national /pricing page) ----

export function buildNationalPricingServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Airbnb & Short-Term Let Management Ireland",
    serviceType: "Short-term rental property management",
    description:
      "Commission-only Airbnb and holiday let management for landlords across Ireland and Northern Ireland. Dynamic pricing, cleaning, maintenance and guest comms handled — from 15% commission, no setup fee.",
    url: `${SITE_URL}/pricing`,
    brand: { "@type": "Brand", name: DEFAULT_SITE_NAME },
    provider: organizationRef(),
    areaServed: [
      { "@type": "Country", name: "Ireland" },
      { "@type": "AdministrativeArea", name: "Northern Ireland" },
    ],
    offers: {
      "@type": "Offer",
      description:
        "Commission-only pricing — from 15% of gross booking revenue, cleaning fees excluded. No setup fee, no monthly retainer.",
    },
  };
}

// ---- Service (per-county /pricing/[slug] page) ----

export function buildCountyServiceSchema(county: { name: string; slug: string; region: "roi" | "ni" }) {
  const areaName = county.region === "ni" ? `County ${county.name}, Northern Ireland` : `County ${county.name}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Airbnb & Short-Term Let Management in ${county.name}`,
    serviceType: "Short-term rental property management",
    description: `Commission-only Airbnb and short-term let management for landlords in County ${county.name}. Dynamic pricing, cleaning, maintenance and guest comms handled — from 15% commission, no setup fee.`,
    url: `${SITE_URL}/pricing/${county.slug}`,
    brand: { "@type": "Brand", name: DEFAULT_SITE_NAME },
    provider: organizationRef(),
    areaServed: { "@type": "AdministrativeArea", name: areaName },
    offers: {
      "@type": "Offer",
      description:
        "Commission-only pricing — from 15% of gross booking revenue, cleaning fees excluded. No setup fee, no monthly retainer.",
    },
  };
}

// ---- Service (landlord page) ----

type LandlordPageForSchema = {
  title?: string | null;
  heroStatement?: string | null;
  proofPoints?: string[] | null;
  slug?: string | null;
};

// The landlordPage doc's slug field has at times been entered as "/landlords"
// (a full path) rather than a bare segment — building the URL as
// `/landlords/${slug}` then produced the broken
// "https://sosstays.com/landlords//landlords". Normalize whatever shape the
// slug is in (bare, leading slash, or redundantly repeating "landlords")
// down to just the extra segment, if any, so the one actual landlords page
// always resolves to a clean "/landlords".
export function normalizeLandlordSlug(slug?: string | null): string {
  if (!slug) return "";
  return slug
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/^landlords\/?/, "");
}

export function buildServiceSchema(page: LandlordPageForSchema, settings?: SiteSettings) {
  const slug = normalizeLandlordSlug(page.slug);
  const url = slug ? `${SITE_URL}/landlords/${slug}` : `${SITE_URL}/landlords`;
  const isHub = !slug;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Short-term rental property management",
    name: isHub
      ? "Airbnb & Holiday Home Management Ireland"
      : page.title || page.heroStatement || "Property Management",
    description: isHub
      ? "Commission-only Airbnb and short-term let management for landlords across Ireland and Northern Ireland. Dynamic pricing, cleaning, maintenance and guest comms handled — from 15% commission, no setup fee."
      : page.heroStatement || page.proofPoints?.[0],
    url,
    provider: organizationRef(),
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Louth, Meath & the Mournes",
    },
  };
}

// ---- BreadcrumbList (shared) ----

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ---- FAQPage (shared) ----

export function buildFaqSchema(faqs: { question: string; answer: string }[] | null | undefined) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
