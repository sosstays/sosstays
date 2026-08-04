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

type SocialLink = { platform?: string; url?: string };
type SiteSettings = {
  siteName?: string;
  businessName?: string;
  contactEmail?: string;
  socialLinks?: SocialLink[];
} | null | undefined;

const DEFAULT_SITE_NAME = "Sos Stays";
const DEFAULT_CONTACT_EMAIL = "info@sosstays.com";
const DEFAULT_LOGO_URL = `${SITE_URL}/logo.svg`;

function organizationRef(settings?: SiteSettings) {
  return {
    "@type": "Organization",
    name: settings?.businessName || settings?.siteName || DEFAULT_SITE_NAME,
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
  location?: string;
  shortDescription?: string;
  gallery?: any[];
  amenities?: string[];
  sleeps?: number;
  bedrooms?: number;
};

export function buildLodgingBusinessSchema(
  property: PropertyForSchema,
  settings?: SiteSettings
) {
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
    parentOrganization: organizationRef(settings),
  };
}

// ---- Place / TouristAttraction array (area guide page) ----

type ThingToDo = {
  title: string;
  category?: "Explore" | "Food" | "Transport";
  description?: string;
  image?: any;
};

type AreaGuideForSchema = {
  areaName: string;
  slug: string;
  heroImage?: any;
  introduction?: any;
  thingsToDo?: ThingToDo[];
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
  excerpt?: string;
  coverImage?: any;
  publishedAt?: string;
  author?: { name?: string };
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
    author: post.author?.name
      ? { "@type": "Person", name: post.author.name }
      : organizationRef(settings),
    publisher: {
      ...organizationRef(settings),
      logo: { "@type": "ImageObject", url: DEFAULT_LOGO_URL },
    },
  };
}

// ---- Service (landlord page) ----

type LandlordPageForSchema = {
  title?: string;
  heroStatement?: string;
  proofPoints?: string[];
  slug?: string;
};

export function buildServiceSchema(page: LandlordPageForSchema, settings?: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Short-term rental property management",
    name: page.title || page.heroStatement || "Property Management",
    description: page.heroStatement || page.proofPoints?.[0],
    url: page.slug ? `${SITE_URL}/landlords/${page.slug}` : `${SITE_URL}/landlords`,
    provider: organizationRef(settings),
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

export function buildFaqSchema(faqs: { question: string; answer: string }[] | undefined) {
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
