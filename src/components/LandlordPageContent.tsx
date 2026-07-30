import { PortableText } from "next-sanity";
import { HeroNav } from "@/components/HeroNav";
import { LANDLORD_NAV_LINKS } from "@/lib/navLinks";
import { LandlordLeadForm } from "@/components/LandlordLeadForm";

type LandlordPage = {
  body?: any;
  faqs?: { question: string; answer: string }[];
};

const HOW_IT_WORKS_STATS = [
  {
    stat: "20–30%",
    title: "Commission only",
    description: "Of gross booking revenue. Cleaning fees excluded. No setup fee, no monthly retainer.",
  },
  {
    stat: "€0",
    title: "No booking, no fee",
    description: "We only get paid when your property does. Nothing owed on empty nights.",
  },
  {
    stat: "€250",
    title: "Maintenance authority",
    description: "We handle anything up to €250 without bothering you. Above that, we call first.",
  },
  {
    stat: "Your call",
    title: "Cleaning",
    description: "Keep your existing cleaner, or we source one from our network. Either way, it's covered.",
  },
];

const MARKET_STATS = [
  { stat: "20–35%", caption: "typical underearning for hosts managing solo" },
  { stat: "2–3×", caption: "revenue potential vs. a long-term let, corridor-wide" },
  { stat: "80%+", caption: "peak-season occupancy across the corridor" },
  { stat: "€150+", caption: "average nightly rate for comparable properties" },
];

const PROCESS_STEPS = [
  { number: "01", title: "A call", description: "Fifteen minutes. We ask about the property, you ask about us." },
  { number: "02", title: "A walkthrough", description: "We come see the place in person and work out what it needs." },
  { number: "03", title: "An agreement", description: "Plain terms, commission rate confirmed, nothing buried in small print." },
  { number: "04", title: "Handover", description: "Listing goes live, calendar's ours to run, you go back to just owning the place." },
];

