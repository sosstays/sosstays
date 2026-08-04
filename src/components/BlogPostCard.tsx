import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";

type BlogPost = {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: any;
  publishedAt?: string;
  author?: { name?: string; avatar?: any };
  tags?: string[];
};

const dateFormatter = new Intl.DateTimeFormat("en-IE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Same card shape as AreaGuideCard, but the footer swaps the "Explore →"
// link for the post's byline, since a blog card's equivalent
// call-to-action is "who wrote this" rather than "go here".
export function BlogPostCard({ post, fallbackAuthorName }: { post: BlogPost; fallbackAuthorName: string }) {
  const authorName = post.author?.name || fallbackAuthorName;
  const primaryTag = post.tags?.[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block overflow-hidden rounded-[10px] border border-sage-grey/40 bg-light-forest-green"
    >
      {post.coverImage ? (
        <div className="relative h-40">
          <Image
            src={urlFor(post.coverImage).width(500).height(320).url()}
            alt={post.coverImage.alt ?? post.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-40 bg-light-sage/25" />
      )}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2.5 text-xs text-near-black/60">
          {primaryTag && (
            <span className="rounded-full bg-cream px-2.5 py-1 font-semibold text-forest-green">
              {primaryTag}
            </span>
          )}
          {post.publishedAt && <span>{dateFormatter.format(new Date(post.publishedAt))}</span>}
        </div>

        <h3 className="mb-2 font-serif text-lg font-bold text-forest-green">{post.title}</h3>

        {post.excerpt && (
          <p className="mb-3 text-sm leading-relaxed text-near-black/70">{post.excerpt}</p>
        )}

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
      </div>
    </Link>
  );
}
