import type { Metadata } from "next";
import { urlFor } from "@/sanity/image";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";

type SeoData = {
  title: string;
  description: string;
  image?: any;
  noIndex?: boolean;
} | null | undefined;

export const SITE_URL = "https://sosstays.com";
const DEFAULT_TITLE = "Sos Stays | Holiday Homes to Book & Properties to Manage in Louth, Meath & the Mournes";
const DEFAULT_DESCRIPTION =
  "Book direct holiday homes across the Boyne Valley, Louth, and the Mournes — no Airbnb fees. Own a property? We manage it for you and grow your income. Send your SOS.";

// Every page calls this with its `seo` projection from Sanity (see
// queries.ts). Falls back to the site settings' default SEO title/
// description/image, then hardcoded defaults, so nothing ever ships
// with blank metadata or a missing share image.
export async function buildMetadata(seo: SeoData, path: string = ""): Promise<Metadata> {
  const siteSettings = await client.fetch(SITE_SETTINGS_QUERY);

  const title = seo?.title || siteSettings?.defaultSeoTitle || DEFAULT_TITLE;
  const description = seo?.description || siteSettings?.defaultSeoDescription || DEFAULT_DESCRIPTION;
  const image = seo?.image || siteSettings?.defaultSeoImage;
  const imageUrl = image ? urlFor(image).width(1200).height(630).url() : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    robots: seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Sos Stays",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
      locale: "en_IE",
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
