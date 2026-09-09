import { client } from "@/sanity/client";
import { NAVIGATION_QUERY } from "@/sanity/queries";

export type NavLink = { href: string; label: string };

// Fallbacks — used whenever the "navigation" singleton hasn't been
// populated in Sanity yet (or a field on it is empty), so the header
// never renders blank.
const DEFAULT_HOME_NAV_LINKS: NavLink[] = [
  { href: "/stays", label: "Stays" },
  { href: "/areas", label: "Area guides" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/landlords", label: "For landlords" },
];

const DEFAULT_SITE_NAV_LINKS: NavLink[] = [
  { href: "/stays", label: "Stays" },
  { href: "/areas", label: "Area guides" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/landlords", label: "For landlords" },
];

// Two variants, both editable from Sanity's "Navigation" singleton: the
// homepage's header sits directly over the hero (so its links/CTA are
// homepage-relative, e.g. "#stays"), while every other page's header
// sits on its own bar (site-relative, e.g. "/#stays"). Call the getter
// each page needs — Next dedupes identical fetches within a request, so
// this costs nothing extra beyond the page's own Sanity calls.
export async function getHomeNavLinks(): Promise<NavLink[]> {
  const navigation = await client.fetch(NAVIGATION_QUERY);
  return navigation?.homeNavLinks?.length ? navigation.homeNavLinks : DEFAULT_HOME_NAV_LINKS;
}

export async function getSiteNavLinks(): Promise<NavLink[]> {
  const navigation = await client.fetch(NAVIGATION_QUERY);
  return navigation?.siteNavLinks?.length ? navigation.siteNavLinks : DEFAULT_SITE_NAV_LINKS;
}

// "Contact us" is the CTA button (see HeroNav's ctaHref/ctaLabel), not a
// plain nav link, so it's kept out of this list. Not Sanity-driven —
// scoped to the /landlords pages only.
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
