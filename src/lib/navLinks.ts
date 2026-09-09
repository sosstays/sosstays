export type NavLink = { href: string; label: string };

// Kept in one place so every page's nav stays in sync.
export const HOME_NAV_LINKS: NavLink[] = [
  { href: "/stays", label: "Stays" },
  { href: "/areas", label: "Area guides" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/landlords", label: "For landlords" },
];

export const SITE_NAV_LINKS: NavLink[] = [
  { href: "/stays", label: "Stays" },
  { href: "/areas", label: "Area guides" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/landlords", label: "For landlords" },
];

// "Contact us" is the CTA button (see HeroNav's ctaHref/ctaLabel), not a
// plain nav link, so it's kept out of this list.
export const LANDLORD_NAV_LINKS: NavLink[] = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

// "Send your SOS" is the CTA button (see HeroNav's ctaHref/ctaLabel), not a
// plain nav link, so it's kept out of this list.
export const CORPORATE_STAYS_NAV_LINKS: NavLink[] = [
  { href: "#coverage", label: "Coverage" },
  { href: "#how", label: "How it works" },
  { href: "#included", label: "What's included" },
  { href: "#faq", label: "FAQ" },
];
