import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { ABOUT_PAGE_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { FaqSection } from "@/components/FaqSection";
import { AccordionPanel } from "@/components/Accordion";
import { SocialIcons } from "@/components/SocialIcons";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(ABOUT_PAGE_QUERY);
  return buildMetadata(
    {
      title: page?.seo?.title || "About Sos Stays | Irish Holiday Homes & Property Management",
      description:
        page?.seo?.description ||
        "Sos Stays is an Irish property management company. We look after holiday homes and Airbnbs the length of the country, and we book guests in direct.",
      image: page?.seo?.image,
      noIndex: page?.seo?.noIndex,
    },
    "/about"
  );
}

// ---- Fallback content ----
// This page is driven by the "About Page" singleton in Sanity (studio/
// schemaTypes/documents/aboutPage.ts). Everything below is what renders
// if that document hasn't been created yet, or a given field is left
// blank — the page should never ship half-empty just because an editor
// hasn't filled in every field. Some team bios below intentionally keep
// bracketed placeholder text (e.g. "[fill in]") straight from the draft
// copy — that's real draft content, not a bug, until it's replaced in
// Studio.

type ImageSlot = { src: string; alt: string };

const DEFAULT_HERO_IMAGE: ImageSlot = {
  src: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1800&q=80",
  alt: "",
};

const DEFAULT_COVERAGE_IMAGE: ImageSlot = {
  src: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1800&q=80",
  alt: "",
};

const DEFAULT_WHAT_WE_DO = [
  {
    title: "Guest stays",
    body: "Self-catering houses and a guest house you can book direct, without paying the Airbnb premium.",
  },
  {
    title: "Landlord management",
    body: "Listings, pricing, guest messaging, cleaning coordination and owner statements, sorted. Commission-only, from 15% of rental revenue. No setup fee, no retainer, no booking, no fee.",
  },
  {
    title: "Corporate & contractor stays",
    body: "Weekly and monthly furnished houses, one invoice, no fuss.",
  },
];

const DEFAULT_REGIONS = [
  { name: "Louth & Meath", status: "Home ground", muted: false },
  { name: "Co. Clare", status: "Live stay — Liscannor", muted: false },
  { name: "Co. Wexford", status: "Live stay — Ferns", muted: false },
  { name: "Wicklow & the east coast", status: "Corporate stays", muted: true },
];

const DEFAULT_FEATURED_STAYS = [
  {
    name: "Howard's Way",
    href: "/stays/howards-way-liscannor",
    location: "Liscannor, Co. Clare",
    description: "A 4-bed house above Liscannor Bay, sleeps 8, five minutes from the Cliffs of Moher.",
  },
  {
    name: "Rathescar Grove Guest House",
    href: "/stays/rathescar-grove-guest-house",
    location: "Ardee, Co. Louth",
    description: "A guest house outside Ardee, your base for the Boyne Valley.",
  },
  {
    name: "Tinneshrule Farm Lodge",
    href: "/stays/tinneshrule-farm-lodge",
    location: "Ferns, Co. Wexford",
    description: "A working-farm studio in Ferns. No TV, strong WiFi, does what it says on the tin.",
  },
];

const DEFAULT_TEAM = [
  {
    name: "Andrine Mendez",
    title: "Chief Fáilte Officer",
    plainTitle: "Co-Founder, Marketing & Guest Experience",
    bio: '[One line on background/profession — e.g. "Andrine spent X years in ___ before co-founding Sos Stays."] A [favourite place travelled/lived — fill in] convinced her that the best trips are the ones where someone local already sorted the hard part for you, which is more or less the whole Sos Stays pitch. At Sos Stays, Andrine runs the brand, the listings, the guest experience and most of what you see online — if it sounds like us, she probably wrote it.',
  },
  {
    name: "Akhil Edathara Asokan",
    title: "Chief Airgead Officer",
    plainTitle: "Co-Founder, Sales, Operations & Finance",
    bio: "[One line on background/profession — fill in.] Time spent in [place — fill in] left him with a healthy respect for a good spreadsheet and an even better host. At Sos Stays, Akhil handles the landlord side end to end — the pitch, the numbers, the paperwork, and making sure owners actually get paid on time.",
  },
  {
    name: "Keena Duffy",
    title: "Chief Saoiste Officer",
    plainTitle: "Co-Founder, Operations & Property Management",
    bio: "[One line on background/profession — fill in.] [Travel note — fill in], and came away thinking the difference between a good stay and a forgettable one usually comes down to someone paying attention to the small stuff. At Sos Stays, Keena's the one on the ground — property condition, cleaning schedules, guest calls when something needs sorting, and generally keeping every property honest.",
  },
];

