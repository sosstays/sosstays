import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";
import { LogoRow } from "@/components/LogoRow";

type SanityImage = { alt?: string | null } & Record<string, unknown>;

export type Initiative = {
  _key?: string;
  title: string;
  tagline?: string | null;
  tagLabel?: string | null;
  image?: SanityImage | null;
  href?: string | null;
};

// The loud brand space after the footer on every page: the logo set in a
// single row across the full width, then the "partner initiatives" tiles
// (two per row). The tiles come from the Sanity "homePage" singleton and
// are their own list — not the Partners directory. With none set, only the
// logo shows.
//
// Bottom padding leaves room for the fixed bottom menu (HomeDock), so the
// last row of tiles is never hidden behind it.
export function HomeBrandBand({
  heading,
  initiatives,
}: {
  heading?: string | null;
  initiatives: Initiative[];
}) {
  const tiles = initiatives.filter((item) => item.title && item.image);

  return (
    <div className="bg-maroon px-8 pt-16 pb-28 font-sans text-cream sm:px-14 sm:pt-24 sm:pb-32">
      <div className="mx-auto max-w-6xl">
        <LogoRow className="h-auto w-full text-cream" />

        {tiles.length > 0 && (
          <section aria-label={heading || "Partner initiatives"} className="mt-12 sm:mt-16">
            <p className="mb-5 text-xs font-semibold tracking-widest text-light-sage uppercase">
              {heading || "Partner initiatives"}
            </p>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {tiles.map((item) => {
                const body = (
                  <>
                    <Image
                      src={urlFor(item.image!).width(1100).height(620).url()}
                      alt={item.image?.alt ?? ""}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-b from-maroon/15 via-maroon/20 to-[#321e21]/85" />
                    <span className="absolute top-4 left-4 rounded-full bg-cream px-3.5 py-1 text-xs font-medium text-maroon">
                      {item.tagLabel || "Partner initiative"}
                    </span>
                    <span className="relative z-10 block p-6 text-center">
                      {item.tagline && <span className="block text-[13px] text-cream/85">{item.tagline}</span>}
                      <span className="mt-0.5 block font-serif text-2xl leading-tight font-bold sm:text-[28px]">
                        {item.title}
                      </span>
                    </span>
                  </>
                );
                const className =
                  "group relative flex min-h-[220px] items-end justify-center overflow-hidden rounded-[22px] bg-deep-forest sm:min-h-[290px]";
                const href = item.href?.trim();
                return (
                  <li key={item._key ?? item.title}>
                    {!href ? (
                      <div className={className}>{body}</div>
                    ) : /^https?:\/\//.test(href) ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                        {body}
                      </a>
                    ) : (
                      <Link href={href} className={className}>
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
