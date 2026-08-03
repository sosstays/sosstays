import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { BLOG_POSTS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";

export const revalidate = 60;

export const metadata = {
  title: "Blog | Sos Stays",
  description: "Stories, guides, and inspiration for your next break in Louth, Meath, and the Mournes.",
};

export default async function BlogIndexPage() {
  const posts = await client.fetch(BLOG_POSTS_QUERY);

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold text-[#1C1C1C]">The Blog</h1>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="group block">
              {post.coverImage && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={urlFor(post.coverImage).width(600).height(450).url()}
                    alt={post.coverImage.alt || post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <h2 className="mt-3 font-serif text-xl font-semibold text-[#1C1C1C]">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-1 text-sm text-[#555550]">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <p className="mt-8 text-[#555550]">No posts yet — check back soon.</p>
        )}
      </main>
    </>
  );
}
