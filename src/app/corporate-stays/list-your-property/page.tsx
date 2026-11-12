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

const DEFAULT_HOW_HEADING = "How this works";
const DEFAULT_HOW_INTRO =
  "This page is specifically for corporate and monthly-stay sourcing — it's separate from signing up for full Sos Stays property management. If you already have a property with us, there's nothing new to do here. If you don't, submitting your details below is the first step toward picking up more corporate bookings.";
const DEFAULT_HOW_ITEMS: { title: string; body: string }[] = [
  {
    title: "We find the booking",
    body: "We put your property in front of contractor crews, relocating professionals and other long-stay corporate guests who are actively looking for monthly accommodation — a different crowd from the usual nightly Airbnb search.",
  },
  {
    title: "We handle the enquiry",
    body: "Every corporate enquiry comes to us first. We check the dates, group size and what they actually need, then come back to you with a real, specific request — never a cold booking landing in your inbox.",
  },
  {
    title: "You stay in control",
    body: "Nothing about your property is shared publicly or confirmed without you. You decide the price, the dates, and whether a particular booking is the right fit.",
  },
];

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
  const cmsHowItems = ((page?.howItems ?? []) as { title?: string | null; body?: string | null }[]).filter(
    (item): item is { title: string; body: string } => Boolean(item?.title && item?.body)
  );
  const howItems = cmsHowItems.length > 0 ? cmsHowItems : DEFAULT_HOW_ITEMS;

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <section id={page?.heroSectionId || "hero"} className="relative bg-maroon px-8 pt-[140px] pb-16 text-cream sm:px-14 sm:pt-[160px] sm:pb-20">
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

      {/* HOW THIS WORKS — what this page is (and isn't) before the owner
          reaches the form. Same card treatment as the "Who we house"
          cards on /corporate-stays. */}
      <section id={page?.howSectionId || "how-this-works"} className="px-8 pt-16 sm:px-14 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-[680px]">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              {page?.howHeading || DEFAULT_HOW_HEADING}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-near-black/70">{page?.howIntro || DEFAULT_HOW_INTRO}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5.5 sm:grid-cols-3">
            {howItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <article className="flex h-full flex-col rounded-[18px] border border-sage-grey/40 bg-bright-cream p-6">
                  <h3 className="mb-2.5 font-serif text-xl font-bold text-maroon">{item.title}</h3>
                  <p className="text-[15px] leading-relaxed text-near-black/70">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id={page?.formSectionId || "submit"} className="px-8 py-16 sm:px-14 sm:py-20">
        <div className="mx-auto max-w-[680px]">
          <Reveal>
            <CorporateStayPropertySubmissionForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
