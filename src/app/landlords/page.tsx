import Link from "next/link";
import { client } from "@/sanity/client";
import { LANDLORD_PAGES_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { LandlordPageContent } from "@/components/LandlordPageContent";
import { HeroNav } from "@/components/HeroNav";
import { getLandlordNavLinks } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";
import type { Metadata } from "next";

export const revalidate = 60;

// Fallback SEO for the single-page case. The LANDLORD_PAGES_QUERY's `seo`
// projection coalesces seoTitle → the page's own `title` field when no
// seoTitle is set in Sanity, and seoDescription → "" when unset — so an
// unset seoTitle is never literally falsy, it just equals `title`. Detect
// that (rather than relying on `pages[0].seo` being falsy, which it never
// is) so an editor-set seoTitle/seoDescription still takes precedence over
// this hardcoded SEO copy.
const LANDLORDS_FALLBACK_SEO = {
  title: "Airbnb Management Ireland | Commission-Only | SOS Stays",
  description:
    "Commission-only Airbnb and short-term let management for landlords across Ireland. Dynamic pricing, cleaning, maintenance and guest comms handled — from 15% commission, no setup fee.",
};

export async function generateMetadata(): Promise<Metadata> {
  const pages = await client.fetch(LANDLORD_PAGES_QUERY);
  if (pages.length === 1) {
    const page = pages[0];
    const hasCustomTitle = Boolean(page.seo?.title) && page.seo.title !== page.title;
    const hasCustomDescription = Boolean(page.seo?.description);
    const seo = {
      title: hasCustomTitle ? page.seo.title : LANDLORDS_FALLBACK_SEO.title,
      description: hasCustomDescription ? page.seo.description : LANDLORDS_FALLBACK_SEO.description,
      image: page.seo?.image,
      noIndex: page.seo?.noIndex,
    };
    return buildMetadata(seo, "/landlords");
  }
  return buildMetadata(null, "/landlords");
}

export default async function LandlordsIndexPage() {
  const [pages, landlordNavLinks] = await Promise.all([
    client.fetch(LANDLORD_PAGES_QUERY),
    getLandlordNavLinks(),
  ]);

  // Common case: exactly one landlord pitch page exists — render it
  // directly at /landlords so the main nav CTA is never a dead link.
  if (pages.length === 1) {
    return <LandlordPageContent page={pages[0]} />;
  }

  if (pages.length === 0) {
    return (
      <main className="overflow-x-hidden bg-cream font-sans text-near-black">
        <section className="relative bg-maroon px-8 pt-[180px] pb-24 text-center sm:px-14 sm:pt-[200px]">
          <HeroNav
            links={landlordNavLinks}
            variant="landlords"
            ctaHref="/contact"
            ctaLabel="Contact us"
          />
          <Reveal as="h1" className="font-serif text-4xl font-bold text-cream">For landlords</Reveal>
          <Reveal as="p" delay={120} className="mt-4 text-light-sage">
            Details coming soon —{" "}
            <Link href="/contact" className="text-cream underline">
              get in touch
            </Link>{" "}
            in the meantime.
          </Reveal>
        </section>
      </main>
    );
  }

  // Multiple landlord pages exist — show a simple chooser.
  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <section className="relative bg-maroon px-8 pt-[180px] pb-24 sm:px-14 sm:pt-[200px]">
        <HeroNav
          links={landlordNavLinks}
          variant="landlords"
          ctaHref="/contact"
          ctaLabel="Contact us"
        />
        <div className="mx-auto max-w-3xl">
          <Reveal as="h1" className="font-serif text-4xl font-bold text-cream">For landlords</Reveal>
          <ul className="mt-6 space-y-4">
            {pages.map((page: any, i: number) => (
              <Reveal as="li" key={page._id} delay={120 + Math.min(i, 5) * 80}>
                <Link href={`/landlords/${page.slug}`} className="text-lg text-cream underline">
                  {page.title}
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
