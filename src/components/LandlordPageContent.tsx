import Image from "next/image";
import landlordHeroImage from "@/assets/images/landlord.png";
import { Poppins } from "next/font/google";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY, AUDIENCE_TABS_QUERY, LANDLORD_BLOG_POSTS_QUERY } from "@/sanity/queries";
import { JsonLd, buildServiceSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { LANDLORD_NAV_LINKS } from "@/lib/navLinks";
import { LandlordLeadForm } from "@/components/LandlordLeadForm";
import { FaqSection } from "@/components/FaqSection";
import { Button } from "@/components/Button";
import { AudienceTabs } from "@/components/AudienceTabs";
import { RelatedBlogsSection } from "@/components/RelatedBlogsSection";
import { GapChart } from "@/components/GapChart";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { COMMISSION_RANGE, MAINTENANCE_AUTHORITY_EUR } from "@/lib/businessFacts";

type LandlordPage = {
  title?: string;
  slug?: string;
  heroStatement?: string;
  proofPoints?: string[] | null;
  body?: any;
  faqs?: { question: string; answer: string }[] | null;
};

const HOW_IT_WORKS_STATS = [
  {
    stat: COMMISSION_RANGE,
    title: "Commission only",
    description:
      "Of gross booking revenue. Cleaning fees excluded. No setup fee, no monthly retainer.",
  },
  {
    stat: "€0",
    title: "No booking, no fee",
    description:
      "We only get paid when your property does. Nothing owed on empty nights.",
  },
  {
    stat: `€${MAINTENANCE_AUTHORITY_EUR}`,
    title: "Maintenance authority",
    description: `We handle anything up to €${MAINTENANCE_AUTHORITY_EUR} without bothering you. Above that, we call first.`,
  },
  {
    stat: "Your call",
    title: "Cleaning",
    description:
      "Keep your existing cleaner, or we source one from our network. Either way, it's covered.",
  },
];

const MARKET_STATS = [
  { stat: "20–35%", caption: "typical underearning for hosts managing solo" },
  {
    stat: "2–3×",
    caption: "revenue potential vs. a long-term let, corridor-wide",
  },
  { stat: "80%+", caption: "peak-season occupancy across the corridor" },
  { stat: "€150+", caption: "average nightly rate for comparable properties" },
];

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"] });

// Shared decorative squiggle used as a faint background accent in the
// "11pm problem" and spotlight sections below.
const SQUIGGLE_PATH =
  "M386.76,167.88c-2.16,8-18.83,35.14-30.73,55.08-18.97,31.26-37.14,68.33-67.63,89.83C167.69,398.46,6.38,218.54,54.66,110.5c16.35-41.14,64.98-58.47,103.38-69.71,16.88-5.22,28.6-9.5,30.29-13.48,1.25-8.52-23.18-7.54-44.59-3.85-19.16,3.57-41.52,11.74-61.01,24.9-173.99,120.59,44.67,389.68,200.71,298.96,13.23-7.26,31.72-21.87,41.19-27.9,16.3-10.91,3.8,11.67-.43,18.04-38.29,66.02-107,72.55-174.93,46.21C-40.79,322.07-64.41-16.44,166.41.62c38.45,4.34,76.55,18.52,107.83,41.38,42.27,30.69,78.88,75.44,61.57,127.72-12.83,37.13-51.59,96.72-90.28,113.46-41.51,17.31-88.83-8.56-117.2-41.22-36.22-38.21-46.84-107.55-5.6-143.01,33.08-31.31,95.79-19.78,117.27,21.54,20.72,32.31-.97,85.76-43.36,70.14-11.54-4.74-19.21-14.64-22.62-25.14-1.12-2.86-4.14-15.93,1.03-11.25,3.93,3.84,12.19,19.64,24.2,21.37,22.25,2.82,39.08-20.56,28.9-41.46-27.34-56.09-107.72-42.83-114.36,20.36-6.84,52.15,42.46,102.43,93.47,107.89,59.84,8.41,105.43-52.18,103.49-109.6.85-40.67-30.98-88.78-63.5-103.75-7.72-2.1,11.13,21.21,14.22,26.71,5.82,8.63,12.35,18.75,16.95,28.7,24.41,49.72-.17,128.36-61.32,132.3-50.88,6.05-110.51-58.91-72.97-103.91,16.23-18.68,55.02-28.43,70.72-5.84,3.44,4.98,8.56,16.11,1.68,18.25-23.87.78-56.3-31.26-71.46,7.5-6.25,20.05,4.29,43.72,20.36,56.46,27.74,22.48,68.02,5.98,87.8-19.97C343.22,65.96,75.29,9.42,72.27,148.72c-2.98,74.62,67.85,169.93,144.31,171.29,75.41-2.9,113.51-115.61,159.42-152.11,5.26-4.15,14.06-10.98,10.85-.29l-.09.27Z";

const ELEVEN_PM_MESSAGES = [
  { text: "Hi! We've just pulled up but the gate keypad isn't responding…", meta: "22:41 · Guest" },
  { text: "Sorry, can I swap Friday? Something has come up.", meta: "23:02 · Cleaner" },
  { text: "Also is there a travel cot? Booked for 4 but we are 5.", meta: "23:15 · Guest" },
  { text: "Reminder: your rate for August is below market average.", meta: "07:58 · Booking.com" },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "A call",
    description:
      "Fifteen minutes. We ask about the property, you ask about us.",
  },
  {
    number: "02",
    title: "A walkthrough",
    description: "We come see the place in person and work out what it needs.",
  },
  {
    number: "03",
    title: "An agreement",
    description:
      "Plain terms, commission rate confirmed, nothing buried in small print.",
  },
  {
    number: "04",
    title: "Handover",
    description:
      "Listing goes live, calendar's ours to run, you go back to just owning the place.",
  },
];

