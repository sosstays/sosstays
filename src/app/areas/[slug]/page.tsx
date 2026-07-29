import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { AREA_GUIDE_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await client.fetch(AREA_GUIDE_QUERY, { slug });
  if (!guide) return {};
  return buildMetadata(guide.seo, `/areas/${slug}`);
}

export default async function AreaGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await client.fetch(AREA_GUIDE_QUERY, { slug });
  if (!guide) notFound();

  return (
    <main>
      {guide.heroImage ? (
        <div className="relative h-[50vh] w-full">
          <Image
            src={urlFor(guide.heroImage).width(1600).height(800).url()}
            alt={guide.heroImage.alt || guide.areaName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#0A5540]/30" />
          <h1 className="absolute bottom-8 left-8 font-serif text-4xl font-semibold text-white sm:text-5xl">
            {guide.areaName}
          </h1>
        </div>
      ) : (
        <div className="bg-[#0A5540] px-4 py-16 text-center">
          <h1 className="font-serif text-4xl font-semibold text-white sm:text-5xl">
            {guide.areaName}
          </h1>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-12">
        {guide.introduction && (
          <div className="prose prose-neutral max-w-none">
            <PortableText value={guide.introduction} />
          </div>
        )}

        {guide.thingsToDo?.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1C1C]">Things to Do</h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {guide.thingsToDo.map((activity: any, i: number) => (
                <div key={i}>
                  {activity.image && (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={urlFor(activity.image).width(500).height(375).url()}
                        alt={activity.image.alt || activity.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="mt-2 font-medium text-[#1C1C1C]">{activity.title}</h3>
                  {activity.description && (
                    <p className="mt-1 text-sm text-[#555550]">{activity.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {guide.featuredProperties?.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1C1C]">
              Stays in {guide.areaName}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {guide.featuredProperties.map((property: any) => (
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
                  <h3 className="mt-2 font-medium text-[#1C1C1C]">{property.name}</h3>
                  <p className="text-sm text-[#555550]">{property.location}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {guide.relatedBlogPosts?.length > 0 && (
          <section className="mt-10 border-t border-[#E2E2DC] pt-6">
            <p className="text-sm font-medium text-[#555550]">Read more</p>
            <ul className="mt-2 flex flex-wrap gap-4">
              {guide.relatedBlogPosts.map((post: any) => (
                <li key={post._id}>
                  <Link href={`/blog/${post.slug}`} className="text-[#0F6E56] underline">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
