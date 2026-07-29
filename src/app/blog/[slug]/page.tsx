import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { BLOG_POST_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(BLOG_POST_QUERY, { slug });
  if (!post) return {};
  return buildMetadata(post.seo, `/blog/${slug}`);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await client.fetch(BLOG_POST_QUERY, { slug });
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-semibold text-[#1C1C1C]">{post.title}</h1>
      <p className="mt-2 text-sm text-[#555550]">
        {new Date(post.publishedAt).toLocaleDateString("en-IE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {post.coverImage && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={urlFor(post.coverImage).width(1200).height(675).url()}
            alt={post.coverImage.alt || post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-neutral mt-8 max-w-none">
        <PortableText value={post.body} />
      </div>

      {post.relatedAreaGuides?.length > 0 && (
        <div className="mt-10 border-t border-[#E2E2DC] pt-6">
          <p className="text-sm font-medium text-[#555550]">Explore more</p>
          <ul className="mt-2 flex flex-wrap gap-4">
            {post.relatedAreaGuides.map((guide: any) => (
              <li key={guide._id}>
                <Link href={`/areas/${guide.slug}`} className="text-[#0F6E56] underline">
                  {guide.areaName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
