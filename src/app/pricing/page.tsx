import type { Metadata } from "next";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { CitySelectDropdown } from "@/components/pricing/CitySelectDropdown";
import { getPricingCounties } from "@/lib/fetchPricingCounties";
import type { NavLink } from "@/lib/navLinks";
import { COMMISSION_FROM } from "@/lib/businessFacts";

export const revalidate = 60;

const NAV_LINKS: NavLink[] = [
  { href: "/landlords#how-it-works", label: "How it works" },
];

const TITLE = "Airbnb & Short-Term Rental Management Pricing — Sos Stays";
const DESCRIPTION = `Commission-only Airbnb and short-term rental management pricing across Ireland — from ${COMMISSION_FROM}, no setup fee, no retainer. Find pricing and rules for your county.`;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: TITLE, description: DESCRIPTION }, "/pricing");
}

export default async function PricingPage() {
  const counties = await getPricingCounties();

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-maroon px-8 pt-[180px] pb-20 text-center sm:px-14 sm:pt-[200px]">
        <HeroNav
          links={NAV_LINKS}
          variant="landlords"
          ctaHref="/contact"
          ctaLabel="Contact us"
        />
        <span className="mb-4 inline-block text-xs font-medium tracking-widest text-light-sage uppercase">
          Sos Stays · Pricing
        </span>
        <h1 className="mx-auto mb-4 max-w-[640px] font-serif text-4xl leading-[1.15] font-bold tracking-tight text-cream sm:text-5xl">
          Simple, commission-only pricing —{" "}
          <em className="text-light-sage italic">from {COMMISSION_FROM}</em>
        </h1>
        <p className="mx-auto mb-8 max-w-[520px] text-[15px] leading-relaxed text-cream/75">
          No setup fee, no monthly retainer — you only pay when your property earns. Select your
          city to see local pricing and rules.
        </p>
        <CitySelectDropdown counties={counties} />
      </section>
    </main>
  );
}
