// Which market this build of the site serves. One codebase, two sites:
// sosstays.com builds with SITE_MARKET=ie (the default when unset, so
// existing builds and local dev are unchanged), sosstays.in builds with
// SITE_MARKET=in. Every Sanity query is scoped to this value (see
// sanity/client.ts), and it also drives the country switcher's "current"
// selection and the currency.
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
