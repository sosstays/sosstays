import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { MediaCard } from "@/components/MediaCard";

type BlogPost = {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: any;
  publishedAt?: string;
  author?: { name?: string; avatar?: any } | null;
  tags?: string[] | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-IE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Same card shape as AreaGuideCard (see MediaCard), but the footer swaps
// the "Explore →" link for the post's byline, since a blog card's
// equivalent call-to-action is "who wrote this" rather than "go here".
export function BlogPostCard({ post, fallbackAuthorName }: { post: BlogPost; fallbackAuthorName: string }) {
  const authorName = post.author?.name || fallbackAuthorName;
  const primaryTag = post.tags?.[0];

  return (
    <MediaCard
      href={`/blog/${post.slug}`}
      image={post.coverImage}
      imageAlt={post.coverImage?.alt ?? post.title}
      title={post.title}
      header={
        (primaryTag || post.publishedAt) && (
          <div className="mb-2 flex items-center gap-2.5 text-xs text-near-black/60">
            {primaryTag && (
              <span className="rounded-full bg-cream px-2.5 py-1 font-semibold text-forest-green">
                {primaryTag}
              </span>
            )}
            {post.publishedAt && <span>{dateFormatter.format(new Date(post.publishedAt))}</span>}
          </div>
        )
      }
      body={
        post.excerpt && <p className="mb-3 text-sm leading-relaxed text-near-black/70">{post.excerpt}</p>
      }
      footer={
        <div className="flex items-center gap-2.5">
          {post.author?.avatar ? (
            <div className="relative h-7 w-7 flex-none overflow-hidden rounded-full">
              <Image
                src={urlFor(post.author.avatar).width(56).height(56).url()}
                alt={post.author.avatar.alt || authorName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-cream text-xs font-semibold text-forest-green">
              {authorName.charAt(0)}
            </div>
          )}
          <span className="text-sm font-semibold text-forest-green">{authorName}</span>
        </div>
      }
    />
  );
}
