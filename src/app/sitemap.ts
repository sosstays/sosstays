import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { SITEMAP_QUERY, SITEMAP_SINGLETONS_QUERY } from "@/sanity/queries";

const SITE_URL = "https://sosstays.com";

// Priority/frequency for routes that aren't in the CMS-backed singleton
// query below (no per-page _updatedAt to key off of).
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${SITE_URL}/stays`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/pricing`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/landlords`, changeFrequency: "weekly", priority: 0.7 },
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
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, singletons] = await Promise.all([
    client.fetch(SITEMAP_QUERY),
    client.fetch(SITEMAP_SINGLETONS_QUERY),
  ]);

  const singletonRoutes: MetadataRoute.Sitemap = singletons
    .filter((entry: any) => entry.href && !entry.noIndex)
    .map((entry: any) => ({
      url: `${SITE_URL}${entry.href}`,
      lastModified: entry._updatedAt,
      ...SINGLETON_META[entry.href],
    }));

  const dynamicRoutes: MetadataRoute.Sitemap = entries.map((entry: any) => ({
    url: `${SITE_URL}${entry.href}`,
    lastModified: entry._updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...STATIC_ROUTES, ...singletonRoutes, ...dynamicRoutes];
}
