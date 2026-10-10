import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";
import { Reveal } from "@/components/Reveal";

type PromoImage = { alt?: string } & Record<string, unknown>;

export type Promo = {
  _key: string;
  title?: string | null;
  subtitle?: string | null;
  link?: string | null;
  image?: PromoImage | null;
  /** Small pill above the title (e.g. "Featured"). */
  badge?: string | null;
  /** Hover-reveal call to action at the bottom of the tile (e.g. "Read the post"). */
  cta?: string | null;
};

export type PromoGridData = {
  heading?: string | null;
  note?: string | null;
  promos?: Promo[] | null;
} | null;

// The editor fills up to five slots in order (see the promoGrid schema):
// 1 = large tile, 2 = right column top, 3 = tall tile filling the rest of
// the right column, 4–5 = bottom row. On lg+ each slot gets a fixed place in
// a 3-column grid; on smaller screens the tiles just flow. Slots with no
// promo render as grey "more on the way" placeholders.
const SLOT_CLASS = [
  "lg:col-span-2 lg:row-span-2 lg:col-start-1 lg:row-start-1",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-3 lg:row-start-2 lg:row-span-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-2 lg:row-start-3",
];

export type PromoShape = "large" | "tall" | "standard";

// `dense` is for tiles fed by long, user-written copy (blog titles and
// excerpts): a heavier scrim and tighter type keep the text readable over
// busy photos and inside the fixed-height grid rows.
export function PromoTile({
  promo,
  shape,
  dense = false,
}: {
  promo: Promo;
  shape: PromoShape;
  dense?: boolean;
}) {
  const large = shape === "large";
  const { title, subtitle, link, image, badge, cta } = promo;
  const isLink = Boolean(link);

  const content = (
    <>
      {image && (
        <Image
          src={urlFor(image).width(large ? 1200 : 700).height(large ? 900 : shape === "tall" ? 1000 : 520).url()}
          alt={image.alt ?? ""}
          fill
          sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className={`object-cover ${isLink ? "transition-transform duration-500 ease-out group-hover:scale-105" : ""}`}
        />
      )}
      {/* scrim keeps the text legible on any photo */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          dense ? "from-near-black/85 via-near-black/50 to-near-black/10" : "from-near-black/70 via-near-black/20 to-transparent"
        }`}
      />
      <div className="relative z-10 flex flex-col items-start gap-1.5 p-5 sm:p-6">
        {badge && (
          <span className="mb-1 rounded-full bg-cream/20 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-cream uppercase backdrop-blur-sm">
            {badge}
          </span>
        )}
        {title && (
          <h3
            className={`font-serif leading-tight font-semibold text-cream ${
              large ? (dense ? "text-3xl sm:text-4xl" : "text-3xl sm:text-5xl") : dense ? "line-clamp-3 text-lg sm:text-xl" : "text-xl sm:text-2xl"
            }`}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p className={`text-cream/90 ${large ? (dense ? "line-clamp-2 text-base" : "line-clamp-3 text-base sm:text-lg") : dense ? "hidden sm:line-clamp-1 text-sm" : "line-clamp-2 text-sm"}`}>
            {subtitle}
          </p>
        )}
      </div>
      {cta && isLink && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-near-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      )}
      {cta && isLink && (
        <span className="absolute bottom-5 left-5 z-10 flex translate-y-2 items-center gap-1.5 text-sm font-semibold text-cream opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:left-6">
          {cta}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      )}
    </>
  );

  const base = "relative block h-full min-h-[220px] overflow-hidden lg:min-h-0 rounded-xl bg-forest-green";
  const sizing = large
    ? "min-h-[320px] sm:min-h-[420px] lg:min-h-0"
    : shape === "tall"
      ? "min-h-[360px] lg:min-h-0"
      : "";

  if (!isLink) {
    return <div className={`${base} ${sizing}`}>{content}</div>;
  }

  const interactive = `group cursor-pointer shadow-sm transition-shadow duration-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-green ${base} ${sizing}`;
  return /^https?:\/\//.test(link!) ? (
    <a href={link!} target="_blank" rel="noopener noreferrer" className={interactive}>
      {content}
    </a>
  ) : (
    <Link href={link!} className={interactive}>
      {content}
    </Link>
  );
}

export function PromoGrid({ data }: { data: PromoGridData }) {
  const promos = (data?.promos?.filter((p) => p.image && p.title) ?? []).slice(0, SLOT_CLASS.length);
  if (promos.length === 0) return null;
  const placeholders = SLOT_CLASS.length - promos.length;

  return (
    <section aria-label="Promotions" className="mx-auto max-w-6xl px-8 pt-16 sm:px-14 sm:pt-20">
      {(data?.heading || data?.note) && (
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          {data.heading && (
            <Reveal as="h2" className="font-serif text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
              {data.heading}
            </Reveal>
          )}
          {data.note && (
            <Reveal as="p" delay={150} className="max-w-[380px] text-near-black/60">
              {data.note}
            </Reveal>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[200px]">
        {promos.map((promo, i) => (
          <Reveal
            key={promo._key}
            delay={200 + i * 100}
            className={`${SLOT_CLASS[i]} ${i === 0 ? "sm:col-span-2" : ""}`}
          >
            <PromoTile promo={promo} shape={i === 0 ? "large" : i === 2 ? "tall" : "standard"} />
          </Reveal>
        ))}
        {Array.from({ length: placeholders }, (_, n) => {
          const slot = promos.length + n;
          return (
            <Reveal key={`placeholder-${slot}`} delay={200 + slot * 100} className={SLOT_CLASS[slot]}>
              <div aria-hidden="true" className="h-full min-h-[120px] rounded-xl bg-near-black/10 lg:min-h-0" />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
