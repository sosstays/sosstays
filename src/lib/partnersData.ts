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

export type Partner = {
  slug: string;
  name: string;
  tagline: string;
  category: string; // matches PartnerCategory.slug
  description: string;
  href: string; // external site/booking link
  featured: boolean;
  profileIntro?: string;
  profileBody?: string;
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
    profileIntro: "Family entertainment centre, Drogheda",
    profileBody:
      "The go-to for a wet Tuesday or a birthday that needs sorting — we send families here more than anywhere else. Full profile content to come.",
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
  },
];

export function getEmptyCategories(partners: Partner[]): PartnerCategory[] {
  return PARTNER_CATEGORIES.filter((cat) => !partners.some((p) => p.category === cat.slug));
}
