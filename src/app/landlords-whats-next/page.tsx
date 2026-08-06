import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { LANDLORD_BLOG_POSTS_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { HeroNav } from "@/components/HeroNav";
import { LandlordsWhatsNext } from "@/components/LandlordsWhatsNext";
import type { NavLink } from "@/lib/navLinks";

// This page has none of its own sections to jump to, so the shared
// LANDLORD_NAV_LINKS (bare "#how-it-works" / "#faq" hashes, meant for use
// on /landlords itself) would dead-end here — point them back at /landlords
// explicitly instead.
const NAV_LINKS: NavLink[] = [
  { href: "/landlords#how-it-works", label: "How it works" },
  { href: "/landlords#faq", label: "FAQ" },
];

// Only ever reached right after submitting the landlord contact form — not
// a page anyone should land on from search, so it's kept out of the index.
export const metadata: Metadata = {
  title: "What's next — Sos Stays",
  robots: { index: false, follow: false },
};

export default async function LandlordsWhatsNextPage() {
  const [posts, siteSettings] = await Promise.all([
    client.fetch(LANDLORD_BLOG_POSTS_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);

  return (
    <>
      <HeroNav
        links={NAV_LINKS}
        variant="landlords"
        ctaHref="mailto:info@sosstays.com"
        ctaLabel="Contact us"
        sticky
      />
      <LandlordsWhatsNext
        posts={posts}
        socialLinks={siteSettings?.socialLinks}
        fallbackAuthorName={siteSettings?.businessName || "Sos Stays"}
      />
    </>
  );
}
