import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { SITEMAP_QUERY } from "@/sanity/queries";

const SITE_URL = "https://sosstays.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await client.fetch(SITEMAP_QUERY);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/stays`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/landlords`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/corporate-stays`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = entries.map((entry: any) => ({
    url: `${SITE_URL}${entry.href}`,
    lastModified: entry._updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
