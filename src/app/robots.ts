import type { MetadataRoute } from "next";

import { SITE_URL, SITE_NOINDEX } from "@/lib/market";

// Search and AI crawlers are all welcome on public pages: there is no
// per-bot block here on purpose. The disallows below only keep crawlers out
// of routes that have no search value (API, sign-in callback, the booking
// flow and its confirmation pages), so crawl time goes to real content.
export default function robots(): MetadataRoute.Robots {
  if (SITE_NOINDEX) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/oauth/", "/thank-you", "/stays/*/book"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
