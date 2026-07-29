import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { SITEMAP_QUERY } from "@/sanity/queries";

const SITE_URL = "https://sosstays.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await client.fetch(SITEMAP_QUERY);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = entries.map((entry: any) => ({
    url: `${SITE_URL}${entry.href}`,
    lastModified: entry._updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
