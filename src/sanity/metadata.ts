import type { Metadata } from "next";
import { urlFor } from "@/sanity/image";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { SITE_URL, LOCALE, DEFAULT_SEO, isIndexable } from "@/lib/market";

type SeoData = {
  title: string;
  description: string;
  image?: any;
  noIndex?: boolean | null;
} | null | undefined;

export { SITE_URL };

// Every page calls this with its `seo` projection from Sanity (see
// queries.ts). Falls back to the site settings' default SEO title/
// description/image, then hardcoded defaults, so nothing ever ships
// with blank metadata or a missing share image.
export async function buildMetadata(seo: SeoData, path: string = ""): Promise<Metadata> {
  const siteSettings = await client.fetch(SITE_SETTINGS_QUERY);

  const title = seo?.title || siteSettings?.defaultSeoTitle || DEFAULT_SEO.title;
  const description = seo?.description || siteSettings?.defaultSeoDescription || DEFAULT_SEO.description;
  const image = seo?.image || siteSettings?.defaultSeoImage;
  const imageUrl = image ? urlFor(image).width(1200).height(630).url() : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    robots: isIndexable(seo?.noIndex) ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Sos Stays",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
      locale: LOCALE.og,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
