import type { Metadata } from "next";
import Image from "next/image";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { FaqSection } from "@/components/FaqSection";
import { BespokeTripForm } from "@/components/BespokeTripForm";
import { DetailsScrollStack, type DetailItem } from "@/components/DetailsScrollStack";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

const TITLE = "Bespoke Ireland Trips & Concierge | SOS Stays";
const DESCRIPTION =
  "Plan your Ireland trip end to end with SOS Stays — accommodation in our Irish houses, event and transport planning, golf and family days out. One point of contact.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: TITLE, description: DESCRIPTION }, "/bespoke-ireland-trip");
}

// Real photos already in the site's Sanity media library (area guides +
// property galleries) — nothing stock, nothing fabricated. Picked for best
// thematic fit per category rather than a literal 1:1 match (e.g. a
// scenic-drive shot standing in for "transfers"), same way the reference
// design uses mood photography rather than literal illustrations.
const HERO_IMAGE = {
  url: "https://cdn.sanity.io/images/owyw3r12/production/29786bb88263264fc62be8146552d603fd412e2e-1536x1024.png",
  alt: "Aerial view of the Cliffs of Moher in County Clare, Ireland",
};

const DETAIL_ITEMS: DetailItem[] = [
  {
    label: "Airport pick-up",
    icon: "Plane",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/2f33113aea497682f061a930c964ec83cd71977c-3962x2950.jpg",
    imageAlt: "Scenic coastal drive on the Cooley Peninsula, Co. Louth",
  },
  {
    label: "Local accommodation",
    icon: "Home",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/8fc9ee68034dce36cb214469adc68ad9d6f1650b-1200x800.avif",
    imageAlt: "Living room at Howard's Way, Liscannor, Co. Clare",
  },
  {
    label: "Sightseeing trips",
    icon: "Camera",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/a1fbbc22a975d7e597cafb4ea2dd4cf73d09be89-2400x1350.jpg",
    imageAlt: "Aerial view of the Cliffs of Moher, Co. Clare",
  },
  {
    label: "Golf tee bookings",
    icon: "Flag",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/b15f449e96cc20b2768a535ac814d2bab7cb2df2-1800x1000.jpg",
    imageAlt: "Lahinch Golf Club, Co. Clare",
  },
  {
    label: "Tour packages",
    icon: "Compass",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/164beb4517436378325080bced2767ccbcd4a3f7-2592x1944.jpg",
    imageAlt: "Entrance to Newgrange passage tomb, Brú na Bóinne",
  },
  {
    label: "Local transfers",
    icon: "Car",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/d1a1f23a0e6eefdcfa53af4748978ac0fd3f7fc1-1024x759.jpg",
    imageAlt: "Farmland road through the Boyne Valley, Co. Louth",
  },
];

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

const HOUSES = [
  {
    name: "Howard's Way",
    location: "Liscannor, Co. Clare",
    description:
      "Four bedrooms, sleeps 8, sea views over Liscannor Bay. Five minutes to the Cliffs of Moher, ten to Lahinch.",
    href: "/stays/howards-way-liscannor",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/c1941a76ff83e732e15406817f576f9cb07dd3d7-6089x4059.jpg",
    imageAlt: "Master bedroom at Howard's Way, Liscannor, Co. Clare",
  },
  {
    name: "Rathescar Grove Guest House",
    location: "Ardee, Co. Louth",
    description:
      "Three rooms, sleeps up to 10, mountain and farmland views. Near Newgrange and the Boyne Valley, 50 minutes from Dublin Airport.",
    href: "/stays/rathescar-grove-guest-house",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/91f432088afa7bf10b863f1e5cc49d205f471d72-1448x1086.png",
    imageAlt: "Rathescar Grove Guest House, Ardee, Co. Louth",
  },
];

