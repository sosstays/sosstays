// Fallback content for /partners and /partners/[slug] — used whenever
// the "Partners Page" singleton (Sanity: partnersPage) hasn't been
// created yet, or the "partner" documents list is empty, so the page
// never ships blank. See studio/schemaTypes/documents/partnersPage.ts
// and partner.ts.

export type PartnerCategory = {
  slug: string;
  label: string;
};

// The fixed category taxonomy — mirrors studio/schemaTypes/shared/
// partnerCategories.ts. Used for the directory's filter tags regardless
// of CMS content, since it's a closed set rather than editable copy.
export const PARTNER_CATEGORIES: PartnerCategory[] = [
  { slug: "cleaning", label: "Cleaning" },
  { slug: "photography", label: "Photography" },
  { slug: "social-content", label: "Social & Content" },
  { slug: "tours-experiences", label: "Tours & Experiences" },
  { slug: "food-drink", label: "Food & Drink" },
  { slug: "hospitality-days-out", label: "Hospitality & Days Out" },
];

export type PartnerImage = { src: string; alt: string };

export type Partner = {
  slug: string;
  name: string;
  tagline: string;
  category: string; // matches PartnerCategory.slug
  description: string;
  href: string; // external site/booking link
  featured: boolean;
  image?: PartnerImage;
  /** When set, "Read more" and the /partners/[slug] profile route both
   *  point here instead — used for partners that already have a dedicated
   *  page elsewhere on the site (e.g. an SEO landing page). */
  profileHref?: string;
  profileIntro?: string;
  profileBody?: string;
};

export const DEFAULT_SPOTLIGHT_IMAGE: PartnerImage = {
  src: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1600&q=80",
  alt: "",
};

export const DEFAULT_PARTNERS: Partner[] = [
  {
    slug: "funtasia",
    name: "Funtasia",
    tagline: "Family entertainment centre, Drogheda",
    category: "hospitality-days-out",
    description:
      "The go-to for a wet Tuesday or a birthday that needs sorting — we send families here more than anywhere else.",
    href: "https://www.funtasia.net/",
    featured: true,
    image: {
      src: "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=900&q=80",
      alt: "",
    },
    profileHref: "/hotels-near-funtasia",
  },
  {
    slug: "tranquil-space",
    name: "Tranquil Space",
    tagline: "Wellness studio",
    category: "hospitality-days-out",
    description:
      "A proper reset after a day of driving around — we point guests here when they want to slow down for an afternoon.",
    href: "#",
    featured: false,
    image: {
      src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80",
      alt: "",
    },
  },
];

export function getEmptyCategories(partners: Partner[]): PartnerCategory[] {
  return PARTNER_CATEGORIES.filter((cat) => !partners.some((p) => p.category === cat.slug));
}
