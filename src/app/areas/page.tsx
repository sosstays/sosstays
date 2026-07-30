import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { AREA_GUIDES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";

export const revalidate = 60;

export const metadata = {
  title: "Areas | Sos Stays",
  description: "Explore the Boyne Valley, the Mournes, and the Louth coastline.",
};

export default async function AreasIndexPage() {
  const areas = await client.fetch(AREA_GUIDES_QUERY);

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Send your SOS" sticky />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold text-[#1C1C1C]">Areas</h1>
        <p className="mt-2 text-[#555550]">
          From the Boyne to the Mournes — a proper break, wherever you land.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {areas.map((area: any) => (
            <Link key={area._id} href={`/areas/${area.slug}`} className="group block">
              {area.heroImage && (
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                  <Image
                    src={urlFor(area.heroImage).width(800).height(450).url()}
                    alt={area.areaName}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <h2 className="mt-3 font-serif text-xl font-semibold text-[#1C1C1C]">
                {area.areaName}
              </h2>
            </Link>
          ))}
        </div>

        {areas.length === 0 && (
          <p className="mt-8 text-[#555550]">Area guides coming soon.</p>
        )}
      </main>
    </>
  );
}
