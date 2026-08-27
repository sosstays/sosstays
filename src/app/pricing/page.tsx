import type { Metadata } from "next";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { CitySelectDropdown } from "@/components/pricing/CitySelectDropdown";
import { OnboardingTimeline } from "@/components/pricing/OnboardingTimeline";
import { StrVsLongTermTable } from "@/components/pricing/StrVsLongTermTable";
import { RelatedBlogsSection } from "@/components/RelatedBlogsSection";
import { getPricingCounties } from "@/lib/fetchPricingCounties";
import { client } from "@/sanity/client";
import { LANDLORD_BLOG_POSTS_QUERY } from "@/sanity/queries";
import type { NavLink } from "@/lib/navLinks";

export const revalidate = 60;

const NAV_LINKS: NavLink[] = [
  { href: "/landlords#how-it-works", label: "How it works" },
];

const TITLE = "Airbnb & Short-Term Rental Management Pricing — Sos Stays";
const DESCRIPTION =
  "Commission-only Airbnb and short-term rental management pricing across Ireland — from 15%, no setup fee, no retainer. Find pricing and rules for your county.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: TITLE, description: DESCRIPTION }, "/pricing");
}

export default async function PricingPage() {
  const [counties, landlordPosts] = await Promise.all([
    getPricingCounties(),
    client.fetch(LANDLORD_BLOG_POSTS_QUERY),
  ]);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <section className="relative bg-maroon px-8 pt-[180px] pb-20 text-center sm:px-14 sm:pt-[200px]">
        <HeroNav
          links={NAV_LINKS}
          variant="landlords"
          ctaHref="mailto:info@sosstays.com"
          ctaLabel="Contact us"
        />
        <span className="mb-4 inline-block text-xs font-medium tracking-widest text-light-sage uppercase">
          Sos Stays · Pricing
        </span>
        <h1 className="mx-auto mb-4 max-w-[640px] font-serif text-4xl leading-[1.15] font-bold tracking-tight text-cream sm:text-5xl">
          Simple, commission-only pricing — <em className="text-light-sage italic">from 15%</em>
        </h1>
        <p className="mx-auto mb-8 max-w-[520px] text-[15px] leading-relaxed text-cream/75">
          No setup fee, no monthly retainer — you only pay when your property earns. Select your
          city to see local pricing and rules.
        </p>
        <CitySelectDropdown counties={counties} />
      </section>

      <OnboardingTimeline />
      <StrVsLongTermTable />
      <RelatedBlogsSection posts={landlordPosts} />
    </main>
  );
}
