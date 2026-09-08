import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
