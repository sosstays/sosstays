import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { LIST_YOUR_PROPERTY_PAGE_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { CORPORATE_STAYS_NAV_LINKS } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { CorporateStayPropertySubmissionForm } from "@/components/CorporateStayPropertySubmissionForm";

export const revalidate = 60;

// Fallback copy — used until the "List Your Property Page (Corporate
// Stays)" singleton is populated in Sanity, or a given field is left blank.
const DEFAULT_HERO_EYEBROW = "For property owners · Corporate & monthly stays only";
const DEFAULT_HERO_HEADING = "Submit your property for corporate & monthly-stay sourcing";
const DEFAULT_HERO_BODY =
  "This is not our regular Airbnb management sign-up — it only feeds contractor crews, relocating professionals and other long-stay corporate guests. We review every submission before anything goes live, and nothing here is shared or booked outside our team.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(LIST_YOUR_PROPERTY_PAGE_QUERY);
  return buildMetadata(
    {
      title: page?.seo?.title || "List Your Property for Corporate Stays | SOS Stays",
      description:
        page?.seo?.description ||
        "Submit your property for our corporate & monthly-stay sourcing pool — contractor crews, relocating professionals and other long-stay guests, separate from regular Airbnb management.",
      image: page?.seo?.image,
      noIndex: page?.seo?.noIndex,
    },
    "/corporate-stays/list-your-property"
  );
}

export default async function ListCorporateStayPropertyPage() {
  const page = await client.fetch(LIST_YOUR_PROPERTY_PAGE_QUERY);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <section className="relative bg-maroon px-8 pt-[140px] pb-16 text-cream sm:px-14 sm:pt-[160px] sm:pb-20">
        <HeroNav links={CORPORATE_STAYS_NAV_LINKS} variant="default" ctaHref="/corporate-stays#brief" ctaLabel="Hiring workers?" />
        <div className="mx-auto max-w-[680px] text-center">
          <Eyebrow as="span" className="mb-4" tone="sage" delay={0}>
            {page?.heroEyebrow || DEFAULT_HERO_EYEBROW}
          </Eyebrow>
          <Reveal as="h1" delay={130} className="mb-4 font-serif text-3xl leading-[1.15] font-bold tracking-tight text-cream sm:text-5xl">
            {page?.heroHeading || DEFAULT_HERO_HEADING}
          </Reveal>
          <Reveal as="p" delay={260} className="mx-auto max-w-[560px] text-[15px] leading-relaxed text-cream/80">
            {page?.heroBody || DEFAULT_HERO_BODY}
          </Reveal>
        </div>
      </section>

      <section className="px-8 py-16 sm:px-14 sm:py-20">
        <div className="mx-auto max-w-[680px]">
          <Reveal>
            <CorporateStayPropertySubmissionForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
