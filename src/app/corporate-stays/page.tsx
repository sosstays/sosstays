import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { CORPORATE_STAYS_PAGE_QUERY, CORPORATE_ONBOARDED_PROPERTIES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { FaqSection } from "@/components/FaqSection";
import { CoverageMap } from "@/components/CoverageMap";
import { CorporateLeadForm } from "@/components/CorporateLeadForm";
import { SplitHero } from "@/components/SplitHero";
import { CORPORATE_STAYS_NAV_LINKS } from "@/lib/navLinks";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(CORPORATE_STAYS_PAGE_QUERY);
  return buildMetadata(
    {
      title: page?.seo?.title || "Corporate Stays | Workforce Accommodation | Sos Stays",
      description:
        page?.seo?.description ||
        "Fully furnished contractor and workforce accommodation across Louth, Clare, Wexford and Wicklow — booked by the week or month, on one invoice, with one point of contact.",
      image: page?.seo?.image,
      noIndex: page?.seo?.noIndex,
    },
    "/corporate-stays"
  );
}

// ---- Fallback content ----
// This page is driven by the "Corporate Stays Page" singleton in Sanity
// (studio/schemaTypes/documents/corporateStaysPage.ts). Everything below
// is what renders if that document hasn't been created yet, or a given
// field is left blank — the page should never ship half-empty just
// because an editor hasn't filled in every field.

const DEFAULT_HERO_IMAGES: [{ src: string; alt: string }, { src: string; alt: string }] = [
  {
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    alt: "Warm, furnished living room in a managed Sos Stays property",
  },
  {
    src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    alt: "Bedroom ready for a crew move-in",
  },
];

const DEFAULT_HERO_FACTS = ["Fully furnished", "Weekly or monthly", "One invoice", "One contact"];

type WhoCard = { title: string; body: string; imageUrl: string; alt: string };

const DEFAULT_WHO_CARDS: WhoCard[] = [
  {
    title: "Project & contractor crews",
    body: "Construction, energy and infrastructure teams working away from base. One booking, one contact, one invoice — not a folder of hotel receipts.",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
    alt: "Construction crew on site",
  },
  {
    title: "Relocating professionals",
    body: "Starting a role away from home. Furnished and ready to move into while you find somewhere permanent — no lease to sign.",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    alt: "Colleagues starting a new role",
  },
  {
    title: "Dublin-area commuters",
    body: "Working in or around Dublin, living elsewhere. A base in Louth, Wexford or Wicklow for the working week — without the Dublin price tag.",
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80",
    alt: "Commuter rail line into Dublin",
  },
];

const DEFAULT_HOW_STEPS = [
  { title: "Submit the requirements", body: "Company, headcount, target dates and where you need to be based." },
  {
    title: "Get matched options",
    body: "We check availability across our properties and landlord network, and come back with options and pricing.",
  },
  {
    title: "Move in, supported",
    body: "One point of contact for the length of the stay — questions, issues, extensions, sorted directly with us.",
  },
];

// Coverage copy is deliberately honest about what's live vs. not — Louth is
// the only county with a real, confirmed property; the rest are described
// as "Expanding" with no invented occupancy/pricing stats attached. Keep
// that discipline when editing this in Sanity too.
const DEFAULT_COVERAGE_AREAS = [
  {
    county: "Louth",
    live: true,
    body: "On the Dublin–Belfast corridor, close to the M1 and the Newry–Dublin rail line. Our first managed property is here, with more coming.",
  },
  {
    county: "Clare",
    live: false,
    body: "Near Shannon Airport and the Shannon Free Zone — a practical base for crews working the mid-west.",
  },
  {
    county: "Wexford",
    live: false,
    body: "Close to Rosslare Europort, with growing project activity as the offshore renewable energy hub develops.",
  },
  {
    county: "Wicklow",
    live: false,
    body: "The closest of the four to Dublin city — a straightforward base for anyone commuting in without living in Dublin.",
  },
];

function SofaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <path d="M3 12a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5Z" />
      <path d="M4 17v2a1 1 0 0 0 1 1h1v-2M19 17v2a1 1 0 0 1-1 1h-1v-2" />
    </svg>
  );
}

function WifiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 8.5a15 15 0 0 1 19 0" />
      <path d="M5.5 12.3a10.5 10.5 0 0 1 13 0" />
      <path d="M8.7 16a5.7 5.7 0 0 1 6.6 0" />
      <circle cx="12" cy="19.3" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ContactIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 13v-1.5a7.5 7.5 0 0 1 15 0V13" />
      <rect x="2.5" y="12.5" width="4" height="6" rx="1.4" />
      <rect x="17.5" y="12.5" width="4" height="6" rx="1.4" />
      <path d="M19.5 18.5v.7a2.8 2.8 0 0 1-2.8 2.8H14" />
    </svg>
  );
}

function ClipboardCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="4.2" width="14" height="17" rx="2" />
      <path d="M9 4.2v-.7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.7" />
      <path d="M8.7 13.2 11 15.5l4.3-4.3" />
    </svg>
  );
}

const ICONS = { sofa: SofaIcon, wifi: WifiIcon, contact: ContactIcon, clipboard: ClipboardCheckIcon } as const;
type IconName = keyof typeof ICONS;

type IncludedFeature = { title: string; body: string; Icon: (typeof ICONS)[IconName] };

const DEFAULT_INCLUDED: IncludedFeature[] = [
  {
    title: "Fully furnished",
    body: "Beds made, kitchen equipped, living space set up for a crew rather than a single guest.",
    Icon: SofaIcon,
  },
  {
    title: "Free WiFi in every stay",
    body: "Connected from day one, so evenings and remote paperwork both work.",
    Icon: WifiIcon,
  },
  {
    title: "One dedicated contact",
    body: "The same person for questions, issues and extensions — for the length of the stay.",
    Icon: ContactIcon,
  },
  {
    title: "Confirmed before you commit",
    body: "Amenities vary by property, so we confirm the specifics of your stay in writing first.",
    Icon: ClipboardCheckIcon,
  },
];

const DEFAULT_FAQS = [
  {
    question: "How do companies book accommodation for workers?",
    answer:
      "Send the brief through the form on this page — company name, number of people, target dates and which county you need to be in — and we'll come back with what's available and pricing. No account or lease to set up.",
  },
  {
    question: "Can you book housing for multiple workers at once?",
    answer:
      "Yes. Tell us the headcount and we'll check what we can put together across our properties and landlord network — whether that's one larger property or a few units close together.",
  },
  {
    question: "What's included in a Sos Stays workforce booking?",
    answer:
      "Every stay is fully furnished with free WiFi, plus one point of contact for anything that comes up — questions, issues, or extending the dates. Exact amenities vary by property, so we'll confirm specifics before you commit.",
  },
  {
    question: "Is serviced accommodation better than hotels for workers?",
    answer:
      "For anything longer than a week, generally yes — a furnished house or apartment gives a crew more space and one invoice instead of a room-by-room hotel bill. For a night or two, a hotel is still the simpler option.",
  },
];

type OnboardedProperty = {
  _id: string;
  name: string;
  slug: string;
  location: string | null;
  coverImage: { alt?: string } | null;
};

