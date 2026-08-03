import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { AREA_GUIDE_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import {
  JsonLd,
  buildAreaGuideSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { ThingsToDoTabs } from "@/components/ThingsToDoTabs";
import { PropertyCard } from "@/components/PropertyCard";
import { FaqSection } from "@/components/FaqSection";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await client.fetch(AREA_GUIDE_QUERY, { slug });
  if (!guide) return {};
  return buildMetadata(guide.seo, `/areas/${slug}`);
}

export default async function AreaGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await client.fetch(AREA_GUIDE_QUERY, { slug });
  if (!guide) notFound();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Areas", url: `${SITE_URL}/areas` },
    { name: guide.areaName, url: `${SITE_URL}/areas/${slug}` },
  ]);
  const faqSchema = buildFaqSchema(guide.faqs);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={buildAreaGuideSchema(guide)} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* HERO */}
      <section className="relative h-[56vh] min-h-[460px] w-full bg-forest-green">
        {guide.heroImage && (
          <Image
            src={urlFor(guide.heroImage).width(1800).height(1200).url()}
            alt={guide.heroImage.alt ?? guide.areaName}
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center 42%" }}
          />
        )}
        <div className="absolute inset-0 bg-forest-green/30" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-b from-forest-green/0 to-forest-green/60" />

        <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" />

        <div className="absolute inset-x-8 bottom-11 text-center sm:inset-x-14 sm:text-left">
          <p className="mb-3.5 text-xs font-medium tracking-widest text-light-sage uppercase">
            Areas / {guide.areaName}
          </p>
          <h1 className="font-serif text-4xl leading-[1.08] font-extrabold tracking-tight text-cream sm:text-6xl">
            {guide.areaName}
          </h1>
        </div>
      </section>

      {/* INTRO */}
      {guide.introduction && (
        <section className="mx-auto max-w-6xl px-8 pt-16 pb-2 sm:px-14">
          <div className="prose prose-neutral max-w-[640px] text-lg leading-[1.65] text-near-black [&_p]:m-0">
            <PortableText value={guide.introduction} />
          </div>
        </section>
      )}

      {/* THINGS TO DO */}
      {guide.thingsToDo?.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pt-14 pb-5 sm:px-14">
          <h2 className="mb-2 font-serif text-[26px] font-bold tracking-tight text-forest-green">
            A few things worth knowing
          </h2>
          <p className="mb-7 text-sm text-near-black/60">
            Grouped the way we&apos;d tell a friend, not the way a brochure would.
          </p>
          <ThingsToDoTabs items={guide.thingsToDo} />
        </section>
      )}

      {/* MAP + GETTING HERE */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-8 py-14 sm:px-14 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-h-[320px] overflow-hidden rounded-[10px] border border-sage-grey/40">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              `${guide.areaName}, Ireland`
            )}&output=embed`}
            className="h-full min-h-[320px] w-full border-0"
            loading="lazy"
          />
        </div>
        {guide.travelNotes?.length > 0 && (
          <div>
            <h3 className="mb-4 font-serif text-lg font-bold text-forest-green">
              Getting here
            </h3>
            <div className="flex flex-col gap-3.5">
              {guide.travelNotes.map((note: any, i: number) => (
                <p key={i} className="text-sm text-near-black">
                  <strong>{note.label}</strong> — {note.description}
                </p>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* STAYS IN THIS AREA */}
      {guide.featuredProperties?.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pt-5 pb-20 sm:px-14">
          <h2 className="mb-6 font-serif text-[26px] font-bold tracking-tight text-forest-green">
            Stay here
          </h2>
          <div className="flex flex-col gap-6">
            {guide.featuredProperties.map((property: any) => (
              <PropertyCard
                key={property._id}
                slug={property.slug}
                name={property.name}
                location={property.location}
                shortDescription={property.shortDescription}
                sleeps={property.sleeps}
                coverImage={property.coverImage}
                gallery={property.gallery}
                surface="framed"
              />
            ))}
          </div>
        </section>
      )}

      <FaqSection heading="A few questions people ask" items={guide.faqs} maxWidth="72rem" />

      {/* RELATED BLOG POSTS */}
      {guide.relatedBlogPosts?.length > 0 && (
        <section className="mx-auto max-w-6xl border-t border-sage-grey/40 px-8 py-10 sm:px-14">
          <p className="text-sm font-medium text-near-black/60">Read more</p>
          <ul className="mt-3 flex flex-wrap gap-5">
            {guide.relatedBlogPosts.map((post: any) => (
              <li key={post._id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-forest-green underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
