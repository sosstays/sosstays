import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { client } from "@/sanity/client";
import { HERO_SECTION_QUERY, HOMEPAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { JsonLd, buildOrganizationSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { HOME_NAV_LINKS } from "@/lib/navLinks";
import { PropertyCard } from "@/components/PropertyCard";
import { AreaSpotlightCarousel } from "@/components/AreaSpotlightCarousel";

export const revalidate = 60;

export default async function HomePage() {
  const [hero, { properties, areas, posts }, siteSettings] = await Promise.all([
    client.fetch(HERO_SECTION_QUERY),
    client.fetch(HOMEPAGE_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);
  const featuredProperty = properties[0];
  const headingLines = hero?.heading?.split(/\\n|\n/) ?? [];
  const instagramUrl = siteSettings?.socialLinks?.find(
    (link: { platform: string; url: string }) => link.platform === "instagram",
  )?.url;

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={buildOrganizationSchema(siteSettings)} />

      {/* HERO */}
      <section className="relative h-[94vh] min-h-[700px] w-full bg-forest-green">
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

        <HeroNav links={HOME_NAV_LINKS} ctaHref="#stays" ctaLabel="Send your SOS" />

        {/* hero content */}
        <div className="absolute inset-x-8 bottom-16 z-10 flex flex-col items-center justify-end gap-10 text-center sm:inset-x-14 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="max-w-2xl">
            {hero?.eyebrow && (
              <p className="mb-5 text-xs font-semibold tracking-widest text-light-sage uppercase">
                {hero.eyebrow}
              </p>
            )}
            <h1 className="mb-6 font-serif text-4xl leading-[1.05] font-semibold text-cream italic sm:text-6xl">
              {headingLines.map((line: string, i: number) => (
                <span key={i}>
                  {line}
                  {i < headingLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            {hero?.body && (
              <p className="mx-auto mb-4 max-w-[500px] text-lg text-cream/95 sm:mx-0">
                {hero.body}
              </p>
            )}
            {hero?.subBody && (
              <p className="mx-auto mb-8 max-w-[460px] text-sm text-light-sage/85 sm:mx-0">
                {hero.subBody}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
              {hero?.primaryCtaLabel && (
                <Link
                  href={hero.primaryCtaUrl || "/stays"}
                  className="inline-block rounded-full bg-cream px-8 py-4 text-[15px] font-semibold text-forest-green transition-opacity hover:opacity-80"
                >
                  {hero.primaryCtaLabel}
                </Link>
              )}
              {hero?.secondaryCtaLabel && (
                <Link
                  href={hero.secondaryCtaUrl || "/landlords"}
                  className="inline-block rounded-full border border-cream px-8 py-4 text-[15px] font-semibold text-cream transition-opacity hover:opacity-80"
                >
                  {hero.secondaryCtaLabel}
                </Link>
              )}
            </div>
          </div>
          {hero?.image?.alt && (
            <div className="text-sm whitespace-nowrap text-cream/75 sm:text-right">
              {hero.image.alt}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED STAY */}
      {featuredProperty && (
        <section id="stays" className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
          <div className="mb-14 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
              A few places to start
            </h2>
            <p className="max-w-[380px] text-near-black/60">
              One house, for now. Have a proper look around it.
            </p>
          </div>

          <PropertyCard
            slug={featuredProperty.slug}
            name={featuredProperty.name}
            location={featuredProperty.location}
            shortDescription={featuredProperty.shortDescription}
            sleeps={featuredProperty.sleeps}
            coverImage={featuredProperty.coverImage}
            gallery={featuredProperty.gallery}
          />
        </section>
      )}

      {/* AREA SPOTLIGHT */}
      <AreaSpotlightCarousel areas={areas} />

      {/* BLOG TEASER */}
      {/* {posts.length > 0 && (
        <section id="blog" className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
          <div className="mb-12">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
              From the blog
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
              A few things worth reading
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {posts.map((post: any) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="flex gap-4.5">
                {post.coverImage ? (
                  <div className="relative h-24 w-24 flex-none overflow-hidden rounded-[10px]">
                    <Image
                      src={urlFor(post.coverImage).width(200).height(200).url()}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 flex-none rounded-[10px] bg-sage-grey/25" />
                )}
                <div>
                  <h3 className="mb-2 font-serif text-base leading-tight font-bold text-near-black">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-near-black/60">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )} */}

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
          <Link
            href="/landlords"
            className="inline-block rounded-full border border-cream px-8 py-4 text-[15px] font-semibold text-cream transition-opacity hover:opacity-80"
          >
            Send your SOS
          </Link>
        </div>
      </section>

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
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-forest-green px-7 py-3.5 text-[15px] font-semibold whitespace-nowrap text-cream transition-opacity hover:opacity-85"
            >
              Follow us on Instagram
            </a>
          )}
        </div>
        <behold-widget feed-id="WcXQ8APwHKWEf2AxzA0R"></behold-widget>
      </section>
      <Script src="https://w.behold.so/widget.js" type="module" strategy="afterInteractive" />
    </main>
  );
}
