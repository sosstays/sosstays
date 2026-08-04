import Link from "next/link";
import { client } from "@/sanity/client";
import { LANDLORD_PAGES_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { LandlordPageContent } from "@/components/LandlordPageContent";
import { HeroNav } from "@/components/HeroNav";
import { LANDLORD_NAV_LINKS } from "@/lib/navLinks";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const pages = await client.fetch(LANDLORD_PAGES_QUERY);
  if (pages.length === 1) return buildMetadata(pages[0].seo, "/landlords");
  return buildMetadata(null, "/landlords");
}

export default async function LandlordsIndexPage() {
  const pages = await client.fetch(LANDLORD_PAGES_QUERY);

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
            links={LANDLORD_NAV_LINKS}
            variant="landlords"
            ctaHref="mailto:info@sosstays.com"
            ctaLabel="Contact us"
          />
          <h1 className="font-serif text-4xl font-bold text-cream">For landlords</h1>
          <p className="mt-4 text-light-sage">
            Details coming soon —{" "}
            <a href="mailto:info@sosstays.com" className="text-cream underline">
              get in touch
            </a>{" "}
            in the meantime.
          </p>
        </section>
      </main>
    );
  }

  // Multiple landlord pages exist — show a simple chooser.
  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <section className="relative bg-maroon px-8 pt-[180px] pb-24 sm:px-14 sm:pt-[200px]">
        <HeroNav
          links={LANDLORD_NAV_LINKS}
          variant="landlords"
          ctaHref="mailto:info@sosstays.com"
          ctaLabel="Contact us"
        />
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl font-bold text-cream">For landlords</h1>
          <ul className="mt-6 space-y-4">
            {pages.map((page: any) => (
              <li key={page._id}>
                <Link href={`/landlords/${page.slug}`} className="text-lg text-cream underline">
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