export async function LandlordPageContent({ page }: { page: LandlordPage }) {
  const [siteSettings, audienceTabs, landlordPosts] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    client.fetch(AUDIENCE_TABS_QUERY),
    client.fetch(LANDLORD_BLOG_POSTS_QUERY),
  ]);

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={buildServiceSchema(page, siteSettings)} />

      {/* HERO */}
      <section className="relative flex flex-col overflow-hidden bg-maroon">
        {/* Nav renders in normal flow here (not as an absolute overlay), so
            it occupies its own space at the top of the section and the
            image below never sits underneath it. */}
        <HeroNav
          links={LANDLORD_NAV_LINKS}
          variant="landlords"
          ctaHref="/landlords-whats-next"
          ctaLabel="Get estimate"
          sticky
        />

        <div className="relative flex-1 px-8 py-16 sm:px-14 sm:py-24">
          <Image
            src={landlordHeroImage}
            alt=""
            fill
            priority
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-maroon/45" />

          <div className="relative z-10">
            <div className="max-w-[600px] text-left">
              <span className="mb-7 inline-block rounded-full border border-cream/20 bg-cream/10 px-4.5 py-2 text-xs font-semibold tracking-widest text-light-sage uppercase">
                For property owners
              </span>
              <h1 className="mb-7 font-serif text-4xl leading-[1.1] font-bold tracking-tight text-cream sm:text-6xl">
                You&apos;re already doing this yourself.
                <br />
                Let&apos;s do it better.
              </h1>
              <p className="mb-9 max-w-[560px] text-lg leading-relaxed text-cream/90">
                You handle the calendar, the cleaner, the awkward 11pm messages.
                Hand it to us — same house, same income going to you, none of
                the admin.
              </p>
              <div className="flex flex-wrap justify-start gap-4">
                <Button
                  link="#send-sos"
                  variant="primary"
                  bgColor="cream"
                  color="maroon"
                  animateColor="maroon"
                >
                  Get started →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE — THE GAP */}
      <MarqueeBanner
        items={[
          <span key="gap">
            Self-managing hosts in this corridor typically leave{" "}
            <span className="text-light-sage">20–35%</span> of revenue on the
            table. That&apos;s a market benchmark, not a guess — and
            it&apos;s the gap we close.
          </span>,
        ]}
        className="overflow-hidden border-b border-cream/12 bg-maroon py-5"
        itemClassName="gap-11 pr-11 text-[15px] font-medium tracking-[0.04em] text-cream/85"
        separator={<span className="text-light-sage">✳</span>}
      />

      {/* THE 11PM PROBLEM */}
      <section className="relative overflow-hidden bg-warm-cream px-8 py-24 sm:px-14 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-44 -left-36 h-[520px] w-[520px] opacity-[0.16]"
        >
          <svg viewBox="0 0 387.54 398.11" className="h-full w-full">
            <path
              d={SQUIGGLE_PATH}
              fill="none"
              stroke="var(--maroon)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-widest text-muted-maroon uppercase">
              <span className="inline-block h-px w-5.5 bg-current" />
              The 11pm problem
            </span>
            <h2 className="mt-5 max-w-[20ch] font-serif text-4xl leading-[0.98] font-bold tracking-tight text-near-black sm:text-6xl">
              It&apos;s 11pm and the gate code doesn&apos;t work.
            </h2>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-near-black/70">
              Self-managing is rarely about the money at first. It&apos;s about the
              twelve small interruptions a week that you can&apos;t delegate to
              anyone, because there&apos;s nobody else.
            </p>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-near-black/70">
              We answer instead. Guest messages, pricing, the cleaner, the
              plumber under &euro;250 — the whole operation, run by a real local
              team.
            </p>
            <a
              href="#how-it-works"
              className="mt-7 inline-flex items-center gap-2.5 border-b border-maroon/30 pb-1 text-base font-semibold text-maroon"
            >
              See exactly what we take on <span>&rarr;</span>
            </a>
          </div>
          <div className="flex flex-col gap-3.5">
            {ELEVEN_PM_MESSAGES.map((message) => (
              <div
                key={message.meta}
                className="max-w-[74%] self-start rounded-tr-[18px] rounded-br-[18px] rounded-bl-[18px] border border-sage-grey/40 bg-white px-5 py-4 shadow-sm"
              >
                <p className="text-[15.5px] leading-relaxed text-near-black">
                  {message.text}
                </p>
                <span className="mt-2 block text-xs font-semibold tracking-widest text-near-black/40 uppercase">
                  {message.meta}
                </span>
              </div>
            ))}
            <div className="max-w-[78%] self-end rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[18px] bg-maroon px-6 py-5 shadow-lg">
              <p className="text-base leading-relaxed text-cream">
                All four handled by 23:19. You were asleep.
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="sos-typing-dot h-1.5 w-1.5 rounded-full bg-cream/75" />
                <span
                  className="sos-typing-dot h-1.5 w-1.5 rounded-full bg-cream/75"
                  style={{ animationDelay: "180ms" }}
                />
                <span
                  className="sos-typing-dot h-1.5 w-1.5 rounded-full bg-cream/75"
                  style={{ animationDelay: "360ms" }}
                />
                <span className="ml-2 text-xs font-semibold tracking-widest text-cream/60 uppercase">
                  Sos Stays
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE GAP */}
      <section className="px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-12">
            <div>
              <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-widest text-muted-maroon uppercase">
                <span className="inline-block h-px w-5.5 bg-current" />
                The gap
              </span>
              <h2 className="mt-5 max-w-[24ch] font-serif text-3xl leading-[0.98] font-bold tracking-tight text-near-black sm:text-5xl">
                A fifth to a third of the revenue, left on the table.
              </h2>
            </div>
            <p className="max-w-[36ch] text-base leading-relaxed text-near-black/70">
              A market benchmark for this corridor, not a guess. Same house,
              same owner — run properly, priced against live demand.
            </p>
          </div>

          <div className="mt-12 rounded-[18px] border border-sage-grey/40 bg-white px-8 pt-10 pb-7 shadow-sm sm:px-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex flex-wrap gap-8">
                <div>
                  <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-near-black">
                    <span className="h-[3px] w-5.5 rounded-full bg-maroon" />
                    Managed by Sos Stays
                  </span>
                  <p className="mt-1.5 max-w-[28ch] pl-8 text-xs leading-relaxed text-near-black/55">
                    Repriced daily against live demand — the same market data
                    (AirDNA) and automated tools short-term rental pros use.
                  </p>
                </div>
                <div>
                  <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-near-black/60">
                    <span className="h-[3px] w-5.5 rounded-full bg-maroon/30" />
                    Self-managed listing
                  </span>
                  <p className="mt-1.5 max-w-[28ch] pl-8 text-xs leading-relaxed text-near-black/55">
                    One rate, set by hand and rarely revisited — it doesn&apos;t
                    move with the market underneath it.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold tracking-widest text-near-black/40 uppercase">
                Illustrative &middot; industry benchmark, not our portfolio
              </span>
            </div>

            <GapChart />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-light-sage/15 px-8 py-24 sm:px-14 sm:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
              How it works
            </p>
            <h2 className="mb-5 font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              Exactly what handing off looks like
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STATS.map((item) => (
              <div
                key={item.title}
                className="rounded-[10px] border border-sage-grey/40 p-6"
              >
                <div
                  className={`mb-2.5 text-[28px] font-bold text-maroon ${poppins.className}`}
                >
                  {item.stat}
                </div>
                <h3 className="mb-2 text-base font-semibold text-near-black">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-near-black/65">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-[18px] px-8 py-7 border border-sage-grey/40">
            <h3 className="mb-1.5 text-base font-semibold text-near-black">
              Still your property
            </h3>
            <p className="text-sm leading-relaxed text-near-black/65">
              Block off personal-use dates any time you like. No minimum
              commitment — stay as long as it&apos;s working for you, leave when
              it isn&apos;t.
            </p>
          </div>
          
          <p className="mx-auto mt-9 max-w-[720px] text-[15px] leading-relaxed text-near-black/70">
            We take that off your hands. Full property management — guest
            communication, pricing, cleaning coordination, maintenance — for a
            single commission on what you actually earn per night. No setup fee,
            no monthly retainer, no contract that locks you in if it&apos;s not
            working. <br></br> This isn&apos;t a marketing agency bolt-on. We run the
            entire operation end to end, not just your listing photos or pricing
            calendar — every guest message, every check-in, every cleaner
            handoff, every repair call. You stay in control of the property; we
            handle everything that isn&apos;t the property itself.
          </p>
        </div>
      </section>

      {audienceTabs?.tabs?.length === 4 && (
        <AudienceTabs eyebrow={audienceTabs.eyebrow} tabs={audienceTabs.tabs} />
      )}

      {/* PROOF POINTS / MARKET DATA */}
      <section className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
        <div className="mb-4 text-center">
          <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
            Market data — Boyne–Mournes corridor
          </p>
          <h2 className="mb-3.5 font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
            What this corridor is actually doing
          </h2>
          <p className="mx-auto max-w-[560px] text-sm text-near-black/60">
            Industry benchmarks for the area — not a claim about our own
            portfolio, which is still one house deep.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {MARKET_STATS.map((item) => (
            <div key={item.caption} className="px-2 text-center">
              <div
                className={`text-3xl font-extrabold text-maroon ${poppins.className}`}
              >
                {item.stat}
              </div>
              <p className="mt-2 text-[13px] leading-normal text-near-black/60">
                {item.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SPOTLIGHT — RATHESCAR GROVE */}
      <section className="mx-auto max-w-6xl px-8 pb-24 sm:px-14">
        <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-[18px] lg:grid-cols-2">
          <div className="relative min-h-[320px] overflow-hidden bg-near-black lg:min-h-[520px]">
            <Image
              src="https://cdn.sanity.io/images/owyw3r12/production/df528c198ec5c52e746b7bf96ab99ce6e4957c81-2048x1536.jpg?w=1200&h=1500&fit=crop"
              alt="Rathescar Grove, a stone farmhouse guest house near Drogheda"
              fill
              className="object-cover"
            />
            <span className="absolute bottom-6 left-6 rounded-full bg-near-black/85 px-4.5 py-2 text-xs font-semibold tracking-widest text-cream uppercase">
              Rathescar Grove &middot; Drogheda
            </span>
          </div>
          <div className="relative overflow-hidden border border-l-0 border-sage-grey/40 bg-warm-cream p-8 sm:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-28 -right-28 h-[420px] w-[420px] opacity-[0.14]"
            >
              <svg viewBox="0 0 387.54 398.11" className="h-full w-full">
                <path
                  d={SQUIGGLE_PATH}
                  fill="none"
                  stroke="var(--maroon)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="relative">
              <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-widest text-muted-maroon uppercase">
                <span className="inline-block h-px w-5.5 bg-current" />
                An honest early spotlight
              </span>
              <h3 className="mt-5 max-w-[22ch] font-serif text-3xl leading-[1.02] font-bold tracking-tight text-near-black sm:text-4xl">
                What we found on our first property
              </h3>
              <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-near-black/70">
                Our own case, not a stand-in for what every owner should
                expect — we&apos;ve run Rathescar Grove for a matter of
                weeks. But the numbers are real, and specific.
              </p>
              <div className="mt-9 grid gap-6.5">
                <div className="border-t border-maroon/15 pt-5.5">
                  <span
                    className={`text-4xl font-bold tracking-tight text-maroon ${poppins.className}`}
                  >
                    ~24% underpriced
                  </span>
                  <p className="mt-2.5 text-sm leading-relaxed text-near-black/65">
                    vs. the local market average, at the rate the previous
                    listing was using.
                  </p>
                </div>
                <div className="border-t border-maroon/15 pt-5.5">
                  <span
                    className={`text-4xl font-bold tracking-tight text-maroon ${poppins.className}`}
                  >
                    93% occupancy uplift
                  </span>
                  <p className="mt-2.5 text-sm leading-relaxed text-near-black/65">
                    Confirmed result after repricing — occupancy went from
                    31% to 60% in August, Rathescar Grove&apos;s first month
                    under management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEND YOUR SOS */}
      <section id="send-sos" className="px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-[640px]">
          <div className="mb-10 text-center">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
              Send your SOS
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              Tell us about your place
            </h2>
            <p className="mx-auto max-w-[480px] text-sm text-near-black/60">
              Three quick steps — we&apos;ll be in touch within a day or two.
              Right after, you can run a free revenue estimate for your
              property.
            </p>
          </div>
          <LandlordLeadForm />
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28">
        <div className="mb-14 text-center">
          <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
            Process
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
            What happens after you send your SOS
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <div key={step.number}>
              <div
                className={`mb-3.5 text-3xl font-extrabold text-light-sage ${poppins.className}`}
              >
                {step.number}
              </div>
              <h3 className="mb-2 text-base font-semibold text-near-black">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-near-black/65">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <FaqSection
        id="faq"
        eyebrow="FAQ"
        heading="The finer print, without the fuss"
        items={page.faqs}
        accent="maroon"
        centered
        maxWidth="820px"
      />

      {/* FINAL CTA */}
      <section className="bg-maroon px-8 py-24 text-center sm:px-14 sm:py-28">
        <div className="mx-auto max-w-[560px]">
          <p className="mb-4.5 text-xs tracking-widest text-light-sage uppercase">
            Send your SOS
          </p>
          <h2 className="mb-5 font-serif text-4xl leading-tight font-bold tracking-tight text-cream sm:text-5xl">
            Ready to hand over the keys?
          </h2>
          <p className="mb-9 text-lg leading-relaxed text-light-sage">
            Two minutes of your time — with or without your numbers to hand.
          </p>
          <Button
            link="#send-sos"
            variant="primary"
            bgColor="cream"
            color="maroon"
            animateColor="maroon"
          >
            Send your SOS ↑
          </Button>
        </div>
      </section>

      <RelatedBlogsSection posts={landlordPosts} heading="Worth a read before you send your SOS" />
    </main>
  );
}
