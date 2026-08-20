import type { Metadata } from "next";
import { buildMetadata } from "@/sanity/metadata";
import { JsonLd, buildFaqSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { FaqSection } from "@/components/FaqSection";
import { RevenueCalculator } from "@/components/RevenueCalculator";
import type { NavLink } from "@/lib/navLinks";
import { CALCULATOR_FAQS } from "@/lib/calculatorFaqs";

// This page's sections don't match /landlords' — "How it works" lives back
// there, while "Revenue calculator" and "FAQ" are this page's own anchors.
const NAV_LINKS: NavLink[] = [
  { href: "/landlords#how-it-works", label: "How it works" },
  { href: "#calculator", label: "Revenue calculator" },
  { href: "#faq", label: "FAQ" },
];

const TITLE = "Airbnb Revenue Calculator Ireland — Sos Stays Property Management";
const DESCRIPTION =
  "Find out how much more your Airbnb or holiday let in Louth, Meath or Newry could earn with professional management. Free revenue calculator — results in 2 minutes.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: TITLE, description: DESCRIPTION }, "/calculator");
}

export default function CalculatorPage() {
  const faqSchema = buildFaqSchema(CALCULATOR_FAQS);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      {faqSchema && <JsonLd data={faqSchema} />}

      <section className="relative bg-maroon px-8 pt-[180px] pb-20 text-center sm:px-14 sm:pt-[200px]">
        <HeroNav
          links={NAV_LINKS}
          variant="landlords"
          ctaHref="mailto:info@sosstays.com"
          ctaLabel="Contact us"
        />
        <span className="mb-4 inline-block text-xs font-medium tracking-widest text-light-sage uppercase">
          Sos Stays · Free Revenue Calculator
        </span>
        <h1 className="mx-auto mb-4 max-w-[640px] font-serif text-4xl leading-[1.15] font-bold tracking-tight text-cream sm:text-5xl">
          See what your property could earn with <em className="text-light-sage italic">zero extra effort</em>
        </h1>
        <p className="mx-auto max-w-[480px] text-[15px] leading-relaxed text-cream/75">
          Already running your own Airbnb or holiday let in Louth, Meath or Newry? Find out
          exactly how much more professional management could unlock — in under 2 minutes.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-8 py-16 sm:px-14 sm:py-20">
        <RevenueCalculator />
      </div>

      <FaqSection
        id="faq"
        heading="Questions owners ask before working with us"
        eyebrow="Frequently asked"
        items={CALCULATOR_FAQS}
        accent="maroon"
        centered
      />
    </main>
  );
}
