import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { BLOG_POST_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { JsonLd, buildArticleSchema, buildBreadcrumbSchema } from "@/sanity/jsonld";
import { blogBodyComponents } from "@/sanity/portableText";
import { estimateReadingTime } from "@/sanity/readingTime";
import { HeroNav } from "@/components/HeroNav";
import { Button } from "@/components/Button";
import { SocialIcons } from "@/components/SocialIcons";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

const dateFormatter = new Intl.DateTimeFormat("en-IE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(BLOG_POST_QUERY, { slug });
  if (!post) return {};
  return buildMetadata(post.seo, `/blog/${slug}`);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, siteSettings] = await Promise.all([
    client.fetch(BLOG_POST_QUERY, { slug }),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);
  if (!post) notFound();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${slug}` },
  ]);

  const authorName = post.author?.name || siteSettings?.businessName || "Sos Stays";
  const readingTime = estimateReadingTime(post.body);
  const primaryTag: string | undefined = post.tags?.[0];
  const relatedPosts = (post.relatedPosts ?? []).filter((p: any) => p.coverImage || p.title);

  return (
    <>
      <JsonLd data={buildArticleSchema(post, siteSettings)} />
      <JsonLd data={breadcrumbSchema} />
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />

      <main className="bg-cream font-sans text-near-black">
        {/* BREADCRUMB */}
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 pt-10 text-[13px] text-near-black/60 sm:px-8">
          <Link href="/" className="hover:text-forest-green">Home</Link>
          <span>·</span>
          <Link href="/blog" className="hover:text-forest-green">Blog</Link>
          {primaryTag && (
            <>
              <span>·</span>
              <span className="font-medium text-forest-green">{primaryTag}</span>
            </>
          )}
        </div>

        {/* HEADER */}
        <header className="mx-auto max-w-6xl px-4 pt-5 sm:px-8">
          <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] font-bold tracking-tight text-[#1C1C1C] sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-near-black/60">
            <div className="flex items-center gap-2.5">
              {post.author?.avatar ? (
                <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full">
                  <Image
                    src={urlFor(post.author.avatar).width(64).height(64).url()}
                    alt={post.author.avatar.alt || authorName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-light-forest-green text-xs font-semibold text-forest-green">
                  {authorName.charAt(0)}
                </div>
              )}
              <span className="font-medium text-[#1C1C1C]">{authorName}</span>
            </div>
            {primaryTag && (
              <span className="rounded-full bg-light-forest-green px-3.5 py-1.5 text-xs font-semibold text-forest-green">
                {primaryTag}
              </span>
            )}
            <span>{readingTime} min read</span>
            {post.publishedAt && <span>{dateFormatter.format(new Date(post.publishedAt))}</span>}
          </div>
        </header>

        {/* TWO-COLUMN LAYOUT */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pt-9 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          {/* LEFT: hero + body */}
          <div className="min-w-0">
            {post.coverImage && (
              <div className="relative mb-11 aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src={urlFor(post.coverImage).width(1200).height(675).url()}
                  alt={post.coverImage.alt || post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <article className="max-w-none">
              <PortableText value={post.body} components={blogBodyComponents} />
            </article>

            {/* AUTHOR BYLINE */}
            <div className="mt-14 flex items-center gap-3.5 border-t border-sage-grey/30 pt-7">
              {post.author?.avatar ? (
                <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full">
                  <Image
                    src={urlFor(post.author.avatar).width(96).height(96).url()}
                    alt={post.author.avatar.alt || authorName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-light-forest-green text-sm font-semibold text-forest-green">
                  {authorName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[#1C1C1C]">Written by {authorName}</p>
                {post.author?.role && (
                  <p className="text-[13px] text-near-black/60">{post.author.role}</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: sidebar */}
          <aside className="h-fit rounded-lg bg-light-forest-green p-7 lg:sticky lg:top-24">
            {siteSettings?.socialLinks?.length > 0 && (
              <div className="mb-9">
                <p className="mb-4 text-[13px] font-semibold text-forest-green">Share on social media</p>
                <SocialIcons
                  links={siteSettings.socialLinks}
                  className="bg-cream text-forest-green hover:bg-forest-green hover:text-cream"
                />
              </div>
            )}

            <div className="mb-9 border-t border-sage-grey/30 pt-7 first:border-0 first:pt-0">
              <NewsletterSignup />
            </div>

            {post.tags?.length > 0 && (
              <div className="mb-9">
                <p className="mb-4 text-[13px] font-semibold text-forest-green">All tags</p>
                <div className="flex flex-wrap gap-2.5">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-cream px-3.5 py-2 text-xs font-medium text-[#1C1C1C]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {relatedPosts.length > 0 && (
              <div className="mb-9 last:mb-0">
                <p className="mb-4 text-[13px] font-semibold text-forest-green">Related blogs</p>
                <div className="flex flex-col gap-4">
                  {relatedPosts.map((related: any) => (
                    <Link
                      key={related._id}
                      href={`/blog/${related.slug}`}
                      className="group flex gap-3"
                    >
                      {related.coverImage ? (
                        <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg">
                          <Image
                            src={urlFor(related.coverImage).width(128).height(128).url()}
                            alt={related.coverImage.alt || related.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 flex-none rounded-lg bg-cream" />
                      )}
                      <div className="min-w-0">
                        {related.publishedAt && (
                          <p className="mb-1.5 text-[11px] text-near-black/50">
                            {dateFormatter.format(new Date(related.publishedAt))}
                          </p>
                        )}
                        <p className="text-[13px] leading-snug font-semibold text-[#1C1C1C] group-hover:text-forest-green">
                          {related.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {post.relatedAreaGuides?.length > 0 && (
              <div>
                <p className="mb-4 text-[13px] font-semibold text-forest-green">Explore more</p>
                <ul className="flex flex-col gap-2.5">
                  {post.relatedAreaGuides.map((guide: any) => (
                    <li key={guide._id}>
                      <Link
                        href={`/areas/${guide.slug}`}
                        className="text-[13px] font-medium text-forest-green underline underline-offset-2"
                      >
                        {guide.areaName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* LANDLORD CTA — maroon per the owner-context accent color */}
        <section className="mt-24 bg-maroon px-8 py-28 text-center sm:px-14">
          <div className="mx-auto max-w-xl">
            <p className="mb-4 text-xs font-medium tracking-widest text-light-sage uppercase">
              For landlords
            </p>
            <h2 className="mb-5 font-serif text-4xl leading-tight font-bold tracking-tight text-cream sm:text-5xl">
              Got a place worth minding?
            </h2>
            <p className="mb-9 text-lg leading-relaxed text-cream/85">
              Send your SOS. We&apos;ll sort the stay — guests, calendar, cleaning, the lot.
            </p>
            <Button link="/landlords" variant="secondary" color="cream" animateColor="maroon">
              Talk to us
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
