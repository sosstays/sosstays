import type { NextConfig } from "next";

// Kill switch for keeping a whole deployment out of search (see
// SITE_NOINDEX in src/lib/market.ts) — belt and braces with the meta tag.
const noIndexHeaders =
  process.env.SITE_NOINDEX?.trim().toLowerCase() === "true"
    ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
    : [];

const nextConfig: NextConfig = {
  async headers() {
    return noIndexHeaders;
  },
  async redirects() {
    return [
      // Funtasia's real page is the SEO landing page at /hotels-near-funtasia
      // (see src/app/[slug]/page.tsx) — /partners/funtasia is a duplicate
      // that shouldn't be reachable. The [slug] partner-profile page also
      // redirects dynamically via profileHref for defense in depth; this
      // catches the request before it even reaches that page.
      {
        source: "/partners/funtasia",
        destination: "/hotels-near-funtasia",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        // Uplisting's photo CDN — used by room detail pages, which pull
        // gallery images straight from Uplisting instead of Sanity.
        protocol: "https",
        hostname: "djts5lg061pqs.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
