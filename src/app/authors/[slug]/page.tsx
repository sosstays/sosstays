import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { AUTHOR_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { JsonLd, buildBreadcrumbSchema, buildPersonSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { BlogPostListItem, type BlogPostListItemPost } from "@/components/BlogPostListItem";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await client.fetch(AUTHOR_QUERY, { slug });
  if (!author) return {};
  return buildMetadata(
    {
      title: `${author.name}${author.role ? `, ${author.role}` : ""} | Sos Stays`,
      description: author.bio || `Articles by ${author.name} on the Sos Stays blog.`,
      image: author.photo?.asset ? author.photo : undefined,
      imageAlt: author.photo?.alt || author.name,
    },
    `/authors/${slug}`
  );
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const [author, siteNavLinks] = await Promise.all([
    client.fetch(AUTHOR_QUERY, { slug }),
    getGuestSiteNavLinks(),
  ]);
  if (!author) notFound();

  const posts: BlogPostListItemPost[] = author.posts ?? [];
  const profileLinks: string[] = (author.sameAs ?? []).filter(Boolean);

  return (
    <>
      <JsonLd data={buildPersonSchema(author)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: author.name, url: `${SITE_URL}/authors/${slug}` },
        ])}
      />
      <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" sticky />

      <main className="bg-cream font-sans text-near-black">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 pt-10 text-[13px] text-near-black/60 sm:px-8">
          <Link href="/" className="hover:text-forest-green">Home</Link>
          <span>·</span>
          <Link href="/blog" className="hover:text-forest-green">Blog</Link>
        </div>

        <header className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-6 sm:flex-row sm:items-center sm:px-8">
          {author.photo?.asset && (
            <div className="relative h-28 w-28 flex-none overflow-hidden rounded-full">
              <Image
                src={urlFor(author.photo).width(224).height(224).url()}
                alt={author.photo.alt || author.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <div>
            <Reveal as="h1" className="font-serif text-4xl leading-[1.05] font-bold tracking-tight text-forest-green">
              {author.name}
            </Reveal>
            {author.role && <p className="mt-2 text-[15px] text-near-black/60">{author.role}</p>}
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 pt-8 pb-24 sm:px-8">
          {author.bio && (
            <p className="text-lg leading-relaxed whitespace-pre-line text-[#1C1C1C]">{author.bio}</p>
          )}

          {profileLinks.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
              {profileLinks.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="font-medium text-forest-green underline underline-offset-2"
                  >
                    {new URL(url).hostname.replace(/^www\./, "")}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-14 mb-6 font-serif text-2xl font-semibold tracking-tight text-forest-green">
            Posts by {author.name}
          </h2>
          {posts.length > 0 ? (
            <div className="flex flex-col gap-5">
              {posts.map((post) => (
                <BlogPostListItem key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-near-black/60">No posts yet.</p>
          )}
        </div>
      </main>
    </>
  );
}
