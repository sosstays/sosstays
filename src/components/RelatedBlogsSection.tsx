import { ImageOverlayCard } from "@/components/ImageOverlayCard";
import { Eyebrow } from "@/components/Eyebrow";

type RelatedBlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: { alt?: string } & Record<string, unknown>;
};

const THEMES = {
  cream: { section: "", heading: "text-forest-green", eyebrowTone: "neutral" as const },
  maroon: { section: "bg-maroon", heading: "text-cream", eyebrowTone: "sage" as const },
};

// Page-end version of the blog post page's sidebar "Related blogs" list —
// the same full-bleed photo card as the blog index's featured post, laid
// out as a row for pages (pricing, landlords) that aren't a blog post.
export function RelatedBlogsSection({
  posts,
  eyebrow = "From the blog",
  heading = "Worth a read",
  theme = "cream",
  cardOverlayColor,
}: {
  posts: RelatedBlogPost[];
  eyebrow?: string;
  heading?: string;
  /** Matches the section to a maroon-themed page instead of the default cream. */
  theme?: keyof typeof THEMES;
  /** Overrides ImageOverlayCard's default forest-green photo tint, e.g. "var(--maroon)" for a maroon-themed page. */
  cardOverlayColor?: string;
}) {
  if (!posts || posts.length === 0) return null;

  const t = THEMES[theme];

  return (
    <section className={`px-8 py-24 sm:px-14 sm:py-28 ${t.section}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <Eyebrow className="mb-2.5" tone={t.eyebrowTone}>{eyebrow}</Eyebrow>
          <h2 className={`font-serif text-3xl font-bold tracking-tight sm:text-4xl ${t.heading}`}>
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
              heightClassName="h-[380px]"
              overlayColor={cardOverlayColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
