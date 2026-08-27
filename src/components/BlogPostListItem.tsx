import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";

const dateFormatter = new Intl.DateTimeFormat("en-IE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export type BlogPostListItemPost = {
  _id: string;
  title: string;
  slug: string;
  coverImage?: { alt?: string } & Record<string, unknown>;
  publishedAt?: string | null;
};

// The compact thumbnail + title + date row used for "Related blogs" lists —
// originally the blog post page's sidebar, also used by RelatedBlogsSection.
export function BlogPostListItem({ post }: { post: BlogPostListItemPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex gap-3">
      {post.coverImage ? (
        <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg">
          <Image
            src={urlFor(post.coverImage).width(128).height(128).url()}
            alt={post.coverImage.alt || post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-16 w-16 flex-none rounded-lg bg-cream" />
      )}
      <div className="min-w-0">
        {post.publishedAt && (
          <p className="mb-1.5 text-[11px] text-near-black/50">
            {dateFormatter.format(new Date(post.publishedAt))}
          </p>
        )}
        <p className="text-[13px] leading-snug font-semibold text-[#1C1C1C] group-hover:text-forest-green">
          {post.title}
        </p>
      </div>
    </Link>
  );
}
