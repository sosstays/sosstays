import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { PRIVACY_POLICY_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(PRIVACY_POLICY_QUERY);
  if (!page) return {};
  return buildMetadata(page.seo, "/privacy-policy");
}

export default async function PrivacyPolicyPage() {
  const page = await client.fetch(PRIVACY_POLICY_QUERY);
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-semibold text-[#1C1C1C]">{page.title}</h1>
      {page.lastUpdated && (
        <p className="mt-2 text-sm text-[#555550]">
          Last updated{" "}
          {new Date(page.lastUpdated).toLocaleDateString("en-IE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      <div className="prose prose-neutral mt-8 max-w-none">
        <PortableText value={page.body} />
      </div>
    </main>
  );
}
