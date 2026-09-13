import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { PARTNER_BY_SLUG_QUERY, FEATURED_PARTNER_SLUGS_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { Reveal } from "@/components/Reveal";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { DEFAULT_PARTNERS, type Partner } from "@/lib/partnersData";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch(FEATURED_PARTNER_SLUGS_QUERY);
  if (slugs?.length) return slugs.map((slug: string) => ({ slug }));
  return DEFAULT_PARTNERS.filter((p) => p.featured).map((p) => ({ slug: p.slug }));
}

async function getPartner(slug: string): Promise<Partner | null> {
  const partner = await client.fetch(PARTNER_BY_SLUG_QUERY, { slug });
  if (partner) {
    return {
      ...partner,
      slug: partner.slug ?? slug,
      featured: partner.featured ?? true,
      profileIntro: partner.profileIntro ?? undefined,
      profileBody: partner.profileBody ?? undefined,
    };
  }

  const fallback = DEFAULT_PARTNERS.find((p) => p.slug === slug && p.featured);
  return fallback ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getPartner(slug);
  if (!partner) return buildMetadata(null, `/partners/${slug}`);

  return buildMetadata(
    {
      title: `${partner.name} | Sos Stays Partners`,
      description: partner.description,
    },
    `/partners/${partner.slug}`
  );
}

export default async function PartnerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = await getPartner(slug);
  if (!partner) notFound();

  const siteNavLinks = await getGuestSiteNavLinks();

  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/landlords" ctaLabel="Send your SOS" sticky />
      <main className="overflow-x-hidden bg-cream text-near-black">
        <section className="bg-maroon px-8 py-20 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-[820px]">
            <Reveal className="font-serif mb-6 inline-block rounded-full border border-cream/30 px-[18px] py-2 text-xs font-semibold tracking-widest text-cream/80 uppercase">
              Featured Partner
            </Reveal>
            <Reveal
              as="h1"
              delay={100}
              className="font-serif mb-3 text-[34px] leading-[1.1] font-extrabold tracking-tight text-cream sm:text-5xl"
            >
              {partner.name}
            </Reveal>
            <Reveal delay={160} className="text-lg text-cream/80">
              {partner.profileIntro || partner.tagline}
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-[820px] px-8 py-20 sm:px-14">
          <Reveal>
            <p className="mb-8 text-lg leading-loose text-near-black/80">
              {partner.profileBody || partner.description}
            </p>
            <a
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-maroon underline underline-offset-2"
            >
              Visit {partner.name} →
            </a>
          </Reveal>
        </section>
      </main>
    </>
  );
}
