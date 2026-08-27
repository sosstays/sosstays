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
    stat: "15–30%",
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
    stat: "€250",
    title: "Maintenance authority",
    description:
      "We handle anything up to €250 without bothering you. Above that, we call first.",
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
              <p className="mb-4.5 max-w-[560px] text-sm text-light-sage/85">
                Self-managing hosts in this corridor typically leave 20–35% of
                revenue on the table. That&apos;s a market benchmark, not a
                guess — and it&apos;s the gap we close.
              </p>
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
        <div className="grid grid-cols-1 items-center gap-9 rounded-[18px] bg-maroon p-8 sm:gap-12 sm:p-14 lg:grid-cols-2">
          <div>
            <p className="mb-3.5 text-xs tracking-widest text-light-sage uppercase">
              An honest early spotlight
            </p>
            <h3 className="mb-4 font-serif text-2xl font-bold tracking-tight text-cream">
              What we found on our first property
            </h3>
            <p className="text-[15px] leading-relaxed text-light-sage/90">
              This is our own case, not a stand-in for what every owner should
              expect — we&apos;ve managed Rathescar Grove for a matter of weeks.
              But the numbers are real, and specific.
            </p>
          </div>
          <div className="flex flex-col gap-4.5">
            <div className="rounded-[10px] border border-cream/15 bg-cream/10 px-6 py-5">
              <div
                className={`text-2xl font-extrabold text-cream ${poppins.className}`}
              >
                ~24% underpriced
              </div>
              <p className="mt-1.5 text-[13px] text-light-sage/85">
                vs. the local market average, at the rate the previous listing
                was using
              </p>
            </div>
            <div className="rounded-[10px] border border-cream/15 bg-cream/10 px-6 py-5">
              <div
                className={`text-2xl font-extrabold text-cream ${poppins.className}`}
              >
                40–50% booking uplift
              </div>
              <p className="mt-1.5 text-[13px] text-light-sage/85">
                the minimum increase we&apos;re targeting after repricing —
                still playing out
              </p>
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
