import Link from "next/link";
import { client } from "@/sanity/client";
import { LANDLORD_PAGES_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { LandlordPageContent } from "@/components/LandlordPageContent";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const pages = await client.fetch(LANDLORD_PAGES_QUERY);
  if (pages.length === 1) return buildMetadata(pages[0].seo, "/landlords");
  return buildMetadata(null, "/landlords");
}

export default async function LandlordsIndexPage() {
  const pages = await client.fetch(LANDLORD_PAGES_QUERY);

  // Common case: exactly one landlord pitch page exists — render it
  // directly at /landlords so the main nav CTA is never a dead link.
  if (pages.length === 1) {
    return <LandlordPageContent page={pages[0]} />;
  }

  if (pages.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="font-serif text-4xl font-semibold text-[#1C1C1C]">For landlords</h1>
        <p className="mt-4 text-[#555550]">
          Details coming soon —{" "}
          <a href="mailto:hello@sosstays.ie" className="text-[#0F6E56] underline">
            get in touch
          </a>{" "}
          in the meantime.
        </p>
      </main>
    );
  }

  // Multiple landlord pages exist — show a simple chooser.
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-semibold text-[#1C1C1C]">For landlords</h1>
      <ul className="mt-6 space-y-4">
        {pages.map((page: any) => (
          <li key={page._id}>
            <Link href={`/landlords/${page.slug}`} className="text-lg text-[#0F6E56] underline">
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
