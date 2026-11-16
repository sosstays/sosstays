// Which market this build of the site serves. One codebase, two sites:
// sosstays.com builds with SITE_MARKET=ie (the default when unset, so
// existing builds and local dev are unchanged), sosstays.in builds with
// SITE_MARKET=in. Every Sanity query is scoped to this value (see
// sanity/client.ts), and it also drives the domain, locale, currency and
// indexing rules below.
export type Market = "ie" | "in";

const MARKETS: readonly Market[] = ["ie", "in"];

function resolveMarket(): Market {
  const raw = process.env.SITE_MARKET?.trim().toLowerCase();
  if (!raw) return "ie";
  if ((MARKETS as readonly string[]).includes(raw)) return raw as Market;
  // A typo must not quietly serve Irish content on the wrong domain.
  throw new Error(`Invalid SITE_MARKET "${process.env.SITE_MARKET}" — expected one of: ${MARKETS.join(", ")}`);
}

export const MARKET: Market = resolveMarket();

// Each market's own domain — canonical, og:url, sitemap and robots all
// self-reference this, never the other market's.
const DOMAINS: Record<Market, string> = {
  ie: "https://sosstays.com",
  in: "https://sosstays.in",
};
export const SITE_URL = DOMAINS[MARKET];
export const SITE_DOMAINS = DOMAINS;

export const LOCALES: Record<Market, { html: string; og: string }> = {
  ie: { html: "en-IE", og: "en_IE" },
  in: { html: "en-IN", og: "en_IN" },
};
export const LOCALE = LOCALES[MARKET];

// Hard kill switch: SITE_NOINDEX=true on a deployment makes every page
// noindex (meta + X-Robots-Tag header) and empties its sitemap, whatever
// the per-document setting says. Used to keep sosstays.in out of search
// until its content is populated.
export const SITE_NOINDEX = process.env.SITE_NOINDEX?.trim().toLowerCase() === "true";

// Whether a page may be indexed, given its `noIndex` field from Sanity
// (true / false / unset). Ireland: indexable unless explicitly hidden.
// India: hidden unless an editor has explicitly set noIndex to false, so
// unpopulated or placeholder pages never get indexed by accident.
export function isIndexable(noIndex: boolean | null | undefined): boolean {
  if (SITE_NOINDEX || noIndex === true) return false;
  if (MARKET === "in") return noIndex === false;
  return true;
}

// Neutral fallbacks for when the market's siteSettings doc is empty or
// unpublished. Ireland keeps its existing copy; India never inherits it.
export const DEFAULT_SEO =
  MARKET === "in"
    ? {
        title: "Sos Stays",
        description: "Sos Stays — short-term rental property management.",
      }
    : {
        title: "Sos Stays | Holiday Homes to Book & Properties to Manage in Louth, Meath & the Mournes",
        description:
          "Book direct holiday homes across the Boyne Valley, Louth, and the Mournes — no Airbnb fees. Own a property? We manage it for you and grow your income. Send your SOS.",
      };
