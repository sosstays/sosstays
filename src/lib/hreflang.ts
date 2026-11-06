import { MARKET, LOCALES, SITE_DOMAINS, SITE_URL, type Market } from "@/lib/market";

// The linked counterpart document, as projected by seoProjection in
// sanity/queries.ts. `slug` is empty for singleton pages (about, privacy…),
// whose path is the same on both domains.
export type AlternateDoc = {
  _type?: string | null;
  market?: string | null;
  slug?: string | null;
} | null | undefined;

const PATH_PREFIX: Record<string, string> = {
  propertyPage: "/stays/",
  areaGuide: "/areas/",
  blogPost: "/blog/",
  landlordPage: "/landlords/",
  landingPage: "/",
};

function isMarket(value: unknown): value is Market {
  return value === "ie" || value === "in";
}

/**
 * Builds the hreflang `languages` map for a page, or undefined when the page
 * has no linked counterpart on the other market's site — so tags only ever
 * appear on pages that exist on both domains, with absolute URLs.
 *
 * Self-referencing and bidirectional: the other site's page links back to
 * this one through its own `alternates` field, so each side emits the same
 * three entries. x-default is the Irish (.com) page, the primary site.
 */
export function buildHreflang(
  alternate: AlternateDoc,
  currentPath: string,
): Record<string, string> | undefined {
  if (!alternate || !isMarket(alternate.market) || alternate.market === MARKET) return undefined;

  const prefix = alternate.slug ? PATH_PREFIX[alternate._type ?? ""] : "";
  if (alternate.slug && prefix === undefined) return undefined;
  const otherPath = alternate.slug ? `${prefix}${alternate.slug}` : currentPath;

  const urls: Record<Market, string> = {
    [MARKET]: `${SITE_URL}${currentPath}`,
    [alternate.market]: `${SITE_DOMAINS[alternate.market]}${otherPath}`,
  } as Record<Market, string>;

  return {
    [LOCALES.in.html]: urls.in,
    [LOCALES.ie.html]: urls.ie,
    "x-default": urls.ie,
  };
}
