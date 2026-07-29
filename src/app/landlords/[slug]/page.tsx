import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { LANDLORD_PAGE_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { LandlordPageContent } from "@/components/LandlordPageContent";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await client.fetch(LANDLORD_PAGE_QUERY, { slug });
  if (!page) return {};
  return buildMetadata(page.seo, `/landlords/${slug}`);
}

export default async function LandlordSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = await client.fetch(LANDLORD_PAGE_QUERY, { slug });
  if (!page) notFound();

  return <LandlordPageContent page={page} />;
}