const AREAS = [
  {
    title: "Liscannor & the Cliffs of Moher",
    description: "The Clare coast: the Cliffs, Lahinch, the Burren, the Aran Islands.",
    href: "/areas/liscannor-cliffs-of-moher",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/a1fbbc22a975d7e597cafb4ea2dd4cf73d09be89-2400x1350.jpg",
    imageAlt: "Aerial view of the Cliffs of Moher, Co. Clare",
  },
  {
    title: "The Boyne Valley & Ardee",
    description: "Newgrange, Funtasia, the Hill of Slane, 50 minutes from Dublin.",
    href: "/areas/boyne-valley-ardee",
    imageUrl:
      "https://cdn.sanity.io/images/owyw3r12/production/094b90b907f8217d1f4b26f4607a3acb6169ffff-5464x3640.jpg",
    imageAlt: "The Boyne Valley, Co. Louth",
  },
  {
    title: "More areas across Ireland",
    description: "See every area guide on the site.",
    href: "/areas",
    imageUrl: null,
    imageAlt: "",
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
      <section className="relative flex min-h-[86vh] flex-col justify-end overflow-hidden bg-deep-forest px-8 pt-[180px] pb-16 sm:px-14 sm:pt-[200px]">
        <div className="absolute inset-[-10%_0]">
          <Image
            src={HERO_IMAGE.url}
            alt={HERO_IMAGE.alt}
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center 55%" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-deep-forest/70 via-deep-forest/40 to-deep-forest/88" />

        <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" />

        <div className="relative mx-auto w-full max-w-[760px]">
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

      {/* WE TAKE CARE OF EVERY DETAIL — scroll-converge photo stack */}
      <DetailsScrollStack
        eyebrow="What we handle"
        heading="We Take Care of Every"
        headingAccent="Detail"
        items={DETAIL_ITEMS}
      />

      {/* HOW IT WORKS */}
      <section className="bg-light-forest-green/25 px-8 py-28 sm:px-14">
        <div className="mx-auto max-w-6xl">
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
                className="rounded-[18px] border border-sage-grey/40 bg-cream p-7"
              >
                <span className="font-serif text-4xl font-semibold text-maroon">{item.number}</span>
                <h3 className="mt-3 font-serif text-xl font-bold text-forest-green">{item.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-near-black/75">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE ARRANGE */}
      <section className="bg-maroon px-8 py-28 sm:px-14">
        <div className="mx-auto max-w-6xl">
          <Reveal
            as="h2"
            className="mb-8 max-w-[22ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-cream"
          >
            What we arrange
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid max-w-3xl grid-cols-1 gap-3">
              {WHAT_WE_ARRANGE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-cream/88">
                  <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-light-sage" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
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
          {HOUSES.map((house, i) => (
            <Reveal key={house.href} delay={i * 100}>
              <a
                href={house.href}
                className="group block overflow-hidden rounded-[18px] border border-sage-grey/40 bg-bright-cream transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={house.imageUrl}
                    alt={house.imageAlt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6.5">
                  <span className="text-[11.5px] font-semibold tracking-[0.14em] text-maroon uppercase">
                    {house.location}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-bold text-forest-green">{house.name}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-near-black/72">{house.description}</p>
                  <span className="mt-3.5 inline-block text-[13.5px] font-semibold text-forest-green">
                    See the stay →
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal delay={180} as="p" className="mt-6 text-[15px] font-medium text-near-black/60">
          More across Ireland — ask us.
        </Reveal>
      </section>

      {/* EXPLORE IRELAND BY AREA */}
      <section className="bg-warm-cream px-8 py-28 sm:px-14">
        <div className="mx-auto max-w-6xl">
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
                  className="group relative block h-[300px] overflow-hidden rounded-[14px] border border-sage-grey/40 bg-deep-forest"
                >
                  {area.imageUrl ? (
                    <>
                      <Image
                        src={area.imageUrl}
                        alt={area.imageAlt}
                        fill
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-light-forest-green/20" />
                  )}
                  <div className="absolute right-5 bottom-5 left-5">
                    <h3 className={`font-serif text-lg font-bold ${area.imageUrl ? "text-cream" : "text-forest-green"}`}>
                      {area.title}
                    </h3>
                    <p className={`mt-1.5 text-[13.5px] leading-relaxed ${area.imageUrl ? "text-cream/85" : "text-near-black/70"}`}>
                      {area.description}
                    </p>
                    <span className={`mt-3 inline-block text-[13px] font-semibold ${area.imageUrl ? "text-light-sage" : "text-maroon"}`}>
                      See the guide →
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
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
              className="rounded-[18px] border border-sage-grey/40 bg-light-forest-green/20 p-7"
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

      {/* START THE CONVERSATION */}
      <section id="enquire" className="bg-maroon px-8 py-28 sm:px-14">
        <div className="mx-auto max-w-3xl">
          <Reveal
            as="h2"
            className="mb-3 font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-cream"
          >
            Start the conversation
          </Reveal>
          <Reveal as="p" delay={80} className="mb-9 text-lg leading-relaxed text-cream/85">
            Tell us about your trip and we&apos;ll come back with a plan and a price.
          </Reveal>
          <Reveal delay={140}>
            <BespokeTripForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
