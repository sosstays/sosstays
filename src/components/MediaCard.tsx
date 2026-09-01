import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { urlFor } from "@/sanity/image";

type SanityImageWithAlt = { alt?: string } & Record<string, unknown>;

// Shared shape behind AreaGuideCard and BlogPostCard — same border/radius/
// image-tile/title styling, differing only in what sits above the title
// (nothing vs. a tag+date row) and below it (an "Explore →" link vs. an
// author byline). Each caller supplies those bits via header/body/footer
// rather than this component knowing about areas or blog posts itself.
export function MediaCard({
  href,
  image,
  imageAlt,
  header,
  title,
  body,
  footer,
}: {
  href: string;
  image?: SanityImageWithAlt | null;
  imageAlt: string;
  header?: ReactNode;
  title: string;
  body?: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-[10px] border border-sage-grey/40 bg-light-forest-green"
    >
      {image ? (
        <div className="relative h-40">
          <Image src={urlFor(image).width(500).height(320).url()} alt={imageAlt} fill className="object-cover" />
        </div>
      ) : (
        <div className="h-40 bg-light-sage/25" />
      )}
      <div className="p-5">
        {header}
        <h3 className="mb-2 font-serif text-lg font-bold text-forest-green">{title}</h3>
        {body}
        {footer}
      </div>
    </Link>
  );
}
