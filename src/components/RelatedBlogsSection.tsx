import { ImageOverlayCard } from "@/components/ImageOverlayCard";
import { Eyebrow } from "@/components/Eyebrow";

type RelatedBlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: { alt?: string } & Record<string, unknown>;
};

// Page-end version of the blog post page's sidebar "Related blogs" list —
// the same full-bleed photo card as the blog index's featured post, laid
// out as a row for pages (pricing, landlords) that aren't a blog post.
export function RelatedBlogsSection({
  posts,
  eyebrow = "From the blog",
  heading = "Worth a read",
  cardOverlayColor,
}: {
  posts: RelatedBlogPost[];
  eyebrow?: string;
  heading?: string;
  /** Overrides ImageOverlayCard's default forest-green photo tint, e.g. "var(--maroon)" for a maroon-themed page. */
  cardOverlayColor?: string;
}) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
      <div className="mb-10 text-center">
        <Eyebrow className="mb-2.5">{eyebrow}</Eyebrow>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
          {heading}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-3">
        {posts.map((post) => (
          <ImageOverlayCard
            key={post._id}
            title={post.title}
            description={post.excerpt ?? undefined}
            image={post.coverImage}
            href={`/blog/${post.slug}`}
            tag="Featured"
            heightClassName="h-[380px]"
            overlayColor={cardOverlayColor}
          />
        ))}
      </div>
    </section>
  );
}
