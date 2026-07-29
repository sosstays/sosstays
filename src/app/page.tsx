import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { HOMEPAGE_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";

export const revalidate = 60;

export default async function HomePage() {
  const { properties, areas, posts } = await client.fetch(HOMEPAGE_QUERY);

  return (
    <main>
      {/* Hero — brand soul tagline leads, name explanation right under it
          per the brand voice doc's tagline hierarchy. */}
      <section className="bg-[#0A5540] px-4 py-24 text-center text-white sm:py-32">
        <p className="text-sm font-medium uppercase tracking-widest text-[#A3D9C9]">
          Somewhere Out Somewhere
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl font-serif text-4xl font-semibold italic sm:text-5xl">
          Send your SOS. We&apos;ll sort the stay.
        </h1>
        <p className="mt-4 text-[#A3D9C9]">Sos is the Irish word for a break.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/stays"
            className="rounded-md bg-white px-6 py-3 font-medium text-[#0A5540] hover:bg-[#E8F5F0]"
          >
            Find your break
          </Link>
          <Link
            href="/landlords"
            className="rounded-md border border-white/40 px-6 py-3 font-medium text-white hover:bg-white/10"
          >
            I have a property to manage
          </Link>
        </div>
      </section>

      {/* Featured stays */}
      {properties.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl font-semibold text-[#1C1C1C]">
              A few places to start
            </h2>
            <Link href="/stays" className="text-sm font-medium text-[#0F6E56] hover:underline">
              View all stays →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {properties.map((property: any) => (
              <Link key={property._id} href={`/stays/${property.slug}`} className="group block">
                {property.coverImage && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={urlFor(property.coverImage).width(500).height(375).url()}
                      alt={property.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <h3 className="mt-3 font-serif text-lg font-semibold text-[#1C1C1C]">
                  {property.name}
                </h3>
                <p className="text-sm text-[#555550]">{property.location}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Areas */}
      {areas.length > 0 && (
        <section className="bg-[#E8F5F0] px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-3xl font-semibold text-[#1C1C1C]">
                Where to unplug
              </h2>
              <Link href="/areas" className="text-sm font-medium text-[#0F6E56] hover:underline">
                Explore all areas →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {areas.map((area: any) => (
                <Link key={area._id} href={`/areas/${area.slug}`} className="group block">
                  {area.heroImage && (
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={urlFor(area.heroImage).width(300).height(300).url()}
                        alt={area.areaName}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium text-[#1C1C1C]">{area.areaName}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog teaser */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl font-semibold text-[#1C1C1C]">From the blog</h2>
            <Link href="/blog" className="text-sm font-medium text-[#0F6E56] hover:underline">
              Read more →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {posts.map((post: any) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="group block">
                {post.coverImage && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={urlFor(post.coverImage).width(500).height(375).url()}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <h3 className="mt-3 font-serif text-lg font-semibold text-[#1C1C1C]">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-1 text-sm text-[#555550]">{post.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Landlord CTA strip */}
      <section className="bg-[#1C1C1C] px-4 py-16 text-center text-white">
        <h2 className="font-serif text-3xl font-semibold">
          Already self-managing your Airbnb?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[#A3D9C9]">
          Most self-managing hosts earn 20–35% less than they should. We&apos;ll take
          it fully off your hands — commission-only, no setup fee.
        </p>
        <Link
          href="/landlords"
          className="mt-6 inline-block rounded-md bg-[#0F6E56] px-6 py-3 font-medium text-white hover:bg-[#0A5540]"
        >
          Send your SOS
        </Link>
      </section>
    </main>
  );
}
