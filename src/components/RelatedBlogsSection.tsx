import { BlogPostListItem, type BlogPostListItemPost } from "@/components/BlogPostListItem";

// Page-end version of the blog post page's sidebar "Related blogs" list —
// same row item, laid out as a row across the page instead of stacked in a
// narrow column, for pages (pricing, landlords) that aren't a blog post.
export function RelatedBlogsSection({
  posts,
  eyebrow = "From the blog",
  heading = "Worth a read",
}: {
  posts: BlogPostListItemPost[];
  eyebrow?: string;
  heading?: string;
}) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
      <div className="mb-10 text-center">
        <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">{eyebrow}</p>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
          {heading}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-3">
        {posts.map((post) => (
          <BlogPostListItem key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