export function LandlordPageContent({ page }: { page: LandlordPage }) {
  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      {/* Hidden static form so a Netlify build can detect this field set for
          Netlify Forms. Note: this relies on the deployed site actually being
          a Netlify build that scans rendered HTML for forms — unconfirmed for
          this app. LandlordLeadForm falls back to a mailto link if the POST
          in submitLeadForm() fails, so a lead is never silently lost either way. */}
      <form name="landlord-leads" data-netlify="true" netlify-honeypot="bot-field" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="text" name="situation" />
        <input type="text" name="propertyDescription" />
        <input type="text" name="mobile" />
        <input type="text" name="bot-field" />
      </form>

      {/* HERO */}
      <section className="relative bg-maroon px-8 pt-[180px] pb-24 sm:px-14 sm:pt-[200px]">
        <HeroNav
          links={LANDLORD_NAV_LINKS}
          variant="landlords"
          ctaHref="#send-sos"
          ctaLabel="Contact us"
        />
        <div className="mx-auto max-w-[760px] text-center">
          <span className="mb-7 inline-block rounded-full border border-cream/20 bg-cream/10 px-4.5 py-2 text-xs font-semibold tracking-widest text-light-sage uppercase">
            For property owners
          </span>
          <p className="mx-auto mb-4.5 max-w-[560px] text-sm text-light-sage/85">
            Self-managing hosts in this corridor typically leave 20–35% of revenue on the
            table. That&apos;s a market benchmark, not a guess — and it&apos;s the gap we close.
          </p>
          <h1 className="mb-7 font-serif text-4xl leading-[1.1] font-bold tracking-tight text-cream sm:text-6xl">
            You&apos;re already doing this yourself.
            <br />
            Let&apos;s do it better.
          </h1>
          <p className="mx-auto mb-9 max-w-[560px] text-lg leading-relaxed text-cream/90">
            You handle the calendar, the cleaner, the awkward 11pm messages. Hand it to us —
            same house, same income going to you, none of the admin.
          </p>
          <a
            href="#calculator"
            className="inline-block rounded-full bg-cream px-8 py-4 text-[15px] font-semibold text-maroon transition-opacity hover:opacity-85"
          >
            See what your property could earn →
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-light-sage/15 px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
              How it works
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              Exactly what handing off looks like
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STATS.map((item) => (
              <div key={item.title} className="rounded-[10px] bg-white p-6">
                <div className="mb-2.5 font-serif text-[28px] font-bold text-maroon">
                  {item.stat}
                </div>
                <h3 className="mb-2 text-base font-semibold text-near-black">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-near-black/65">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-[18px] bg-white px-8 py-7">
            <h3 className="mb-1.5 text-base font-semibold text-near-black">
              Still your property
            </h3>
            <p className="text-sm leading-relaxed text-near-black/65">
              Block off personal-use dates any time you like. No minimum commitment — stay as
              long as it&apos;s working for you, leave when it isn&apos;t.
            </p>
          </div>

          {page.body && (
            <div className="prose prose-neutral mt-10 max-w-[720px] text-near-black/80 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-maroon [&_p]:my-3 [&_p]:leading-relaxed">
              <PortableText value={page.body} />
            </div>
          )}
        </div>
      </section>

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
            Industry benchmarks for the area — not a claim about our own portfolio, which is
            still one house deep.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {MARKET_STATS.map((item) => (
            <div key={item.caption} className="px-2 text-center">
              <div className="font-serif text-3xl font-extrabold text-maroon">{item.stat}</div>
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
              This is our own case, not a stand-in for what every owner should expect —
              we&apos;ve managed Rathescar Grove for a matter of weeks. But the numbers are
              real, and specific.
            </p>
          </div>
          <div className="flex flex-col gap-4.5">
            <div className="rounded-[10px] border border-cream/15 bg-cream/10 px-6 py-5">
              <div className="font-serif text-2xl font-extrabold text-cream">
                ~24% underpriced
              </div>
              <p className="mt-1.5 text-[13px] text-light-sage/85">
                vs. the local market average, at the rate the previous listing was using
              </p>
            </div>
            <div className="rounded-[10px] border border-cream/15 bg-cream/10 px-6 py-5">
              <div className="font-serif text-2xl font-extrabold text-cream">
                40–50% booking uplift
              </div>
              <p className="mt-1.5 text-[13px] text-light-sage/85">
                the minimum increase we&apos;re targeting after repricing — still playing out
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE CALCULATOR — the embedded strrevenue.netlify.app tool */}
      <section id="calculator" className="bg-light-sage/15 px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
            Revenue calculator
          </p>
          <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
            See what your property could earn
          </h2>
          <p className="mx-auto mb-11 max-w-[520px] text-sm text-near-black/60">
            Free estimate — no sign-up required.
          </p>

          <div className="overflow-hidden rounded-[18px] bg-white p-3">
            <div className="overflow-hidden rounded-[10px] border border-sage-grey/40">
              <iframe
                src="https://strrevenue.netlify.app"
                title="Short-term rental revenue calculator"
                className="h-[900px] w-full"
                loading="lazy"
              />
            </div>
          </div>

          <a
            href="#send-sos"
            className="mt-9 inline-block rounded-full bg-maroon px-8 py-4 text-[15px] font-semibold text-cream transition-opacity hover:opacity-85"
          >
            Get a proper number — talk to us →
          </a>
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
              <div className="mb-3.5 font-serif text-3xl font-extrabold text-light-sage">
                {step.number}
              </div>
              <h3 className="mb-2 text-base font-semibold text-near-black">{step.title}</h3>
              <p className="text-sm leading-relaxed text-near-black/65">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {page.faqs && page.faqs.length > 0 && (
        <section id="faq" className="mx-auto max-w-[820px] px-8 pb-24 sm:px-14">
          <div className="mb-11 text-center">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">FAQ</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              The finer print, without the fuss
            </h2>
          </div>
          <div className="border-t border-sage-grey/40">
            {page.faqs.map((faq, i) => (
              <details key={i} className="border-b border-sage-grey/40 py-5">
                <summary className="cursor-pointer text-base font-semibold text-near-black marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="mt-3.5 text-sm leading-relaxed text-near-black/70">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

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
          <a
            href="#calculator"
            className="inline-block rounded-full bg-cream px-8 py-4 text-[15px] font-semibold text-maroon transition-opacity hover:opacity-85"
          >
            Get my revenue estimate ↑
          </a>
        </div>
      </section>
    </main>
  );
}
