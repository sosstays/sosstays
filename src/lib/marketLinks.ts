import { cache } from "react";
import { client } from "@/sanity/client";
import { MARKET } from "@/lib/market";
import { MARKET_CONTENT_QUERY } from "@/sanity/queries";

type Linkish = { href: string };

// A bare "contact" (no leading slash) resolves relative to the current page
// and 404s from nested routes, so authored links are normalised here.
export function normalizeHref(href: string): string {
  const h = href.trim();
  return /^(https?:|mailto:|tel:|\/|#)/i.test(h) ? h : `/${h}`;
}

type ContentIndex = {
  slugs: Record<"propertyPage" | "areaGuide" | "blogPost" | "landlordPage", string[]>;
  singletons: string[];
};

// One small query per request (deduped by React's cache): which pages the
// current market actually has content for.
const getContentIndex = cache(async (): Promise<ContentIndex> => {
  const data = await client.fetch(MARKET_CONTENT_QUERY);
  const slugs = { propertyPage: [], areaGuide: [], blogPost: [], landlordPage: [] } as ContentIndex["slugs"];
  for (const doc of (data?.docs ?? []) as { _type: keyof ContentIndex["slugs"]; slug: string }[]) {
    slugs[doc._type]?.push(doc.slug);
  }
  return { slugs, singletons: (data?.singletons ?? []) as string[] };
});

const COLLECTIONS: Record<string, keyof ContentIndex["slugs"]> = {
  stays: "propertyPage",
  areas: "areaGuide",
  blog: "blogPost",
  landlords: "landlordPage",
};

const SINGLETON_PAGES: Record<string, string> = {
  about: "aboutPage",
  "corporate-stays": "corporateStaysPage",
  "privacy-policy": "privacyPolicyPage",
  "terms-and-conditions": "termsPage",
  shop: "shopPage",
};

// Pages with static copy that don't depend on market content.
const ALWAYS = new Set(["contact"]);

// Anything not matched below is Ireland-only for now: the partner directory,
// the Irish county pricing data, location search, and standalone landing
// pages (e.g. /hotels-near-*), which have no market field.
function hasContent(href: string, index: ContentIndex): boolean {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return true;
  const path = href.split(/[#?]/)[0];
  if (path === "" || path === "/") return true;

  const [first, second] = path.split("/").filter(Boolean);
  if (ALWAYS.has(first)) return true;
  if (COLLECTIONS[first]) {
    const slugs = index.slugs[COLLECTIONS[first]];
    return second ? slugs.includes(second) : slugs.length > 0;
  }
  if (SINGLETON_PAGES[first]) return index.singletons.includes(SINGLETON_PAGES[first]);
  return false;
}

// Normalises authored links and, outside Ireland, drops any whose target has
// no content in this market — so e.g. the India footer never links to Irish
// area guides or "Hotels near Newgrange". Ireland is left as authored.
export async function filterLinksForMarket<T extends Linkish>(links: T[]): Promise<T[]> {
  const normalised = links.map((l) => ({ ...l, href: normalizeHref(l.href) }));
  if (MARKET === "ie") return normalised;
  const index = await getContentIndex();
  return normalised.filter((l) => hasContent(l.href, index));
}
