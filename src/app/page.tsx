import Image from "next/image";
import Script from "next/script";
import { client } from "@/sanity/client";
import { HERO_SECTION_QUERY, HOMEPAGE_QUERY, HOSTS_MODULE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import { JsonLd, buildOrganizationSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { HOME_NAV_LINKS } from "@/lib/navLinks";
import { PropertyCard, type PropertyCardProps } from "@/components/PropertyCard";
import { Button } from "@/components/Button";
import { AreaSpotlightCarousel } from "@/components/AreaSpotlightCarousel";
import { HostsModule } from "@/components/HostsModule";
import { SearchBar } from "@/components/SearchBar";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(null, "");
}

export default async function HomePage() {
  const [hero, { properties, areas }, siteSettings, hostsModule] = await Promise.all([
    client.fetch(HERO_SECTION_QUERY),
    client.fetch(HOMEPAGE_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
    client.fetch(HOSTS_MODULE_QUERY),
  ]);
  const headingLines = hero?.heading?.split(/\\n|\n/) ?? [];
  const instagramUrl = siteSettings?.socialLinks?.find(
    (link: { platform: string; url: string }) => link.platform === "instagram",
  )?.url;

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={buildOrganizationSchema(siteSettings)} />

      {/* HERO */}
      <section className="relative min-h-[94vh] w-full bg-forest-green">
        {hero?.image && (
          <Image
            src={urlFor(hero.image).width(1600).height(1400).url()}
            alt={hero.image.alt}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-forest-green/60" />

        <HeroNav links={HOME_NAV_LINKS} ctaHref="#stays" ctaLabel="Find your break" />

        {/* hero content — in normal flow (not absolutely positioned) and
            min-h'd rather than height-locked, so if content ever grows
            taller than a viewport (e.g. the search bar pushing things out),
            it pushes the section taller instead of overflowing upward
            behind HeroNav, which sits above it (z-20 vs z-10) and would
            otherwise visually swallow whatever overflowed under it. The
            top padding guarantees clearance from the nav regardless of
            content height, which `top-24` inside an absolutely-positioned,
            vertically-centered box could not. */}
        <div className="relative z-10 mx-auto flex min-h-[94vh] w-[calc(100%-4rem)] flex-col items-center justify-center gap-10 pt-28 pb-10 text-center sm:w-[calc(100%-7rem)] sm:pt-32">
          <div className="w-full">
            {hero?.eyebrow && (
              <p className="mb-3 text-xs font-semibold tracking-widest text-light-sage uppercase sm:mb-5">
                {hero.eyebrow}
              </p>
            )}
            <h1 className="mb-4 font-serif text-4xl leading-[1.05] font-semibold text-cream italic sm:mb-6 sm:text-6xl">
              {headingLines.map((line: string, i: number) => (
                <span key={i}>
                  {line}
                  {i < headingLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            {hero?.body && <p className="mx-auto mb-3 text-lg text-cream/95 sm:mb-4">{hero.body}</p>}
            {hero?.subBody && (
              <p className="mx-auto mb-5 text-sm text-light-sage/85 sm:mb-8">{hero.subBody}</p>
            )}
            <div className="flex flex-wrap justify-center gap-4">
              {hero?.primaryCtaLabel && (
                <Button
                  link={hero.primaryCtaUrl || "#stays"}
                  variant="primary"
                  bgColor="cream"
                  color="forest-green"
                >
                  {hero.primaryCtaLabel}
                </Button>
              )}
              {hero?.secondaryCtaLabel && (
                <Button link={hero.secondaryCtaUrl || "/landlords"} variant="secondary" color="cream">
                  {hero.secondaryCtaLabel}
                </Button>
              )}
            </div>
          </div>

          <div className="w-full">
            <SearchBar />
          </div>

          {hero?.image?.alt && (
            <div className="text-sm whitespace-nowrap text-cream/75">{hero.image.alt}</div>
          )}
        </div>
      </section>

      {/* FEATURED STAYS */}
      {properties.length > 0 && (
        <section id="stays" className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
          <div className="mb-14 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
              A few places to start
            </h2>
            <p className="max-w-[380px] text-near-black/60">
              Have a proper look around each one.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property: PropertyCardProps & { _id: string }) => (
              <PropertyCard
                key={property._id}
                slug={property.slug}
                name={property.name}
                location={property.location}
                shortDescription={property.shortDescription}
                sleeps={property.sleeps}
                coverImage={property.coverImage}
                surface="framed"
                hideSleeps
                hideCta
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button link="/stays" variant="primary" bgColor="forest-green" color="cream">
              View all stays
            </Button>
          </div>
        </section>
      )}

      {/* HOSTS MODULE — property-owner services overview + pricing */}
      <HostsModule data={hostsModule} />

      {/* AREA SPOTLIGHT */}

      <AreaSpotlightCarousel areas={areas} />

      {/* INSTAGRAM FEED */}
      <section className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-2 text-xs tracking-widest text-near-black/55 uppercase">
              Follow along
            </p>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-forest-green sm:text-3xl">
              On Instagram
            </h2>
          </div>
          {instagramUrl && (
            <Button link={instagramUrl} external variant="primary" size="custom" className="px-7 py-3.5 text-[15px] font-semibold">
              Follow us on Instagram
            </Button>
          )}
        </div>
        <behold-widget feed-id="WcXQ8APwHKWEf2AxzA0R"></behold-widget>
      </section>
      <Script src="https://w.behold.so/widget.js" type="module" strategy="afterInteractive" />

      {/* LANDLORD CTA — maroon per the owner-context accent color */}
      <section id="landlords" className="bg-maroon px-8 py-28 text-center sm:px-14">
        <div className="mx-auto max-w-xl">
          <p className="mb-4 text-xs font-medium tracking-widest text-light-sage uppercase">
            For landlords
          </p>
          <h2 className="mb-5 font-serif text-4xl leading-tight font-bold tracking-tight text-cream sm:text-5xl">
            Already self-managing your Airbnb?
          </h2>
          <p className="mb-9 text-lg leading-relaxed text-cream/85">
            Most self-managing hosts earn 20–35% less than they should. We&apos;ll
            take it fully off your hands — commission-only, no setup fee.
          </p>
          <Button link="/landlords" variant="secondary" color="cream" animateColor="maroon">
            Send your SOS
          </Button>
        </div>
      </section>
    </main>
  );
}
