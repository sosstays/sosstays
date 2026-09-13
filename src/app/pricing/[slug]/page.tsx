import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { CountyPageContent } from "@/components/pricing/CountyPageContent";
import { OnboardingTimeline } from "@/components/pricing/OnboardingTimeline";
import { StrVsLongTermTable } from "@/components/pricing/StrVsLongTermTable";
import { RelatedBlogsSection } from "@/components/RelatedBlogsSection";
import { getPricingCounties } from "@/lib/fetchPricingCounties";
import { client } from "@/sanity/client";
import { LANDLORD_BLOG_POSTS_QUERY } from "@/sanity/queries";
import { getLandlordSiteNavLinks } from "@/lib/navLinks";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const counties = await getPricingCounties();
  return counties.map((county) => ({ slug: county.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const counties = await getPricingCounties();
  const county = counties.find((c) => c.slug === slug);
  if (!county) return {};

  const title = `Airbnb & Short-Term Rental Management Pricing in ${county.name} — Sos Stays`;
  const description = `Commission-only Airbnb and short-term rental management pricing for ${county.name} — from 15%, no setup fee, no retainer.`;
  return buildMetadata({ title, description }, `/pricing/${slug}`);
}

// Every county — live, expanding, or Northern Ireland — uses the same
// template (CountyPageContent), which conditionally renders each section
// based on what data actually exists for that county. See the
// honesty-in-projections principle: no county gets a fabricated version
// of a section it doesn't have real content for.
export default async function PricingCountyPage({ params }: Props) {
  const { slug } = await params;
  const [counties, landlordPosts, landlordSiteNavLinks] = await Promise.all([
    getPricingCounties(),
    client.fetch(LANDLORD_BLOG_POSTS_QUERY),
    getLandlordSiteNavLinks(),
  ]);
  const county = counties.find((c) => c.slug === slug);
  if (!county) notFound();

  const navLinks = [{ href: "/pricing", label: "All counties" }, ...landlordSiteNavLinks];

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <HeroNav links={navLinks} variant="landlords" sticky ctaHref="/contact" ctaLabel="Contact us" />
      <div className="mx-auto flex max-w-[1120px] flex-col px-6 pt-20 pb-16 sm:px-10 sm:pt-24 sm:pb-[104px]">
        <CountyPageContent county={county} />
      </div>
      <OnboardingTimeline />
      <StrVsLongTermTable />
      <RelatedBlogsSection posts={landlordPosts} />
    </main>
  );
}
