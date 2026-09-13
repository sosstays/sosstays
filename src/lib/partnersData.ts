// Static content for /partners and /partners/[slug] — no Sanity schema yet
// for this page, so partner entries live here rather than as DEFAULT_*
// fallbacks behind a CMS query (unlike about/corporate-stays). When a
// partner has no real profile yet, category placeholders say so honestly
// rather than inventing a business name.

export type PartnerCategory = {
  slug: string;
  label: string;
};

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
  profile?: {
    intro: string;
    body: string;
  };
};

export const PARTNERS: Partner[] = [
  {
    slug: "funtasia",
    name: "Funtasia",
    tagline: "Family entertainment centre, Drogheda",
    category: "hospitality-days-out",
    description:
      "The go-to for a wet Tuesday or a birthday that needs sorting — we send families here more than anywhere else.",
    href: "https://www.funtasia.net/",
    featured: true,
    profile: {
      intro: "Family entertainment centre, Drogheda",
      body: "The go-to for a wet Tuesday or a birthday that needs sorting — we send families here more than anywhere else. Full profile content to come.",
    },
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

// Categories with no signed partner yet — shown as an honest "still
// building this out" card rather than a placeholder business name.
export const EMPTY_CATEGORIES = PARTNER_CATEGORIES.filter(
  (cat) => !PARTNERS.some((p) => p.category === cat.slug)
);

export function getPartnerBySlug(slug: string): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug && p.featured);
}
