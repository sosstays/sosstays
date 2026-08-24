import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { CitySelectDropdown } from "@/components/pricing/CitySelectDropdown";
import { CountyResult } from "@/components/pricing/PricingCountyResult";
import { getPricingCounties } from "@/lib/fetchPricingCounties";
import type { NavLink } from "@/lib/navLinks";

export const revalidate = 60;

const NAV_LINKS: NavLink[] = [
  { href: "/pricing", label: "All counties" },
  { href: "/landlords#how-it-works", label: "How it works" },
];

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

export default async function PricingCountyPage({ params }: Props) {
  const { slug } = await params;
  const counties = await getPricingCounties();
  const county = counties.find((c) => c.slug === slug);
  if (!county) notFound();

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <section className="relative bg-maroon px-8 pt-[180px] pb-16 text-center sm:px-14 sm:pt-[200px]">
        <HeroNav
          links={NAV_LINKS}
          variant="landlords"
          ctaHref="mailto:info@sosstays.com"
          ctaLabel="Contact us"
        />
        <Link
          href="/pricing"
          className="mb-4 inline-block text-xs font-medium tracking-widest text-light-sage uppercase"
        >
          ← All counties
        </Link>
        <h1 className="mx-auto mb-4 max-w-[640px] font-serif text-4xl leading-[1.15] font-bold tracking-tight text-cream sm:text-5xl">
          Pricing in <em className="text-light-sage italic">{county.name}</em>
        </h1>
        <p className="mx-auto mb-8 max-w-[480px] text-[15px] leading-relaxed text-cream/75">
          Commission-only — from 15%, no setup fee, no monthly retainer.
        </p>
        <CitySelectDropdown counties={counties} />
      </section>

      <div className="mx-auto max-w-5xl px-8 py-16 sm:px-14">
        <CountyResult county={county} />
      </div>
    </main>
  );
}