const DEFAULT_WORK_CATEGORIES = [
  {
    title: "Cleaning & turnover teams",
    body: 'If you run a cleaning business (or you\'re a solo cleaner who takes pride in the work) around Louth, Meath, Clare or Wexford, we\'d like to hear from you. Reliable, flexible, and happy to work off a proper checklist rather than "just wing it."',
  },
  {
    title: "Freelancers & contractors",
    body: "Photographers, maintenance and handyman contractors, and anyone else who keeps a property in good nick. Bring your own tools and your own rates; we bring you consistent work across our managed properties.",
  },
  {
    title: "Partners",
    body: "We also team up with local businesses to make a stay better than just a bed for the night — the likes of Funtasia and Tranquil Space, among others. If that sounds like your business, get in touch about a partnership.",
  },
];

const DEFAULT_FAQS = [
  {
    question: "What is Sos Stays?",
    answer:
      "An Irish property management company. We look after holiday homes and Airbnbs for landlords, and we book stays direct for guests.",
  },
  {
    question: "Where does Sos Stays operate?",
    answer:
      "Nationally — home ground is Louth, Meath and the Mournes, with live stays in Clare and Wexford and corporate stays along the east coast.",
  },
  {
    question: "Who owns Sos Stays?",
    answer: "Power Rangers Ltd (CRO 746631), trading as Sos Stays.",
  },
  {
    question: "Is Sos Stays a registered Irish company?",
    answer:
      "Yes. Power Rangers Ltd is registered in Ireland. CRO 746631. Office: The Mill Enterprise Centre, Drogheda, Co. Louth.",
  },
  {
    question: "How much does Sos Stays charge landlords?",
    answer: "Commission-only, from 15% of rental revenue. No setup fee, no monthly retainer.",
  },
];

function GuestKeyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L12 3l9 7.5M5 9.5V20h14V9.5M9.5 20v-6h5v6"
        stroke="var(--forest-green)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LandlordIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M9 11h.01M15 11h.01"
        stroke="var(--maroon)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CorporateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16v12H4V7Zm4 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 12h16"
        stroke="var(--deep-forest)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const WHAT_WE_DO_ICONS = [GuestKeyIcon, LandlordIcon, CorporateIcon];

