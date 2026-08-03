import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { PROPERTY_PAGES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";

export const revalidate = 60;

export const metadata = {
  title: "Stays | Sos Stays",
  description: "Holiday homes across Louth, Meath, and the Mournes — book direct, no Airbnb fees.",
};

export default async function StaysIndexPage() {
  const properties = await client.fetch(PROPERTY_PAGES_QUERY);

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold text-[#1C1C1C]">Stays</h1>
        <p className="mt-2 text-[#555550]">
          Book direct — no Airbnb fees, and you&apos;ll always know exactly who to call.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property: any) => (
            <Link key={property._id} href={`/stays/${property.slug}`} className="group block">
              {property.coverImage && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={urlFor(property.coverImage).width(600).height(450).url()}
                    alt={property.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <h2 className="mt-3 font-serif text-xl font-semibold text-[#1C1C1C]">
                {property.name}
              </h2>
              <p className="text-sm text-[#555550]">{property.location}</p>
            </Link>
          ))}
        </div>

        {properties.length === 0 && (
          <p className="mt-8 text-[#555550]">New stays coming soon — check back shortly.</p>
        )}
      </main>
    </>
  );
}