export default async function CorporateStaysPage() {
  const [data, onboardedPropertiesRaw] = await Promise.all([
    client.fetch(CORPORATE_STAYS_PAGE_QUERY),
    client.fetch(CORPORATE_ONBOARDED_PROPERTIES_QUERY),
  ]);
  const onboardedProperties: OnboardedProperty[] = onboardedPropertiesRaw;

  const heroImages: [{ src: string; alt: string }, { src: string; alt: string }] | [{ src: string; alt: string }] =
    data?.heroImages && data.heroImages.length > 0
      ? (data.heroImages
          .slice(0, 2)
          .map((img: NonNullable<typeof data.heroImages>[number]) => ({
            src: urlFor(img).width(1200).height(1200).url(),
            alt: img.alt ?? "",
          })) as [{ src: string; alt: string }] | [{ src: string; alt: string }, { src: string; alt: string }])
      : DEFAULT_HERO_IMAGES;
  const heroFacts = data?.heroFacts?.length ? data.heroFacts : DEFAULT_HERO_FACTS;

  const whoCards: WhoCard[] = data?.whoCards?.length
    ? data.whoCards.map((c: NonNullable<typeof data.whoCards>[number]) => ({
        title: c.title,
        body: c.body,
        imageUrl: urlFor(c.image).width(900).height(700).url(),
        alt: c.image?.alt ?? c.title,
      }))
    : DEFAULT_WHO_CARDS;

  const howSteps: { title: string; body: string; number: string }[] = (
    data?.howSteps?.length ? data.howSteps : DEFAULT_HOW_STEPS
  ).map((s: { title: string; body: string }, i: number) => ({ ...s, number: String(i + 1) }));

  const coverageAreas: { county: string; live: boolean | null; body: string }[] = data?.coverageAreas?.length
    ? data.coverageAreas
    : DEFAULT_COVERAGE_AREAS;

  const included: IncludedFeature[] = data?.includedFeatures?.length
    ? data.includedFeatures.map((f: NonNullable<typeof data.includedFeatures>[number]) => ({
        title: f.title,
        body: f.body,
        Icon: ICONS[f.icon as IconName] ?? SofaIcon,
      }))
    : DEFAULT_INCLUDED;

  const faqs = data?.faqs?.length ? data.faqs : DEFAULT_FAQS;

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      {/* HERO — maroon, matching the site's landlord/B2B audience treatment.
          SplitHero (components/SplitHero.tsx) owns the nav + right-column
          image split; this page only supplies the left-column copy and its
          own mobile-only image. */}
      <SplitHero navLinks={CORPORATE_STAYS_NAV_LINKS} ctaHref="#brief" ctaLabel="Send your SOS" images={heroImages}>
        <Reveal className="px-8 py-20 sm:px-14 sm:py-28 lg:py-16">
          <div className="lg:max-w-[520px]">
            <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-cream/10 px-4.5 py-2 text-xs font-semibold tracking-widest text-light-sage uppercase">
              <span className="relative inline-flex h-1.75 w-1.75">
                <span className="absolute inset-0 rounded-full bg-light-sage sos-audience-pulse" />
                <span className="relative h-1.75 w-1.75 rounded-full bg-light-sage" />
              </span>
              {data?.heroBadge || "Now booking crews in Louth"}
            </span>
            <h1 className="mb-6 font-serif text-4xl leading-[1.1] font-bold tracking-tight text-cream sm:text-6xl lg:text-5xl">
              {data?.heroHeading || "Contractor and workforce accommodation, sorted for the month."}
            </h1>
            <p className="mb-9 max-w-[540px] text-lg leading-relaxed text-cream/90">
              {data?.heroBody ||
                "Fully furnished houses and apartments across Louth, Clare, Wexford and Wicklow — booked by the week or the month, on one invoice, with one person who answers the phone for the whole stay."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button link="#brief" variant="primary" bgColor="cream" color="maroon" animateColor="maroon">
                {data?.heroPrimaryCtaLabel || "Send your SOS"} →
              </Button>
              <Button link="#coverage" variant="secondary" color="cream" animateColor="maroon">
                {data?.heroSecondaryCtaLabel || "See where we operate"}
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-cream/15 pt-7 sm:flex sm:flex-wrap">
              {heroFacts.map((f: string) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-cream/80">
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-light-sage" />
                  {f}
                </div>
              ))}
            </div>

            {/* Mobile/tablet — a single contained shot below the copy, since
                the full-bleed split column to the right is desktop-only. */}
            <div className="relative mt-11 aspect-[16/10] w-full overflow-hidden rounded-[18px] lg:hidden">
              <Image src={heroImages[0].src} alt={heroImages[0].alt} fill priority className="object-cover" />
            </div>
          </div>
        </Reveal>
      </SplitHero>

      {/* WHO WE HOUSE — plain cream so the bright-cream cards inside still
          read as a raised, distinct tone against it. Bottom padding is
          intentionally smaller than the top (pb-16 vs pt-24): this section
          and "how it works" below share the same cream background, so the
          full 96/112px cross-color gap used elsewhere on this page would
          just be dead space between two sections meant to read as one
          band — see the matching pt-16 on #how below. */}
      <section id="who" className="bg-cream px-8 pt-24 pb-16 sm:px-14 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-[640px]">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">{data?.whoEyebrow || "Who we house"}</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              {data?.whoHeading || "A hotel room is overkill for a month."}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-near-black/70">
              {data?.whoBody ||
                "If your return date keeps shifting, or you're housing a crew rather than a guest, this is who we sort accommodation for."}
            </p>
          </Reveal>

          <div className="mt-11 grid grid-cols-1 gap-5.5 sm:grid-cols-3">
            {whoCards.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-sage-grey/40 bg-bright-cream transition-transform duration-200 hover:-translate-y-1">
                  <div className="relative h-44 w-full">
                    <Image src={item.imageUrl} alt={item.alt} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2.5 font-serif text-xl font-bold text-maroon">{item.title}</h3>
                    <p className="text-[15px] leading-relaxed text-near-black/70">{item.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS + FAQ — merged into one cream band (moved up from its
          old spot near the bottom of the page) so visitors get the process
          and the common questions in the same breath, before the heavier
          coverage/included/partner sections. Only maroon/cream are used for
          section backgrounds site-wide on this page. Top padding matches
          "who" above's reduced bottom padding (see its comment); bottom
          spacing is deferred entirely to FaqSection's own pb-24, which is
          the real cross-color gap into the maroon coverage band below.
          Horizontal padding lives on the SECTION (px-8/sm:px-14), same as
          every other section on this page — not on the inner content div —
          so this section's content column lines up exactly with
          who/coverage/included/partner instead of sitting inset an extra
          32/56px from double-applied padding. */}
      <section id="how" className="bg-cream px-8 pt-16 sm:px-14 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[560px]">
              <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">{data?.howEyebrow || "How it works"}</p>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
                {data?.howHeading || "Three steps, no procurement portal."}
              </h2>
            </div>
            <p className="max-w-[320px] text-sm leading-relaxed text-near-black/65">
              {data?.howBody ||
                "Tell us headcount, dates and the county you need to be near. You get real options back — not a generic price list."}
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-9 border-t border-sage-grey/40 pt-9 sm:grid-cols-3">
            {howSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 80}>
                <div className="mb-3.5 text-3xl font-extrabold text-light-sage">{step.number}</div>
                <h3 className="mb-2 text-base font-semibold text-near-black">{step.title}</h3>
                <p className="text-sm leading-relaxed text-near-black/65">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* mt-14/16 matches the same "same-color internal gap" used between
            "who" and this section above — not the mt-20/24 this used to be,
            which read as a bigger break than the header-to-grid gaps right
            above it. No horizontal padding here — the #how section above
            already supplies px-8/sm:px-14 for all its children, so
            FaqSection is called with padded=false to avoid stacking a
            second layer on top of it (which is what caused the FAQ column
            to sit narrower and inset from every sibling section). */}
        <div className="mt-14 sm:mt-16">
          <FaqSection
            id="faq"
            eyebrow={data?.faqEyebrow || "Questions"}
            heading={data?.faqHeading || "Frequently asked questions"}
            items={faqs}
            accent="maroon"
            maxWidth="1152px"
            padded={false}
          />
        </div>
      </section>

      {/* COVERAGE — maroon band, matches the site's landlord/owner-context band */}
      <section id="coverage" className="bg-maroon px-8 py-24 text-cream sm:px-14 sm:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="overflow-hidden rounded-[18px] border border-cream/15">
            <CoverageMap className="block h-auto w-full" />
          </Reveal>

          <div>
            <Reveal>
              <p className="mb-2.5 text-xs tracking-widest text-light-sage uppercase">{data?.coverageEyebrow || "Where we operate"}</p>
              <h2 className="text-balance font-serif text-3xl leading-tight font-bold tracking-tight text-cream sm:text-4xl">
                {data?.coverageHeading || "Live in Louth, expanding down the east coast and into the mid-west."}
              </h2>
            </Reveal>

            <div className="mt-8 flex flex-col">
              {coverageAreas.map((area, i) => (
                <Reveal key={area.county} delay={i * 60} className="flex gap-5 border-t border-cream/15 py-5">
                  <span
                    className={`inline-flex w-[100px] flex-none items-center gap-2 text-[11px] font-semibold tracking-wider uppercase ${
                      area.live ? "text-light-sage" : "text-cream/55"
                    }`}
                  >
                    {area.live && (
                      <span className="relative inline-flex h-1.75 w-1.75">
                        <span className="absolute inset-0 rounded-full bg-light-sage sos-audience-pulse" />
                        <span className="relative h-1.75 w-1.75 rounded-full bg-light-sage" />
                      </span>
                    )}
                    {area.live ? "Live now" : "Expanding"}
                  </span>
                  <div>
                    <h3 className="mb-1 font-serif text-lg font-bold text-cream">{area.county}</h3>
                    <p className="text-sm leading-relaxed text-cream/70">{area.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-6 text-sm leading-relaxed text-cream/60">
              {data?.coverageNote ||
                "Need a county that isn't live yet? Tell us where — we'll confirm what's available now or add you to the list as we grow there."}
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section id="included" className="bg-cream px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-[600px]">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">{data?.includedEyebrow || "What's included"}</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              {data?.includedHeading || "Move-in ready, managed for the whole stay."}
            </h2>
          </Reveal>

          <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {included.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <div className="group relative overflow-hidden rounded-[16px] border border-sage-grey/40 bg-bright-cream p-7 transition-all duration-300 hover:-translate-y-1 hover:border-maroon/40 hover:shadow-[0_18px_36px_-24px_rgba(71,45,48,0.45)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-maroon/[0.06] transition-transform duration-500 group-hover:scale-125"
                  />
                  <span className="relative inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-maroon/10 text-maroon transition-transform duration-300 group-hover:scale-110 group-hover:bg-maroon group-hover:text-cream">
                    <item.Icon className="h-6 w-6" />
                  </span>
                  <h3 className="relative mt-5 mb-1.5 text-base font-semibold text-maroon">{item.title}</h3>
                  <p className="relative text-sm leading-relaxed text-near-black/65">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER WITH US — for property owners, not workforce clients; links
          out to /landlords rather than repeating the corporate lead form.
          Maroon, matching the site's owner-context accent (see the
          homepage's "For landlords" band and the /landlords hero). The
          property grid is a live query against propertyPage (see
          CORPORATE_ONBOARDED_PROPERTIES_QUERY), so it never needs manual
          updating as properties are onboarded. */}
      <section id="partner" className="bg-maroon px-8 py-24 text-cream sm:px-14 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-[560px]">
              <p className="mb-2.5 text-xs tracking-widest text-light-sage uppercase">
                {data?.partnerEyebrow || "For property owners"}
              </p>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-cream sm:text-4xl">
                {data?.partnerHeading || "Own a property along the corridor?"}
              </h2>
              <p className="mt-4 max-w-[480px] text-base leading-relaxed text-cream/80">
                {data?.partnerBody ||
                  "Most self-managing hosts earn 20–35% less than they should. Hand it to us — commission-only, no setup fee — and see it managed properly alongside the crews we house."}
              </p>
            </div>
            <Button
              link={data?.partnerCtaUrl || "/landlords"}
              variant="secondary"
              color="cream"
              animateColor="maroon"
            >
              {data?.partnerCtaLabel || "Partner with us"} →
            </Button>
          </Reveal>

          {onboardedProperties.length > 0 && (
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {onboardedProperties.map((property, i) => (
                <Reveal key={property._id} delay={i * 80}>
                  <Link
                    href={`/stays/${property.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-near-black"
                  >
                    {property.coverImage && (
                      <Image
                        src={urlFor(property.coverImage).width(700).height(880).url()}
                        alt={property.coverImage.alt ?? property.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-40% to-transparent" />
                    <div className="absolute right-5 bottom-5 left-5">
                      <h3 className="font-serif text-lg font-bold text-cream">{property.name}</h3>
                      {property.location && (
                        <p className="mt-1 text-sm text-cream/75">{property.location}</p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEND YOUR SOS — its own section, header text separate from the
          form card itself (each step carries its own heading instead), same
          split as LandlordSosAndEstimate/LandlordLeadForm. */}
      <section id="brief" className="bg-cream px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-[640px]">
          <Reveal className="mb-10 text-center">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">Send your SOS</p>
            <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              Company, headcount, dates, county.
            </h2>
            <p className="mx-auto max-w-[480px] text-sm text-near-black/60">
              Two minutes, three short steps — we reply with real options, or tell you straight if
              we can&apos;t cover it yet.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <CorporateLeadForm />
          </Reveal>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-maroon px-8 py-24 text-center sm:px-14 sm:py-28">
        <Reveal className="mx-auto max-w-[640px]">
          <h2 className="text-balance font-serif text-3xl leading-tight font-bold tracking-tight text-cream sm:text-4xl">
            {data?.closingHeading || "Got a crew to house, or a county in mind?"}
          </h2>
          <p className="mx-auto mt-4.5 max-w-[520px] text-base leading-relaxed text-cream/80">
            {data?.closingBody ||
              "Send the details — company, headcount, dates, and whether you need Louth, Clare, Wexford or Wicklow — and we'll come back with real options."}
          </p>
          <div className="mt-8">
            <Button link="#brief" variant="secondary" color="cream" animateColor="maroon">
              Send your SOS →
            </Button>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
