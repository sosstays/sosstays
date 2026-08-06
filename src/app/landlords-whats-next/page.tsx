import type { Metadata } from "next";
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

export default function LandlordsWhatsNextPage() {
  return (
    <>
      <HeroNav
        links={NAV_LINKS}
        variant="landlords"
        ctaHref="mailto:info@sosstays.com"
        ctaLabel="Contact us"
        sticky
      />
      <LandlordsWhatsNext />
    </>
  );
}
