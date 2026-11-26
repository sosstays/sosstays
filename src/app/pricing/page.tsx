import type { Metadata } from "next";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { JsonLd, buildNationalPricingServiceSchema, buildFaqSchema, buildBreadcrumbSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { CitySelectDropdown } from "@/components/pricing/CitySelectDropdown";
import { getPricingCounties } from "@/lib/fetchPricingCounties";
import { getLandlordSiteNavLinks } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { PricingExplainer } from "@/components/pricing/PricingExplainer";
import { OnboardingTimeline } from "@/components/pricing/OnboardingTimeline";
import { StrVsLongTermTable } from "@/components/pricing/StrVsLongTermTable";
import { FaqSection } from "@/components/FaqSection";
import { PRICING_FAQS } from "@/lib/pricingFaqs";

export const revalidate = 60;

const TITLE = "Airbnb Management & Pricing Ireland | Sos Stays";
const DESCRIPTION =
  "Commission-only Airbnb & short-term let management across Ireland and Northern Ireland. 15–30% commission, no setup fee — see how it works and pick your county.";
const INTRO =
  "We manage short-term lets and holiday homes for landlords and Airbnb hosts right across Ireland and Northern Ireland. One commission, no setup fee, and a team that handles pricing, cleaning, maintenance and guest comms while you keep more of what your place earns.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: TITLE, description: DESCRIPTION }, "/pricing");
}

export default async function PricingPage() {
  const [counties, landlordSiteNavLinks] = await Promise.all([
    getPricingCounties(),
    getLandlordSiteNavLinks(),
  ]);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd
        data={[
          buildNationalPricingServiceSchema(),
          buildFaqSchema(PRICING_FAQS),
          buildBreadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: "Pricing", url: `${SITE_URL}/pricing` },
          ]),
        ].filter((node): node is NonNullable<typeof node> => Boolean(node))}
      />
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-maroon px-8 pt-[180px] pb-20 text-center sm:px-14 sm:pt-[200px]">
        <HeroNav
          links={landlordSiteNavLinks}
          variant="landlords"
          ctaHref="/contact"
          ctaLabel="Contact us"
        />
        <Eyebrow as="span" className="mb-4" tone="sage" delay={0}>
          Sos Stays · Pricing
        </Eyebrow>
        <Reveal as="h1" delay={130} className="mx-auto mb-4 max-w-[760px] font-serif text-4xl leading-[1.15] font-bold tracking-tight text-cream sm:text-5xl">
          Airbnb &amp; Short-Term Let Management Across Ireland
        </Reveal>
        <Reveal as="p" delay={260} className="mx-auto mb-8 max-w-[620px] text-[15px] leading-relaxed text-cream/75">
          {INTRO}
        </Reveal>
        <Reveal delay={390}>
          <CitySelectDropdown counties={counties} />
        </Reveal>
      </section>
      <PricingExplainer counties={counties} />
      <OnboardingTimeline />
      <StrVsLongTermTable region="roi" />
      <FaqSection
        eyebrow="Questions"
        heading="Pricing questions, answered"
        items={PRICING_FAQS}
        centered
      />
    </main>
  );
}