export default async function AboutUsPage() {
  const [data, siteNavLinks] = await Promise.all([client.fetch(ABOUT_PAGE_QUERY), getGuestSiteNavLinks()]);

  const heroImage: ImageSlot = data?.heroImage
    ? { src: urlFor(data.heroImage).width(1800).url(), alt: data.heroImage.alt ?? "" }
    : DEFAULT_HERO_IMAGE;

  const coverageImage: ImageSlot = data?.coverageImage
    ? { src: urlFor(data.coverageImage).width(1800).url(), alt: data.coverageImage.alt ?? "" }
    : DEFAULT_COVERAGE_IMAGE;

  const whatWeDoItems = data?.whatWeDoItems?.length ? data.whatWeDoItems : DEFAULT_WHAT_WE_DO;
  const regions = data?.regions?.length ? data.regions : DEFAULT_REGIONS;
  const featuredStays = data?.featuredStays?.length ? data.featuredStays : DEFAULT_FEATURED_STAYS;
  const teamMembers = data?.teamMembers?.length ? data.teamMembers : DEFAULT_TEAM;
  const workCategories = data?.workWithUsCategories?.length ? data.workWithUsCategories : DEFAULT_WORK_CATEGORIES;
  const faqs = data?.faqs?.length ? data.faqs : DEFAULT_FAQS;

  const reachUsEmail = data?.reachUsEmail || "hello@sosstays.com";
  const reachUsWhatsapp = data?.reachUsWhatsapp || "+353 89 480 1345";
  const reachUsWhatsappUrl = data?.reachUsWhatsappUrl || "https://wa.me/353894801345";
  const reachUsInstagramHandle = data?.reachUsInstagramHandle || "@sos_stays";
  const reachUsInstagramUrl = data?.reachUsInstagramUrl || "https://www.instagram.com/sos_stays/";
  const ownershipCroLinkLabel = data?.ownershipCroLinkLabel || "Companies Registration Office";
  const ownershipCroLinkUrl = data?.ownershipCroLinkUrl || "https://www.cro.ie/";

  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/landlords" ctaLabel="Send your SOS" sticky />
      <main className="overflow-x-hidden bg-cream text-near-black">
        {/* HERO */}
        <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-deep-forest">
          <Image src={heroImage.src} alt={heroImage.alt} fill priority className="object-cover opacity-40" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(38,52,37,.94) 8%, rgba(38,52,37,.55) 60%, rgba(38,52,37,.25) 100%)",
            }}
          />
          <div
            aria-hidden
            className="about-drift pointer-events-none absolute top-[8%] right-[-90px] w-[440px] opacity-10 [animation:about-drift_22s_ease-in-out_infinite]"
            style={{
              backgroundImage: "url('/logo-varient-sm.svg')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              aspectRatio: "387.54 / 398.11",
              filter: "brightness(0) invert(1)",
            }}
          />
          <div className="relative mx-auto w-full max-w-[1200px] px-8 py-24 sm:px-14">
            <Reveal className="font-serif mb-8 inline-block rounded-full border border-cream/30 px-[18px] py-2 text-xs font-semibold tracking-widest text-light-sage uppercase">
              {data?.heroBadge || "About us"}
            </Reveal>
            <Reveal
              as="h1"
              delay={120}
              className="font-serif max-w-[20ch] text-[38px] leading-[1.08] font-extrabold tracking-tight text-cream sm:text-6xl lg:text-[74px]"
            >
              {data?.heroHeading || "We're Sos Stays. We sell the break, not just the booking."}
            </Reveal>
          </div>
        </section>

        {/* INTRO */}
        <section className="mx-auto max-w-[820px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal>
            <p className="mb-6 text-xl leading-relaxed text-near-black sm:text-2xl">
              {data?.introParagraph1 ||
                "Sós is the Irish word for a break. That's the whole idea, really — we named the company after the thing we're actually selling."}
            </p>
            <p className="mb-6 text-base leading-loose text-near-black/80">
              {data?.introParagraph2 ||
                "Sos Stays is the trading name of Power Rangers Ltd, an Irish company (CRO 746631) based in Drogheda, Co. Louth — but we're not a Louth company that happens to manage a few extra places. We manage short-term rentals for landlords and take direct bookings for guests right across Ireland, from the Boyne Valley to the Cliffs of Moher."}
            </p>
            <p className="text-base leading-loose text-near-black/80">
              {data?.introParagraph3 ||
                "Most Airbnb management companies list a property and wait for the phone to ring. We do the opposite: we market the place and the area, write the guides people actually search for, chase direct bookings so owners keep more of what they earn, and build a guest experience good enough that people come back without needing an algorithm to remind them."}
            </p>
          </Reveal>
        </section>

        {/* WHAT WE DO */}
        <section className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="mb-14 max-w-[620px]">
              <Eyebrow className="mb-4">{data?.whatWeDoEyebrow || "What we do"}</Eyebrow>
              <h2 className="font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-forest-green sm:text-4xl">
                {data?.whatWeDoHeading || "Three ways we work"}
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {whatWeDoItems.map((item: { title: string; body: string }, i: number) => {
                const Icon = WHAT_WE_DO_ICONS[i] ?? GuestKeyIcon;
                return (
                  <Reveal
                    key={item.title}
                    delay={i * 100}
                    className="flex flex-col rounded-[18px] border border-sage-grey/25 bg-cream p-8"
                  >
                    <Icon />
                    <h3 className="font-serif mt-5 mb-2.5 text-xl font-bold text-deep-forest">{item.title}</h3>
                    <p className="text-[15px] leading-loose text-near-black/70">{item.body}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* WHERE WE OPERATE */}
        <section className="relative overflow-hidden bg-deep-forest">
          <Image src={coverageImage.src} alt={coverageImage.alt} fill className="object-cover opacity-[.34]" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgba(38,52,37,.93), rgba(38,52,37,.6))" }}
          />
          <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-8 py-24 sm:px-14 sm:py-32 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Eyebrow className="mb-4" tone="sage">{data?.coverageEyebrow || "Where we operate"}</Eyebrow>
              <h2 className="font-serif mb-6 text-[30px] leading-[1.1] font-bold tracking-tight text-cream sm:text-4xl lg:text-[42px]">
                {data?.coverageHeading || "Home ground, not the only ground"}
              </h2>
              <p className="text-lg leading-loose text-light-sage">
                {data?.coverageBody ||
                  'Louth, Meath, the Boyne Valley and the Mournes are home ground — it\'s where we started and where most of our team is based. But "home ground" isn\'t the same as "only ground": we\'ve got stays live in Liscannor on the Clare coast and out in Ferns, Co. Wexford, and corporate stays run the east coast corridor including Wicklow. If you own a place worth a proper look, we\'re interested — wherever in Ireland it is.'}
              </p>
            </Reveal>
            <Reveal delay={150} className="flex flex-col">
              {regions.map((region: { name: string; status: string; muted?: boolean | null }) => (
                <div key={region.name} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-cream/15 py-6 last:border-b-0">
                  <span className={`font-serif text-xl font-bold sm:text-2xl ${region.muted ? "text-light-sage" : "text-cream"}`}>
                    {region.name}
                  </span>
                  <span className="text-xs tracking-widest text-light-sage uppercase">{region.status}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* THE STAYS */}
        <section className="mx-auto max-w-[1200px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal className="mb-12">
            <h2 className="font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-forest-green sm:text-4xl">
              {data?.staysHeading || "The stays"}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredStays.map(
              (
                stay: {
                  name: string;
                  href: string;
                  location?: string;
                  description: string;
                  image?: { alt?: string } | null;
                },
                i: number
              ) => (
                <Reveal key={stay.href} delay={i * 100}>
                  <Link
                    href={stay.href}
                    className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-sage-grey/25 bg-cream p-3 transition-colors hover:bg-pale-sage/40"
                  >
                    {stay.image ? (
                      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-[14px]">
                        <Image
                          src={urlFor(stay.image).width(600).height(450).url()}
                          alt={stay.image.alt ?? stay.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col px-2 pb-2">
                      {stay.location ? (
                        <p className="mb-2 text-xs font-semibold tracking-widest text-near-black/50 uppercase">
                          {stay.location}
                        </p>
                      ) : null}
                      <h3 className="font-serif mb-2.5 text-xl font-bold text-deep-forest group-hover:underline">
                        {stay.name}
                      </h3>
                      <p className="flex-1 text-[15px] leading-loose text-near-black/70">{stay.description}</p>
                      <span className="mt-4 text-sm font-semibold text-forest-green">See the stay →</span>
                    </div>
                  </Link>
                </Reveal>
              )
            )}
          </div>
        </section>

        {/* MEET THE TEAM */}
        <section className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="mb-14 max-w-[720px]">
              <Eyebrow className="mb-4">{data?.teamEyebrow || "Meet the team"}</Eyebrow>
              <h2 className="font-serif mb-4 text-[30px] leading-[1.1] font-bold tracking-tight text-forest-green sm:text-4xl">
                {data?.teamHeading || "Meet the team"}
              </h2>
              <p className="text-base leading-loose text-near-black/70">
                {data?.teamIntro ||
                  "We kept the job titles a bit Irish — see the plain version in brackets on each card if the Irish doesn't land."}
              </p>
            </Reveal>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {teamMembers.map(
                (
                  member: { name: string; title: string; plainTitle: string; bio: string; photo?: { alt?: string } | null },
                  i: number
                ) => (
                  <Reveal key={member.name} delay={i * 100} className="flex flex-col rounded-[18px] border border-sage-grey/25 bg-cream p-7">
                    {member.photo ? (
                      <div className="relative mb-5 h-20 w-20 overflow-hidden rounded-full">
                        <Image
                          src={urlFor(member.photo).width(160).height(160).url()}
                          alt={member.photo.alt ?? member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pale-sage text-2xl font-semibold text-forest-green">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-serif text-lg font-bold text-deep-forest">{member.name}</h3>
                    <p className="mb-4 text-sm font-semibold text-maroon">
                      {member.title} <span className="font-normal text-near-black/55">({member.plainTitle})</span>
                    </p>
                    <p className="text-[14px] leading-relaxed text-near-black/70">{member.bio}</p>
                  </Reveal>
                )
              )}
            </div>
          </div>
        </section>

        {/* WORK WITH US */}
        <section className="mx-auto max-w-[1200px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal className="mb-12 max-w-[720px]">
            <Eyebrow className="mb-4">{data?.workWithUsEyebrow || "Work with us"}</Eyebrow>
            <h2 className="font-serif mb-4 text-[30px] leading-[1.1] font-bold tracking-tight text-forest-green sm:text-4xl">
              {data?.workWithUsHeading || "Work with us"}
            </h2>
            <p className="text-base leading-loose text-near-black/70">
              {data?.workWithUsIntro ||
                "We're not looking to build a big office. We're looking for good people and good businesses already great at one thing, in the places we operate."}
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-0 border-t border-sage-grey/25 md:grid-cols-3">
            {workCategories.map((cat: { title: string; body: string }, i: number) => (
              <Reveal
                key={cat.title}
                delay={i * 100}
                className={`border-b border-sage-grey/25 py-8 md:py-9 ${
                  i < workCategories.length - 1 ? "md:border-r md:pr-8" : ""
                } ${i > 0 ? "md:pl-8" : ""}`}
              >
                <h3 className="font-serif mb-2.5 text-lg font-bold text-deep-forest">{cat.title}</h3>
                <p className="text-[15px] leading-loose text-near-black/70">{cat.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300} className="mt-9">
            <p className="mb-2 text-sm italic text-near-black/55">
              {data?.workWithUsPartnerNote ||
                "A dedicated partnerships page with full partner profiles is coming — this is a teaser until that's built."}
            </p>
            <p className="text-base leading-loose text-near-black">
              {(data?.workWithUsContactLine ||
                "Send a line about what you do and where you're based to hello@sosstays.com — no CV required, just tell us straight."
              )
                .split(reachUsEmail)
                .flatMap((part: string, i: number, arr: string[]) =>
                  i < arr.length - 1
                    ? [part, <a key={i} href={`mailto:${reachUsEmail}`} className="font-semibold text-forest-green underline">{reachUsEmail}</a>]
                    : [part]
                )}
            </p>
          </Reveal>
        </section>

        {/* WHO OWNS US / HOW TO REACH US — collapsed accordions */}
        <section className="bg-pale-sage px-8 py-16 sm:px-14">
          <div className="mx-auto max-w-[820px] border-t border-sage-grey/40">
            <AccordionPanel title={data?.ownershipHeading || "Who owns Sos Stays"}>
              <p>
                {data?.ownershipBody ||
                  "Power Rangers Ltd, trading as Sos Stays. Registered in Ireland, CRO 746631. Registered office: The Mill Enterprise Centre, Drogheda, Co. Louth, Ireland."}
              </p>
              <p className="mt-3">
                You can check the company on the{" "}
                <a href={ownershipCroLinkUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest-green underline">
                  {ownershipCroLinkLabel}
                </a>{" "}
                register.
              </p>
            </AccordionPanel>
            <AccordionPanel title={data?.reachUsHeading || "How to reach us"}>
              <ul className="flex flex-col gap-2">
                <li>
                  Email:{" "}
                  <a href={`mailto:${reachUsEmail}`} className="font-semibold text-forest-green underline">
                    {reachUsEmail}
                  </a>
                </li>
                <li>
                  WhatsApp:{" "}
                  <a href={reachUsWhatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest-green underline">
                    {reachUsWhatsapp}
                  </a>
                </li>
                <li>
                  Instagram:{" "}
                  <a href={reachUsInstagramUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest-green underline">
                    {reachUsInstagramHandle}
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="font-semibold text-forest-green underline">
                    Contact form
                  </Link>
                </li>
              </ul>
              <SocialIcons
                links={[
                  { platform: "instagram", url: reachUsInstagramUrl },
                  { platform: "whatsapp", url: reachUsWhatsappUrl },
                ]}
                className="bg-cream text-forest-green hover:bg-forest-green hover:text-cream"
              />
            </AccordionPanel>
          </div>
        </section>

        {/* FAQ */}
        <div className="pt-16">
          <FaqSection heading={data?.faqHeading || "FAQ"} items={faqs} accent="forest-green" />
        </div>
      </main>
    </>
  );
}
