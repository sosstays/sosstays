import { client } from "@/sanity/client";
import { BLOG_POSTS_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { BlogPostCard } from "@/components/BlogPostCard";

export const revalidate = 60;

export const metadata = {
  title: "Blog | Sos Stays",
  description: "Stories, guides, and inspiration for your next break in Louth, Meath, and the Mournes.",
};

export default async function BlogIndexPage() {
  const [posts, siteSettings] = await Promise.all([
    client.fetch(BLOG_POSTS_QUERY),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);
  const fallbackAuthorName = siteSettings?.businessName || "Sos Stays";

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <h1 className="font-serif text-4xl font-semibold text-forest-green">The Blog</h1>
          <p className="mt-2 text-[#555550]">
            Stories, guides, and inspiration for your next break.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <BlogPostCard key={post._id} post={post} fallbackAuthorName={fallbackAuthorName} />
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
