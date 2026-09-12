import Link from "next/link";
import { client } from "@/sanity/client";
import { BLOG_POSTS_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { BlogPostCard } from "@/components/BlogPostCard";
import { Reveal } from "@/components/Reveal";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(
    {
      title: "Blog | Sos Stays",
      description: "Stories, guides, and inspiration for your next break in Louth, Meath, and the Mournes.",
    },
    "/blog",
  );
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [allPosts, siteSettings] = await Promise.all([
    client.fetch(BLOG_POSTS_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);
  const fallbackAuthorName = siteSettings?.businessName || "Sos Stays";
  const posts = tag
    ? allPosts.filter((post: any) => post.tags?.includes(tag))
    : allPosts;

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <Reveal as="h1" className="font-serif text-4xl font-semibold text-forest-green">The Blog</Reveal>
          <Reveal as="p" delay={120} className="mt-2 text-[#555550]">
            {tag ? (
              <>
                Posts tagged &ldquo;{tag}&rdquo; —{" "}
                <Link href="/blog" className="underline">
                  view all posts
                </Link>
              </>
            ) : (
              "Stories, guides, and inspiration for your next break."
            )}
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any, i: number) => (
              <Reveal key={post._id} delay={Math.min(i, 5) * 90}>
                <BlogPostCard post={post} fallbackAuthorName={fallbackAuthorName} />
              </Reveal>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="mt-8 text-[#555550]">No posts yet — check back soon.</p>
          )}
        </div>
      </main>
    </>
  );
}
