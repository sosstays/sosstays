import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";

type ImageOverlayCardProps = {
  title: string;
  description?: string;
  image?: any;
  href?: string;
  /** Opens `href` in a new tab (for external links) instead of navigating in-app. */
  external?: boolean;
  tag?: string;
  /** Tailwind height class for the card. Defaults to the landing-page template's size. */
  heightClassName?: string;
  /** Any CSS color for the bottom-up shadow that keeps the title/description
   *  readable over the photo. Defaults to the brand forest green. */
  overlayColor?: string;
};

const DEFAULT_OVERLAY_COLOR = "var(--forest-green)";

// Full-bleed photo card with a dark gradient overlay and the title/
// description set directly on the image. Originally built inline for
// the landing-page template's "While you're in the area" section (see
// web/src/app/[slug]/page.tsx) and extracted here so the area guide's
// Things To Do grid (ThingsToDoTabs) can share the exact same look
// instead of its own plainer card.
export function ImageOverlayCard({
  title,
  description,
  image,
  href,
  external,
  tag,
  heightClassName = "h-[380px]",
  overlayColor = DEFAULT_OVERLAY_COLOR,
}: ImageOverlayCardProps) {
  const content = (
    <>
      {image && (
        <Image
          src={urlFor(image).width(800).height(1000).url()}
          alt={image.alt ?? title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, color-mix(in srgb, ${overlayColor} 94%, transparent) 0%, color-mix(in srgb, ${overlayColor} 55%, transparent) 38%, transparent 72%)`,
        }}
      />
      <div className="absolute right-6.5 bottom-6 left-6.5">
        {tag && (
          <span className="mb-2 inline-block rounded-full bg-cream/18 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-cream uppercase backdrop-blur-sm">
            {tag}
          </span>
        )}
        <h3 className="font-serif text-xl font-bold text-cream">{title}</h3>
        {description && <p className="mt-2 text-sm leading-relaxed text-cream/82">{description}</p>}
      </div>
    </>
  );

  const className = `group relative block ${heightClassName} overflow-hidden rounded-[18px] bg-deep-forest`;

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
