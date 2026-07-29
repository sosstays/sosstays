import type { Metadata } from "next";
import { urlFor } from "@/sanity/image";

type SeoData = {
  title: string;
  description: string;
  image?: any;
  noIndex?: boolean;
} | null | undefined;

const SITE_URL = "https://sosstays.com";
const DEFAULT_TITLE = "Sos Stays | Holiday Homes to Book & Properties to Manage in Louth, Meath & the Mournes";
const DEFAULT_DESCRIPTION =
  "Book direct holiday homes across the Boyne Valley, Louth, and the Mournes — no Airbnb fees. Own a property? We manage it for you and grow your income. Send your SOS.";

// Every page calls this with its `seo` projection from Sanity (see
// queries.ts). Falls back to site-wide defaults if fields are empty,
// so nothing ever ships with blank metadata.
export function buildMetadata(seo: SeoData, path: string = ""): Metadata {
  const title = seo?.title || DEFAULT_TITLE;
  const description = seo?.description || DEFAULT_DESCRIPTION;
  const imageUrl = seo?.image ? urlFor(seo.image).width(1200).height(630).url() : undefined;

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
