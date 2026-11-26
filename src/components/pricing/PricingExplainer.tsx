import Link from "next/link";
import { Eyebrow } from "@/components/Eyebrow";
import { COMMISSION_RANGE, MAINTENANCE_AUTHORITY_EUR } from "@/lib/businessFacts";
import { countiesForRegion, type County } from "@/lib/pricingCounties";

// Plain server-rendered sections for /pricing: the explanation a landlord
// (or an AI assistant answering for one) needs before getting in touch.
// No client state, so all of it is in the first HTML response.

const INCLUDED = [
  { title: "Your listing, everywhere", body: "Set up and kept current on Airbnb, Booking.com and our own direct booking channel." },
  { title: "Dynamic pricing", body: "Nightly rates adjusted to demand, local events and the season." },
  { title: "Guests, start to finish", body: "Messages answered, check-in handled and any problems sorted during the stay." },
  { title: "Cleaning coordination", body: "Keep your own cleaner or use one from our network. Either way, turnovers are organised." },
  { title: "Maintenance", body: `Repairs up to €${MAINTENANCE_AUTHORITY_EUR} arranged without waiting on you. Above that, we call first.` },
  { title: "Clear statements", body: "A monthly statement showing what came in and what we took." },
];

const EXAMPLES = [15, 30];

export function PricingExplainer({ counties }: { counties: County[] }) {
  const roi = countiesForRegion(counties, "roi");
  const ni = countiesForRegion(counties, "ni");

  return (
    <>
      <section className="mx-auto max-w-5xl px-8 py-16 sm:px-14">
        <div className="mb-10 text-center">
          <Eyebrow className="mb-2.5" tone="forest">What you get</Eyebrow>
          <h2 className="font-serif text-3xl font-bold text-maroon sm:text-4xl">
            What the commission covers
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((item) => (
            <div key={item.title} className="rounded-[18px] border border-sage-grey/40 bg-light-forest-green/40 px-6 py-7">
              <h3 className="m-0 mb-2 font-serif text-xl font-semibold text-forest-green">{item.title}</h3>
              <p className="m-0 text-[14px] leading-relaxed text-near-black/75">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-8 pb-16 sm:px-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <Eyebrow className="mb-2.5" tone="maroon">How it works</Eyebrow>
            <h2 className="mb-4 font-serif text-3xl font-bold text-maroon">
              {COMMISSION_RANGE} of booking revenue, nothing else
            </h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[14.5px] leading-relaxed text-near-black/80">
              <li>Charged on the nightly rate. Cleaning fees are not part of it.</li>
              <li>No setup fee, no monthly retainer and no booking fee.</li>
              <li>You only pay when a stay is booked. Empty nights cost nothing.</li>
              <li>Your exact rate depends on property type and location. We confirm it in writing before you sign.</li>
              <li>No minimum commitment, and you can block your own dates any time.</li>
            </ul>
          </div>
          <div className="rounded-[18px] bg-maroon p-7 text-cream sm:p-9">
            <span className="text-[11.5px] font-semibold tracking-[0.14em] text-light-sage uppercase">
              The sums, on a €1,000 booking
            </span>
            <div className="mt-4 flex flex-col">
              {EXAMPLES.map((pct) => (
                <div key={pct} className="flex items-baseline justify-between border-t border-cream/15 py-3 first:border-t-0">
                  <span className="text-[14px] text-cream/80">At {pct}% commission</span>
                  <span className="font-serif text-2xl text-cream">€{(1000 * pct) / 100}</span>
                </div>
              ))}
            </div>
            <p className="m-0 mt-3 text-[12px] leading-relaxed text-cream/60">
              This is arithmetic to show how the percentage works, not a forecast of what any property will earn.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-8 pb-16 sm:px-14">
        <div className="rounded-[18px] border border-sage-grey/40 bg-light-forest-green/40 px-7 py-9 sm:px-10">
          <Eyebrow className="mb-2.5" tone="forest">Before you list</Eyebrow>
          <h2 className="mb-3 font-serif text-2xl font-bold text-maroon sm:text-3xl">
            Registration and planning, sorted with you
          </h2>
          <p className="m-0 max-w-[68ch] text-[14.5px] leading-relaxed text-near-black/80">
            Short-term lets in Ireland need to be on the national Short-Term Letting Register, and some
            properties also need planning permission. We walk you through what applies to yours, so you
            know where you stand before the first booking.{" "}
            <Link href="/short-term-letting-register-ireland" className="text-maroon underline underline-offset-[3px]">
              Read our short-term letting register guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-8 pb-16 sm:px-14" aria-labelledby="pricing-counties">
        <div className="mb-8 text-center">
          <Eyebrow className="mb-2.5" tone="maroon">Local detail</Eyebrow>
          <h2 id="pricing-counties" className="font-serif text-3xl font-bold text-maroon sm:text-4xl">
            Pricing by county
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <CountyList heading="Republic of Ireland" counties={roi} />
          <CountyList heading="Northern Ireland" counties={ni} />
        </div>
      </section>
    </>
  );
}

function CountyList({ heading, counties }: { heading: string; counties: County[] }) {
  if (counties.length === 0) return null;
  return (
    <div>
      <h3 className="m-0 mb-3 font-serif text-xl font-semibold text-forest-green">{heading}</h3>
      <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-1.5 p-0">
        {counties.map((county) => (
          <li key={county.slug}>
            <Link href={`/pricing/${county.slug}`} className="text-[14.5px] text-near-black underline-offset-[3px] hover:text-maroon hover:underline">
              {county.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
