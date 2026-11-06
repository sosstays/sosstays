import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import {
  JsonLd,
  buildCountyServiceSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { CountyPageContent } from "@/components/pricing/CountyPageContent";
import { OnboardingTimeline } from "@/components/pricing/OnboardingTimeline";
import { StrVsLongTermTable } from "@/components/pricing/StrVsLongTermTable";
import { RelatedBlogsSection } from "@/components/RelatedBlogsSection";
import { getPricingCounties } from "@/lib/fetchPricingCounties";
import { buildGenericCountyFaqs, mergeCountyFaqs } from "@/lib/countyFaqs";
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

  const title = `Airbnb Management & Pricing in ${county.name} | SOS Stays`;
  const description = `Commission-only Airbnb & short-term let management in Co. ${county.name}. From 15% commission, no setup fee, no retainer — see what your ${county.name} property could earn.`;
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

  // Mirrors CountyPageContent's own FAQ list exactly, so the FAQPage schema
  // never drifts from what's actually visible on the page.
  const faqs = mergeCountyFaqs(
    buildGenericCountyFaqs(county.name, county.region),
    county.stats?.faqs ?? []
  );

  // The related-posts query isn't region-scoped, and a couple of the
  // landlord-tagged posts are specifically about the Republic's Short-Term
  // Letting Register — skip those on NI pages, which have their own
  // Tourism NI certification rules instead.
  const visibleLandlordPosts =
    county.region === "ni"
      ? landlordPosts.filter(
          (post: { title?: string | null; excerpt?: string | null }) =>
            !/Fáilte|Short-Term Letting Register/i.test(`${post.title ?? ""} ${post.excerpt ?? ""}`)
        )
      : landlordPosts;

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd
        data={[
          buildCountyServiceSchema(county),
          buildFaqSchema(faqs),
          buildBreadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: "Pricing", url: `${SITE_URL}/pricing` },
            { name: county.name, url: `${SITE_URL}/pricing/${county.slug}` },
          ]),
        ].filter((node): node is NonNullable<typeof node> => Boolean(node))}
      />
      <HeroNav links={navLinks} variant="landlords" sticky ctaHref="/contact" ctaLabel="Contact us" />
      <div className="mx-auto flex max-w-[1120px] flex-col px-6 pt-20 pb-16 sm:px-10 sm:pt-24 sm:pb-[104px]">
        <CountyPageContent county={county} />
      </div>
      <OnboardingTimeline />
      <StrVsLongTermTable region={county.region} />
      <RelatedBlogsSection posts={visibleLandlordPosts} />
    </main>
  );
}
