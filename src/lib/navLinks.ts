export type NavLink = { href: string; label: string };

// /stays is under construction — until it's ready, "Stays" points at the
// homepage's #stays section instead of an index route. "Area guides" links
// to the /areas index now that it's built. Kept in one place so every
// page's nav stays in sync.
export const HOME_NAV_LINKS: NavLink[] = [
  { href: "#stays", label: "Stays" },
  { href: "/areas", label: "Area guides" },
  { href: "/landlords", label: "For landlords" },
];

export const SITE_NAV_LINKS: NavLink[] = [
  { href: "/#stays", label: "Stays" },
  { href: "/areas", label: "Area guides" },
  { href: "/landlords", label: "For landlords" },
];

// "Contact us" is the CTA button (see HeroNav's ctaHref/ctaLabel), not a
// plain nav link, so it's kept out of this list.
export const LANDLORD_NAV_LINKS: NavLink[] = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#calculator", label: "Revenue calculator" },
  { href: "#faq", label: "FAQ" },
];
