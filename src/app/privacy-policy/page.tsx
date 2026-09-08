import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { PRIVACY_POLICY_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { portableTextToMarkdownSource } from "@/sanity/portableText";
import { HeroNav } from "@/components/HeroNav";
import { MarkdownContent } from "@/components/MarkdownContent";
import { getSiteNavLinks } from "@/lib/navLinks";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(PRIVACY_POLICY_QUERY);
  if (!page) return {};
  return buildMetadata(page.seo, "/privacy-policy");
}

export default async function PrivacyPolicyPage() {
  const [page, siteNavLinks] = await Promise.all([
    client.fetch(PRIVACY_POLICY_QUERY),
    getSiteNavLinks(),
  ]);
  if (!page) notFound();

  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="min-h-screen bg-cream font-sans">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-serif text-4xl font-semibold text-near-black">{page.title}</h1>
          {page.lastUpdated && (
            <p className="mt-2 text-sm text-near-black/60">
              Last updated{" "}
              {new Date(page.lastUpdated).toLocaleDateString("en-IE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          <div className="mt-8">
            <MarkdownContent source={portableTextToMarkdownSource(page.body)} />
          </div>
        </div>
      </main>
    </>
  );
}
