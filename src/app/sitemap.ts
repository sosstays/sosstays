import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { SITEMAP_QUERY, SITEMAP_SINGLETONS_QUERY } from "@/sanity/queries";
import { normalizeLandlordSlug } from "@/sanity/jsonld";
import { MARKET, SITE_URL, SITE_NOINDEX, isIndexable } from "@/lib/market";

// Priority/frequency for routes that aren't in the CMS-backed singleton
// query below (no per-page _updatedAt to key off of).
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${SITE_URL}/stays`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/areas`, changeFrequency: "weekly", priority: 0.6 },
  { url: `${SITE_URL}/pricing`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/landlords`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${SITE_URL}/corporate-stays/list-your-property`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
];

// Singleton-backed pages: priority/frequency keyed by href, lastModified
// comes from the document's own _updatedAt.
const SINGLETON_META: Record<string, { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = {
  "/corporate-stays": { changeFrequency: "monthly", priority: 0.6 },
  "/about": { changeFrequency: "monthly", priority: 0.5 },
  "/privacy-policy": { changeFrequency: "yearly", priority: 0.3 },
  "/terms-and-conditions": { changeFrequency: "yearly", priority: 0.3 },
  "/bespoke-ireland-trip": { changeFrequency: "monthly", priority: 0.6 },
  "/gift-maker": { changeFrequency: "monthly", priority: 0.6 },
  "/partners": { changeFrequency: "monthly", priority: 0.5 },
  "/shop": { changeFrequency: "weekly", priority: 0.6 },
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (SITE_NOINDEX) return [];

  const [entries, singletons] = await Promise.all([
    client.fetch(SITEMAP_QUERY),
    client.fetch(SITEMAP_SINGLETONS_QUERY),
  ]);

  const singletonRoutes: MetadataRoute.Sitemap = singletons
    .filter((entry: any) => entry.href && isIndexable(entry.noIndex))
    .map((entry: any) => ({
      url: `${SITE_URL}${entry.href}`,
      lastModified: entry._updatedAt,
      ...SINGLETON_META[entry.href],
    }));

  const dynamicRoutes: MetadataRoute.Sitemap = entries.map((entry: any) => {
    // landlordPage's own slug can be stored as "/landlords" (the hub page),
    // which the GROQ `href` built as "/landlords/" + slug.current — a
    // literal "/landlords//landlords". Recompute just this type's href with
    // the same normalization already used for its JSON-LD, rather than
    // trusting the raw GROQ-built string.
    const href =
      entry._type === "landlordPage"
        ? (() => {
            const slug = normalizeLandlordSlug(entry.slug);
            return slug ? `/landlords/${slug}` : "/landlords";
          })()
        : entry.href;
    return {
      url: `${SITE_URL}${href}`,
      lastModified: entry._updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  // The static route list is Ireland's; India only lists real, indexable docs.
  const allRoutes = [...(MARKET === "ie" ? STATIC_ROUTES : []), ...singletonRoutes, ...dynamicRoutes];

  // Defensive de-dup: keeps the first (highest-priority) entry for any URL
  // that ends up listed twice, e.g. a static route also present in a
  // singleton/dynamic query result.
  const seen = new Set<string>();
  return allRoutes.filter((route) => {
    if (seen.has(route.url)) return false;
    seen.add(route.url);
    return true;
  });
}
