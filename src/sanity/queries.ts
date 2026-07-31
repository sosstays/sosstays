import { defineQuery } from "next-sanity";

// Shared SEO projection with fallback logic. `seo.title` and
// `seo.description` are never null — they resolve to the SEO override,
// then the page's own title, then an empty string. Keeps frontend
// metadata logic simple (see [slug]/page.tsx generateMetadata pattern).
const seoProjection = `
  "seo": {
    "title": coalesce(seoTitle, name, title, areaName, ""),
    "description": coalesce(seoDescription, shortDescription, excerpt, ""),
    "image": seoImage,
    "noIndex": noIndex == true
  }
`;

// ---- Blog posts ----

export const BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt
  }
`);

export const BLOG_POST_QUERY = defineQuery(`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    body,
    publishedAt,
    relatedAreaGuides[]-> {
      _id,
      areaName,
      "slug": slug.current,
      heroImage
    },
    ${seoProjection}
  }
`);

// ---- Property pages ----

export const PROPERTY_PAGES_QUERY = defineQuery(`
  *[_type == "propertyPage" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    location,
    shortDescription,
    "coverImage": gallery[0]
  }
`);

export const PROPERTY_PAGE_QUERY = defineQuery(`
  *[_type == "propertyPage" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    location,
    locationLink,
    shortDescription,
    fullDescription,
    gallery,
    amenities,
    sleeps,
    priceLabel,
    bedrooms,
    beds,
    bathrooms,
    propertyType,
    reviewScore,
    reviewCount,
    reviewCategories,
    uplistingPropertySlug,
    faqs,
    relatedAreaGuides[]-> {
      _id,
      areaName,
      "slug": slug.current,
      heroImage,
      introduction
    },
    ${seoProjection}
  }
`);

// ---- Area guides ----

export const AREA_GUIDES_QUERY = defineQuery(`
  *[_type == "areaGuide" && defined(slug.current)] | order(areaName asc) {
    _id,
    areaName,
    "slug": slug.current,
    heroImage
  }
`);

export const AREA_GUIDE_QUERY = defineQuery(`
  *[_type == "areaGuide" && slug.current == $slug][0] {
    _id,
    areaName,
    "slug": slug.current,
    heroImage,
    introduction,
    thingsToDo,
    travelNotes,
    faqs,
    featuredProperties[]-> {
      _id,
      name,
      "slug": slug.current,
      location,
      shortDescription,
      sleeps,
      "coverImage": gallery[0],
      "gallery": gallery[0...3],
      uplistingPropertySlug
    },
    "relatedBlogPosts": *[_type == "blogPost" && references(^._id)] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage
    },
    ${seoProjection}
  }
`);

// ---- Landlord pages ----

export const LANDLORD_PAGE_QUERY = defineQuery(`
  *[_type == "landlordPage" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    heroStatement,
    proofPoints,
    body,
    faqs,
    ctaLabel,
    ctaUrl,
    ${seoProjection}
  }
`);

export const LANDLORD_PAGES_QUERY = defineQuery(`
  *[_type == "landlordPage" && defined(slug.current)] | order(_createdAt asc) {
    _id,
    title,
    "slug": slug.current,
    heroStatement,
    proofPoints,
    body,
    ctaLabel,
    ctaUrl,
    ${seoProjection}
  }
`);

// ---- Site settings (singleton) ----

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_id == "siteSettings"][0] {
    siteName,
    defaultSeoTitle,
    defaultSeoDescription,
    defaultSeoImage,
    businessName,
    contactEmail,
    bookingSubdomainUrl,
    socialLinks[] {
      platform,
      url
    }
  }
`);

// ---- Privacy policy (singleton) ----

export const PRIVACY_POLICY_QUERY = defineQuery(`
  *[_id == "privacyPolicyPage"][0] {
    title,
    lastUpdated,
    body,
    ${seoProjection}
  }
`);

// ---- Homepage hero (singleton) ----

export const HERO_SECTION_QUERY = defineQuery(`
  *[_id == "heroSection"][0] {
    eyebrow,
    heading,
    body,
    subBody,
    image,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl
  }
`);

// ---- Homepage feed ----

export const HOMEPAGE_QUERY = defineQuery(`{
  "properties": *[_type == "propertyPage" && defined(slug.current)] | order(name asc) [0...3] {
    _id, name, "slug": slug.current, location, shortDescription, sleeps,
    "coverImage": gallery[0], "gallery": gallery[0...3]
  },
  "areas": *[_type == "areaGuide" && defined(slug.current)] | order(areaName asc) [0...4] {
    _id, areaName, "slug": slug.current, heroImage, introduction
  },
  "posts": *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) [0...3] {
    _id, title, "slug": slug.current, excerpt, coverImage
  }
}`);

// ---- Sitemap ----

export const SITEMAP_QUERY = defineQuery(`
  *[_type in ["blogPost", "propertyPage", "areaGuide", "landlordPage"] && defined(slug.current) && noIndex != true] {
    "href": select(
      _type == "blogPost" => "/blog/" + slug.current,
      _type == "propertyPage" => "/stays/" + slug.current,
      _type == "areaGuide" => "/areas/" + slug.current,
      _type == "landlordPage" => "/landlords/" + slug.current,
      slug.current
    ),
    _updatedAt
  }
`);
