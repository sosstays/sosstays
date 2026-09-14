import { client } from "@/sanity/client";
import { PROPERTY_PAGES_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(
    {
      title: "Stays | Sos Stays",
      description: "Book direct holiday homes across Louth, Meath, and the Mournes — no Airbnb fees.",
    },
    "/stays",
  );
}

type SosPropertyPage = {
  _id: string;
  name: string;
  slug: string;
  location: string;
  shortDescription?: string;
  sleeps?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
};

export default async function StaysIndexPage() {
  const [properties, siteNavLinks] = await Promise.all([
    client.fetch<SosPropertyPage[]>(PROPERTY_PAGES_QUERY),
    getGuestSiteNavLinks(),
  ]);

  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <Reveal as="h1" className="font-serif text-4xl font-semibold text-forest-green">Stays</Reveal>
          <Reveal as="p" delay={120} className="mt-2 text-near-black/60">
            Book direct — no Airbnb fees, and you&apos;ll always know exactly who to call.
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, i) => (
              <Reveal key={property._id} delay={Math.min(i, 5) * 90}>
                <PropertyCard
                  slug={property.slug}
                  name={property.name}
                  location={property.location}
                  shortDescription={property.shortDescription}
                  sleeps={property.sleeps}
                  coverImage={property.coverImage}
                  surface="framed"
                  hideSleeps
                />
              </Reveal>
            ))}
          </div>

          {properties.length === 0 && (
            <p className="mt-8 text-near-black/60">Stays coming soon.</p>
          )}
        </div>
      </main>
    </>
  );
}
