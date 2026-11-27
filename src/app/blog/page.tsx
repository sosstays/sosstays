import Link from "next/link";
import { client } from "@/sanity/client";
import { BLOG_POSTS_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { JsonLd, buildBlogSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { BlogSearchGrid } from "@/components/BlogSearchGrid";
import { ImageOverlayCard } from "@/components/ImageOverlayCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { BespokeTripCta } from "@/components/BespokeTripCta";
import { SidebarPromoCard } from "@/components/SidebarPromoCard";
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
  const [allPosts, siteSettings, siteNavLinks] = await Promise.all([
    client.fetch(BLOG_POSTS_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
    getGuestSiteNavLinks(),
  ]);
  const fallbackAuthorName = siteSettings?.siteName || "Sos Stays";
  const posts = tag
    ? allPosts.filter((post: any) => post.tags?.includes(tag))
    : allPosts;

  // Sanity's `featured` flag wins when set; otherwise the most recently
  // published post (posts are already ordered by publishedAt desc) is
  // featured by default — the page never ships without a "start here" pick.
  const featuredPost = posts.find((post: any) => post.featured) ?? posts[0];
  const gridPosts = featuredPost ? posts.filter((post: any) => post._id !== featuredPost._id) : posts;

  return (
    <>
      <JsonLd data={buildBlogSchema(allPosts)} />
      <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" sticky />
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

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              {featuredPost && (
                <Reveal delay={140} className="mb-10">
                  <ImageOverlayCard
                    title={featuredPost.title}
                    description={featuredPost.excerpt ?? undefined}
                    image={featuredPost.coverImage}
                    href={`/blog/${featuredPost.slug}`}
                    tag="Featured"
                    heightClassName="h-[340px] sm:h-[420px]"
                  />
                </Reveal>
              )}

              <Reveal delay={200}>
                <BlogSearchGrid posts={gridPosts} fallbackAuthorName={fallbackAuthorName} />
              </Reveal>

              {posts.length === 0 && (
                <p className="text-[#555550]">No posts yet — check back soon.</p>
              )}
            </div>

            <aside className="flex h-fit flex-col gap-6 lg:sticky lg:top-24">
              <Reveal delay={100} className="rounded-[14px] border border-sage-grey/40 bg-pale-sage/30 p-6">
                <NewsletterSignup />
              </Reveal>

              <Reveal delay={150}>
                <SidebarPromoCard
                  heading="Give the gift of a getaway"
                  text="Build a voucher around a stay, an experience or just an amount — redeemable on any Sos Stays property."
                  primaryHref="/gift-maker"
                  primaryLabel="Build a gift"
                />
              </Reveal>

              <Reveal delay={200}>
                <BespokeTripCta variant="compact" />
              </Reveal>

              <Reveal delay={250}>
                <SidebarPromoCard
                  heading="Run a local business?"
                  text="Cleaners, photographers, tour operators and more — get featured in front of every Sos Stays guest."
                  primaryHref="/partners"
                  primaryLabel="Become a partner"
                />
              </Reveal>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
