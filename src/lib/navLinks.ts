import { client } from "@/sanity/client";
import { NAVIGATION_QUERY } from "@/sanity/queries";

export type NavLink = { href: string; label: string };

// Fallbacks — used whenever the "navigation" singleton hasn't been
// populated in Sanity yet (or a field on it is empty), so the header
// never renders blank.
const DEFAULT_GUEST_NAV_LINKS: NavLink[] = [
  { href: "/stays", label: "Stays" },
  { href: "/areas", label: "Area guides" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/landlords", label: "For landlords" },
];

// "Contact us"/"Get estimate" are CTA buttons (see HeroNav's
// ctaHref/ctaLabel), not plain nav links, so they're kept out of this list.
const DEFAULT_LANDLORD_NAV_LINKS: NavLink[] = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

// A bare hash link (e.g. "#faq") is authored relative to a version's own
// "home" page — where those sections actually live. Shown there as-is, but
// on any other page in that version it needs the home path prefixed so the
// hash still resolves (e.g. "/landlords#faq" from a /pricing page).
function prefixBareHashLinks(links: NavLink[], homePath: string): NavLink[] {
  return links.map((link) =>
    link.href.startsWith("#") ? { ...link, href: `${homePath}${link.href}` } : link
  );
}

// Two versions, both editable from Sanity's "Navigation" singleton:
// guest-facing pages (home, stays, areas, blog, etc.) and landlord-facing
// pages (/landlords, /pricing) show entirely different links. Call the
// getter each page needs — Next dedupes identical fetches within a
// request, so this costs nothing extra beyond the page's own Sanity calls.

// For the homepage itself, where bare hashes resolve on-page.
export async function getGuestNavLinks(): Promise<NavLink[]> {
  const navigation = await client.fetch(NAVIGATION_QUERY);
  return navigation?.guestNavLinks?.length ? navigation.guestNavLinks : DEFAULT_GUEST_NAV_LINKS;
}

// For every other guest-facing page, where bare hashes need "/" prefixed.
export async function getGuestSiteNavLinks(): Promise<NavLink[]> {
  return prefixBareHashLinks(await getGuestNavLinks(), "/");
}

// For /landlords itself, where bare hashes resolve on-page.
export async function getLandlordNavLinks(): Promise<NavLink[]> {
  const navigation = await client.fetch(NAVIGATION_QUERY);
  return navigation?.landlordNavLinks?.length
    ? navigation.landlordNavLinks
    : DEFAULT_LANDLORD_NAV_LINKS;
}

// For other landlord-facing pages (e.g. /pricing), where bare hashes need
// "/landlords" prefixed.
export async function getLandlordSiteNavLinks(): Promise<NavLink[]> {
  return prefixBareHashLinks(await getLandlordNavLinks(), "/landlords");
}

// "Send your SOS" is the CTA button (see HeroNav's ctaHref/ctaLabel), not a
// plain nav link, so it's kept out of this list. Not Sanity-driven —
// scoped to the /corporate-stays page only.
export const CORPORATE_STAYS_NAV_LINKS: NavLink[] = [
  { href: "#coverage", label: "Coverage" },
  { href: "#how", label: "How it works" },
  { href: "#included", label: "What's included" },
  { href: "#faq", label: "FAQ" },
];
