import type { Metadata } from "next";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { PropertyCard } from "@/components/PropertyCard";
import { FaqSection } from "@/components/FaqSection";
import { BespokeTripForm } from "@/components/BespokeTripForm";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

const TITLE = "Bespoke Ireland Trips & Concierge | SOS Stays";
const DESCRIPTION =
  "Plan your Ireland trip end to end with SOS Stays — accommodation in our Irish houses, event and transport planning, golf and family days out. One point of contact.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: TITLE, description: DESCRIPTION }, "/bespoke-ireland-trip");
}

const HOW_IT_WORKS = [
  {
    number: "1",
    title: "Tell us",
    text: "Your ideal month, group size, and what everyone's into — whether you're here for an event or just a break.",
  },
  {
    number: "2",
    title: "We plan",
    text: "Accommodation across our houses, transport, tee times, family days and dinner reservations. One itinerary, one price.",
  },
  {
    number: "3",
    title: "You arrive",
    text: "We handle the rest, and we're on the ground if anything changes.",
  },
];

const WHAT_WE_ARRANGE = [
  "Accommodation in our Irish houses — Howard's Way on the Clare coast, Rathescar Grove in the Boyne Valley, and more",
  "Event and transport planning — getting to the Ryder Cup, a wedding venue or a match day without the stress",
  "Tee times at Lahinch, Trump Doonbeg and the west-of-Ireland links",
  "Family days out: Cliffs of Moher, Aran Islands, the Burren, castles, Galway",
  "Dinner reservations and local recommendations",
  "One point of contact for the whole trip",
];

const AREAS = [
  {
    title: "Liscannor & the Cliffs of Moher",
    description: "The Clare coast: the Cliffs, Lahinch, the Burren, the Aran Islands.",
    href: "/areas/liscannor-cliffs-of-moher",
  },
  {
    title: "The Boyne Valley & Ardee",
    description: "Newgrange, Funtasia, the Hill of Slane, 50 minutes from Dublin.",
    href: "/areas/boyne-valley-ardee",
  },
  {
    title: "More areas across Ireland",
    description: "See every area guide on the site.",
    href: "/areas",
  },
];

const ITINERARIES = [
  {
    title: "Ryder Cup week (13–19 Sept 2027)",
    text: "Base at Howard's Way on the Clare coast; park-and-ride or train to Adare on match days; practice days for the Cliffs of Moher and a Lahinch links round; family days on the Aran Islands and the Burren.",
  },
  {
    title: "A wedding or family event",
    text: "Base near your venue, and we plan the around-days — where to stay, how to get there, and what to do with the kids before and after.",
  },
  {
    title: "Two weeks: golf + family",
    text: "Week one on the Clare coast — Lahinch and Trump Doonbeg tee times, the Cliffs, Doolin. Week two in the Boyne Valley — Newgrange, a Dublin day trip, and Funtasia for the kids.",
  },
  {
    title: "The no-golf family route",
    text: "Boyne Valley first (Newgrange, Funtasia Waterpark, Hill of Slane), then the Clare coast (Cliffs of Moher, Lahinch beach, Aran Islands).",
  },
];

const FAQS = [
  {
    question: "What kind of trips do you plan?",
    answer:
      "Any trip to Ireland — golf breaks, family holidays, weddings and events, Paddy's weekend, work trips and the Ryder Cup 2027. If you're coming for an event, we plan the around-days too.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "For major events like the Ryder Cup, as early as possible — accommodation near Adare Manor sells out months ahead. For a general Ireland trip, three to six months ahead is ideal for peak summer dates.",
  },
  {
    question: "What does the bespoke plan include?",
    answer:
      "Accommodation in our own Irish houses, plus the itinerary and bookings we arrange for you — transport and event planning, tee times and family days out. Flights, event tickets and some activities are arranged separately.",
  },
  {
    question: "Can you plan a trip if nobody in the group plays golf?",
    answer:
      "Yes. The concierge service is for any family or group trip to Ireland — coast, history, castles, food and the kids' days out. Golf is optional.",
  },
  {
    question: "Do you have a minimum group size or stay?",
    answer:
      "We tailor trips to your group, from a single family to a golf group or two families travelling together. Minimum stays vary by property and season — send us your dates and we'll confirm.",
  },
  {
    question: "How do we get started?",
    answer:
      "Email hello@sosstays.com or use the form below with your ideal month, group size and what everyone wants to do. We'll come back with a plan and a price.",
  },
];

function buildBespokeTripServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Bespoke Ireland Trip Planning & Concierge",
    serviceType: "Bespoke Ireland trip planning and concierge",
    description:
      "Bespoke concierge for families and groups travelling to Ireland — accommodation in our Irish houses, event and transport planning, golf tee times and family itineraries, for events like the Ryder Cup, weddings and Paddy's weekend.",
    provider: {
      "@type": "Organization",
      name: "SOS Stays",
      url: "https://sosstays.com",
      email: "hello@sosstays.com",
    },
    areaServed: { "@type": "Country", name: "Ireland" },
  };
}

function buildBespokeTripOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SOS Stays",
    url: "https://sosstays.com",
    email: "hello@sosstays.com",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@sosstays.com",
      contactType: "customer service",
      areaServed: "IE",
    },
  };
}

