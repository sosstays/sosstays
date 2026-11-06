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
    // Next's default deviceSizes go up to 3840, so a full-width image on a
    // large/retina screen requested a 3840px original from Sanity's CDN.
    // Capped at 1600 — most traffic (India especially) is mobile, and our
    // sources are authored at ~1600 anyway. Also serves AVIF/WebP.
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
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
