import { client } from "@/sanity/client";
import { AREA_GUIDES_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { AreaGuideCard } from "@/components/AreaGuideCard";
import { Button } from "@/components/Button";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(
    {
      title: "Areas | Sos Stays",
      description: "Explore the Boyne Valley, the Mournes, and the Louth coastline.",
    },
    "/areas",
  );
}

export default async function AreasIndexPage() {
  const areas = await client.fetch(AREA_GUIDES_QUERY);

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <h1 className="font-serif text-4xl font-semibold text-forest-green">Areas</h1>
          <p className="mt-2 text-[#555550]">
            From the Boyne to the Mournes — a proper break, wherever you land.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area: any) => (
              <AreaGuideCard key={area._id} guide={area} />
            ))}
          </div>

          {areas.length === 0 && (
            <p className="mt-8 text-[#555550]">Area guides coming soon.</p>
          )}

          <div className="mt-12 flex flex-col items-start gap-4 rounded-[14px] border border-sage-grey/40 bg-light-forest-green/25 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-forest-green">
                Visiting Funtasia?
              </h2>
              <p className="mt-1 text-sm text-near-black/70">
                Skip the hotel — see our stays near Funtasia in Drogheda instead.
              </p>
            </div>
            <Button link="/hotels-near-funtasia" variant="primary" bgColor="forest-green" color="cream">
              Hotels near Funtasia →
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