export default async function BespokeIrelandTripPage() {
  const siteNavLinks = await getGuestSiteNavLinks();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Bespoke Ireland Trip", url: `${SITE_URL}/bespoke-ireland-trip` },
  ]);
  const faqSchema = buildFaqSchema(FAQS);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={buildBespokeTripServiceSchema()} />
      <JsonLd data={buildBespokeTripOrganizationSchema()} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* HERO */}
      <section className="relative bg-deep-forest px-8 pt-[180px] pb-20 sm:px-14 sm:pt-[200px]">
        <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" />
        <div className="mx-auto max-w-[760px]">
          <Eyebrow className="mb-4" tone="sage" delay={0}>
            Bespoke trips
          </Eyebrow>
          <Reveal as="h1" delay={130} className="mb-5 font-serif text-4xl leading-[1.08] font-extrabold tracking-tight text-cream sm:text-6xl">
            Plan Your Bespoke Ireland Trip
          </Reveal>
          <Reveal as="p" delay={200} className="mb-6 max-w-2xl text-xl font-semibold leading-snug text-light-sage">
            Our houses, your itinerary, one point of contact — whether it&apos;s the Ryder Cup, a
            wedding, Paddy&apos;s weekend or a family holiday.
          </Reveal>
          <Reveal as="p" delay={260} className="max-w-2xl text-lg leading-relaxed text-cream/88">
            You didn&apos;t come all this way to juggle bookings. Tell us what your family loves —
            golf, coast, castles, quiet countryside — and we&apos;ll build the trip around it, using
            our own houses across Ireland and a local&apos;s knowledge of what&apos;s actually worth
            the drive.
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
        <Reveal
          as="h2"
          className="mb-11 max-w-[26ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
        >
          How it works
        </Reveal>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item, i) => (
            <Reveal
              key={item.number}
              delay={i * 100}
              className="rounded-[18px] border border-sage-grey/40 bg-light-forest-green/40 p-7"
            >
              <span className="font-serif text-4xl font-semibold text-maroon">{item.number}</span>
              <h3 className="mt-3 font-serif text-xl font-bold text-forest-green">{item.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-near-black/75">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHAT WE ARRANGE */}
      <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
        <Reveal
          as="h2"
          className="mb-8 max-w-[22ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
        >
          What we arrange
        </Reveal>
        <Reveal delay={100}>
          <ul className="grid max-w-3xl grid-cols-1 gap-3">
            {WHAT_WE_ARRANGE.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-near-black/80">
                <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-maroon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* THE HOUSES */}
      <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
        <Reveal
          as="h2"
          className="mb-10 font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
        >
          The houses
        </Reveal>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Reveal>
            <PropertyCard
              slug="howards-way-liscannor"
              name="Howard's Way"
              location="Liscannor, Co. Clare"
              shortDescription="Four bedrooms, sleeps 8, sea views over Liscannor Bay. Five minutes to the Cliffs of Moher, ten to Lahinch."
              surface="framed"
              hideSleeps
            />
          </Reveal>
          <Reveal delay={100}>
            <PropertyCard
              slug="rathescar-grove-guest-house"
              name="Rathescar Grove Guest House"
              location="Ardee, Co. Louth"
              shortDescription="Three rooms, sleeps up to 10, mountain and farmland views. Near Newgrange and the Boyne Valley, 50 minutes from Dublin Airport."
              surface="framed"
              hideSleeps
            />
          </Reveal>
        </div>
        <Reveal delay={180} as="p" className="mt-6 text-[15px] font-medium text-near-black/60">
          More across Ireland — ask us.
        </Reveal>
      </section>

      {/* EXPLORE IRELAND BY AREA */}
      <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
        <Reveal
          as="p"
          className="mb-3.5 text-[13px] font-semibold tracking-[0.2em] text-forest-green/80 uppercase"
        >
          Plan your route
        </Reveal>
        <Reveal
          as="h2"
          delay={80}
          className="mb-10 max-w-[24ch] font-serif text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.06] font-bold tracking-tight text-deep-forest"
        >
          Explore Ireland by area
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {AREAS.map((area, i) => (
            <Reveal key={area.href} delay={140 + i * 80}>
              <a
                href={area.href}
                className="group block h-full rounded-[14px] border border-sage-grey/40 bg-light-forest-green/15 p-6.5 transition-colors hover:border-light-sage hover:bg-light-forest-green/35"
              >
                <h3 className="font-serif text-lg font-bold text-forest-green">{area.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-near-black/70">{area.description}</p>
                <span className="mt-3.5 inline-block text-[13.5px] font-semibold text-maroon">See the guide →</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SAMPLE ITINERARIES */}
      <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
        <Reveal
          as="h2"
          className="mb-10 max-w-[22ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
        >
          Sample itineraries
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ITINERARIES.map((it, i) => (
            <Reveal
              key={it.title}
              delay={i * 90}
              className="rounded-[18px] border border-sage-grey/40 bg-cream p-7"
            >
              <h3 className="font-serif text-lg font-bold text-maroon">{it.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-near-black/78">{it.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <div className="pt-28">
        <FaqSection
          id="faq"
          heading="Frequently asked questions"
          items={FAQS}
          accent="forest-green"
          maxWidth="820px"
        />
      </div>

      {/* ENQUIRE */}
      <section id="enquire" className="mx-auto max-w-3xl px-8 pb-28 sm:px-14">
        <Reveal
          as="h2"
          className="mb-3 font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
        >
          Enquire
        </Reveal>
        <Reveal as="p" delay={80} className="mb-9 text-lg leading-relaxed text-near-black/72">
          Tell us about your trip and we&apos;ll come back with a plan and a price.
        </Reveal>
        <Reveal delay={140}>
          <BespokeTripForm />
        </Reveal>
      </section>
    </main>
  );
}
