import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { Eyebrow } from "@/components/Eyebrow";
import { PromoTile, type Promo } from "@/components/PromoGrid";

type BlogImage = { alt?: string } & Record<string, unknown>;

export type HomeBlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: BlogImage | null;
};

export type HomeBlogData = {
  featured?: HomeBlogPost | null;
  recent?: HomeBlogPost[] | null;
} | null;

// Large tile on the left (the featured post) with the two most recent posts
// stacked on the right — same tile, scrim and hover motion as the homepage
// PromoGrid, just fed from blog posts instead of hand-entered promos. If no
// post is marked featured, the newest post takes the big slot.
const SLOT_CLASS = [
  "sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:col-start-1 lg:row-start-1",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-3 lg:row-start-2",
];

function toPromo(post: HomeBlogPost, badge: string): Promo {
  return {
    _key: post._id,
    title: post.title,
    subtitle: post.excerpt,
    link: `/blog/${post.slug}`,
    image: post.coverImage,
    badge,
    cta: "Read the post",
  };
}

export function HomeBlogGrid({ data }: { data: HomeBlogData }) {
  const recent = data?.recent ?? [];
  const featured = data?.featured ?? recent[0] ?? null;
  if (!featured) return null;
  const latest = recent.filter((post) => post._id !== featured._id).slice(0, 2);

  const tiles: { promo: Promo; shape: "large" | "standard" }[] = [
    { promo: toPromo(featured, "Featured"), shape: "large" },
    ...latest.map((post) => ({ promo: toPromo(post, "Latest"), shape: "standard" as const })),
  ];

  return (
    <section aria-label="From the blog" className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow className="mb-2" delay={0}>
            From the blog
          </Eyebrow>
          <Reveal as="h2" delay={100} className="font-serif text-3xl font-bold tracking-tight text-forest-green sm:text-4xl">
            Stories, guides and good ideas
          </Reveal>
        </div>
        <Reveal delay={200}>
          <Button link="/blog" variant="primary" size="custom" className="px-7 py-3.5 text-[15px] font-semibold">
            Read the blog
          </Button>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[200px]">
        {tiles.map(({ promo, shape }, i) => (
          <Reveal key={promo._key} delay={150 + i * 120} className={SLOT_CLASS[i]}>
            <PromoTile promo={promo} shape={shape} dense />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
