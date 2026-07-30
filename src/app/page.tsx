import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { HOMEPAGE_QUERY } from "@/sanity/queries";
import { HeroNav } from "@/components/HeroNav";
import { MinimalFooter } from "@/components/MinimalFooter";
import { PropertyCard } from "@/components/PropertyCard";
import { AreaSpotlightCarousel } from "@/components/AreaSpotlightCarousel";

export const revalidate = 60;

export default async function HomePage() {
  const { properties, areas, posts } = await client.fetch(HOMEPAGE_QUERY);
  const featuredProperty = properties[0];

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      {/* HERO */}
      <section className="relative h-[94vh] min-h-[700px] w-full bg-forest-green">
        <Image
          src="https://cdn.sanity.io/images/owyw3r12/production/094b90b907f8217d1f4b26f4607a3acb6169ffff-5464x3640.jpg"
          alt={featuredProperty?.name ?? "Sos Stays"}
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "center 62%" }}
        />
        <div className="absolute inset-0 bg-forest-green/60" />

        <HeroNav variant="home" />

        {/* hero content */}
        <div className="absolute inset-x-8 bottom-16 z-10 flex flex-col items-center justify-end gap-10 text-center sm:inset-x-14 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-semibold tracking-widest text-light-sage uppercase">
              Somewhere Out Somewhere
            </p>
            <h1 className="mb-6 font-serif text-4xl leading-[1.05] font-semibold text-cream italic sm:text-6xl">
              Somewhere out.
              <br />
              Somewhere quiet.
            </h1>
            <p className="mx-auto mb-4 max-w-[500px] text-lg text-cream/95 sm:mx-0">
              Real places along the coast and the Boyne Valley — no two the same, all properly looked after. Find your somewhere for the weekend, or longer.
            </p>
            <p className="mx-auto mb-8 max-w-[460px] text-sm text-light-sage/85 sm:mx-0">
              Sos is the Irish word for a break. We named ourselves after exactly
              what we offer.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
              <Link
                href="/stays"
                className="inline-block rounded-full bg-cream px-8 py-4 text-[15px] font-semibold text-forest-green transition-opacity hover:opacity-80"
              >
                Find your Somewhere
              </Link>
              <Link
                href="/landlords"
                className="inline-block rounded-full border border-cream px-8 py-4 text-[15px] font-semibold text-cream transition-opacity hover:opacity-80"
              >
                I have a property to manage
              </Link>
            </div>
          </div>
          {featuredProperty && (
            <div className="text-sm whitespace-nowrap text-cream/75 sm:text-right">
              {featuredProperty.name}
              <br />
              {featuredProperty.location}
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

      <MinimalFooter variant="home" />
    </main>
  );
}
