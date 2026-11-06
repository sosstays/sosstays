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

type PropertyForSchema = {
  name: string;
  slug: string;
  location?: string | null;
  shortDescription?: string | null;
  gallery?: any[] | null;
  amenities?: string[] | null;
  sleeps?: number | null;
  bedrooms?: number | null;
};

// Full, hand-verified LodgingBusiness payloads for properties whose address,
// geo, check-in/out, pricing and review data aren't yet modeled in the Sanity
// schema. Keyed by slug; takes precedence over the dynamic builder below.
const PROPERTY_SCHEMA_OVERRIDES: Record<string, Record<string, unknown>> = {
  "rathescar-grove-guest-house": {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Rathescar Grove Guest House",
    description:
      "Rathescar Grove Guest House is a 3-room guest house in Ardee near Drogheda, Co. Louth, 50 minutes from Dublin Airport and a base for the Boyne Valley, Newgrange and Cooley Peninsula.",
    url: "https://sosstays.com/stays/rathescar-grove-guest-house",
    image: [
      "https://cdn.sanity.io/images/owyw3r12/production/df528c198ec5c52e746b7bf96ab99ce6e4957c81-2048x1536.jpg?w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/10e9dd47b80e4b469a603b4a1d3117967bc418e7-1024x683.jpg?rect=57,0,911,683&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/97656d66568f68553557fb3e0695b07d4ceb68ba-1024x683.jpg?rect=57,0,911,683&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/cddff76eaaf23d3efd75e19c47ae7317669dda8b-5712x4284.jpg?w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/027891713da15408f103a79a203d10eb7427cb85-5712x4284.jpg?w=1600&h=1200",
    ],
    email: "info@sosstays.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rathescar Grove, Dunleer",
      addressLocality: "Ardee",
      addressRegion: "County Louth",
      postalCode: "A92 Y7R2",
      addressCountry: "IE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 53.8177633,
      longitude: -6.4443283,
    },
    hasMap: "https://maps.app.goo.gl/8pMEapDq7E2iJdQh8",
    occupancy: { "@type": "QuantitativeValue", maxValue: 10 },
    numberOfRooms: 3,
    checkinTime: "15:00",
    checkoutTime: "11:30",
    petsAllowed: false,
    priceRange: "€80–€200",
    acceptsReservations: true,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Free parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Garden", value: true },
      { "@type": "LocationFeatureSpecification", name: "Mountain view", value: true },
      { "@type": "LocationFeatureSpecification", name: "Self check-in", value: true },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 9.2,
      reviewCount: 96,
      bestRating: 10,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Power Rangers Ltd",
      url: "https://sosstays.com",
      logo: "https://sosstays.com/logo.svg",
    },
  },
  "howards-way-liscannor": {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Howard's Way",
    description:
      "Luxury 4-bedroom self-catering home above Liscannor Bay on the Wild Atlantic Way, 5 minutes from the Cliffs of Moher and Lahinch Golf Club — triple-height living room, sea views, sleeps 8.",
    url: "https://sosstays.com/stays/howards-way-liscannor",
    image: [
      "https://cdn.sanity.io/images/owyw3r12/production/8fc9ee68034dce36cb214469adc68ad9d6f1650b-1200x800.avif?rect=67,0,1067,800&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/c1941a76ff83e732e15406817f576f9cb07dd3d7-6089x4059.jpg?rect=339,0,5412,4059&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/ac14d045d830f4ea83a158ffdb00619b2dc7c6ee-6240x4160.jpg?rect=347,0,5547,4160&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/5d8eebb42d3426b807bf57d33872952ddf5c1eb5-6240x4160.jpg?rect=347,0,5547,4160&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/94081b2774465f1fca8ce6aace31b028f4c21d13-6154x4103.jpg?rect=342,0,5471,4103&w=1600&h=1200",
    ],
    email: "info@sosstays.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Clahane",
      addressLocality: "Liscannor",
      addressRegion: "County Clare",
      addressCountry: "IE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 52.9416853,
      longitude: -9.426696,
    },
    hasMap: "https://maps.app.goo.gl/U6roRHEV8LMNM6wB7",
    occupancy: { "@type": "QuantitativeValue", maxValue: 8 },
    numberOfRooms: 4,
    petsAllowed: true,
    priceRange: "€550–€1400",
    acceptsReservations: true,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Sea views", value: true },
      { "@type": "LocationFeatureSpecification", name: "Private on-site parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Utility room", value: true },
      { "@type": "LocationFeatureSpecification", name: "Washing machine", value: true },
      { "@type": "LocationFeatureSpecification", name: "Barbecue grill", value: true },
      { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Pet-friendly", value: true },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 10,
      reviewCount: 54,
      bestRating: 10,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Power Rangers Ltd",
      url: "https://sosstays.com",
      logo: "https://sosstays.com/logo.svg",
    },
  },
  "tinnashrule-farm-lodge": {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Tinnashrule Farm Lodge",
    description:
      "Pet-friendly working farm stay in Ferns, Co. Wexford — self-contained studio sleeping up to 5, with cows, hens, sheep and Tom the dog on-site. On-site art studio, strong WiFi, no TV, built for a genuine digital detox.",
    url: "https://sosstays.com/stays/tinnashrule-farm-lodge",
    image: [
      "https://cdn.sanity.io/images/owyw3r12/production/b2e28cdfa7a1bd9cf6174ba633260099fe509300-2752x1536.png?rect=352,0,2048,1536&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/94967d43370cb4ec9b9e55173e62be4d8f4cb984-7259x4842.jpg?rect=402,0,6456,4842&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/3b2d9780d39c39a4d5dfb5b8ea9b2cc3a928e2dd-7952x5304.jpg?rect=440,0,7072,5304&w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/65174d6330325a0fb3be0401245786a267ff78a9-4032x3024.jpg?w=1600&h=1200",
      "https://cdn.sanity.io/images/owyw3r12/production/fc6edf40aa7fa10f24758a93710b91172a33b302-5304x7952.jpg?rect=0,1987,5304,3978&w=1600&h=1200",
    ],
    email: "info@sosstays.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Tinnashrule",
      addressLocality: "Ferns",
      addressRegion: "County Wexford",
      addressCountry: "IE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 52.6172224,
      longitude: -6.5155024,
    },
    hasMap: "https://maps.app.goo.gl/WKLBtYhF1LLGmrvi7",
    occupancy: { "@type": "QuantitativeValue", maxValue: 5 },
    numberOfRooms: 1,
    checkinTime: "15:00",
    checkoutTime: "11:00",
    petsAllowed: true,
    priceRange: "€80–€200",
    acceptsReservations: true,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Free parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Pet-friendly", value: true },
      { "@type": "LocationFeatureSpecification", name: "Farm setting", value: true },
      { "@type": "LocationFeatureSpecification", name: "Kitchen", value: true },
      { "@type": "LocationFeatureSpecification", name: "EV charging", value: true },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 10,
      reviewCount: 1,
      bestRating: 10,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Power Rangers Ltd",
      url: "https://sosstays.com",
      logo: "https://sosstays.com/logo.svg",
    },
  },
};

export function buildLodgingBusinessSchema(
  property: PropertyForSchema,
  settings?: SiteSettings
) {
  const override = PROPERTY_SCHEMA_OVERRIDES[property.slug];
  if (override) return override;

  const images = (property.gallery ?? [])
    .slice(0, 5)
    .map((img) => urlFor(img).width(1600).height(1200).url());

  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: property.shortDescription,
    url: `${SITE_URL}/stays/${property.slug}`,
    ...(images.length > 0 ? { image: images } : {}),
    address: property.location
      ? {
          "@type": "PostalAddress",
          addressLocality: property.location,
          addressCountry: "IE",
        }
      : undefined,
    ...(property.sleeps
      ? { occupancy: { "@type": "QuantitativeValue", maxValue: property.sleeps } }
      : {}),
    ...(property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
    ...(property.amenities && property.amenities.length > 0
      ? {
          amenityFeature: property.amenities.map((name) => ({
            "@type": "LocationFeatureSpecification",
            name,
            value: true,
          })),
        }
      : {}),
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
function normalizeLandlordSlug(slug?: string | null): string {
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
