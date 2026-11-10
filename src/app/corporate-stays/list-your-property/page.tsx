import type { Metadata } from "next";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { CORPORATE_STAYS_NAV_LINKS } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { CorporateStayPropertySubmissionForm } from "@/components/CorporateStayPropertySubmissionForm";

export const revalidate = 60;

const TITLE = "List Your Property for Corporate Stays | SOS Stays";
const DESCRIPTION =
  "Submit your property for our corporate & monthly-stay sourcing pool — contractor crews, relocating professionals and other long-stay guests, separate from regular Airbnb management.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: TITLE, description: DESCRIPTION }, "/corporate-stays/list-your-property");
}

export default function ListCorporateStayPropertyPage() {
  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <section className="relative bg-maroon px-8 pt-[140px] pb-16 text-cream sm:px-14 sm:pt-[160px] sm:pb-20">
        <HeroNav links={CORPORATE_STAYS_NAV_LINKS} variant="default" ctaHref="/corporate-stays#brief" ctaLabel="Hiring workers?" />
        <div className="mx-auto max-w-[680px] text-center">
          <Eyebrow as="span" className="mb-4" tone="sage" delay={0}>
            For property owners · Corporate &amp; monthly stays only
          </Eyebrow>
          <Reveal as="h1" delay={130} className="mb-4 font-serif text-3xl leading-[1.15] font-bold tracking-tight text-cream sm:text-5xl">
            Submit your property for corporate &amp; monthly-stay sourcing
          </Reveal>
          <Reveal as="p" delay={260} className="mx-auto max-w-[560px] text-[15px] leading-relaxed text-cream/80">
            This is not our regular Airbnb management sign-up — it only feeds contractor crews,
            relocating professionals and other long-stay corporate guests. We review every submission
            before anything goes live, and nothing here is shared or booked outside our team.
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
