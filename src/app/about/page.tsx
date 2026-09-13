import Image from "next/image";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { getSiteNavLinks } from "@/lib/navLinks";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(
    {
      title: "About Us | Sos Stays",
      description:
        "Sós is the Irish word for a break. Full-service short-term rental management for owners, and properly-run stays for guests, across the island of Ireland.",
    },
    "/about"
  );
}

const PRINCIPLES = [
  {
    number: "01",
    title: "Honest numbers, always",
    body: "We don't publish projections or stats we can't stand over — if we can't back it with real data for an area, we say so, rather than making it sound better than it is.",
  },
  {
    number: "02",
    title: "Actually reachable",
    body: "Every guest and every owner gets a real person, not a ticket queue.",
  },
  {
    number: "03",
    title: "Paid the same way you are",
    body: "Commission-only means we do well exactly when your property does — there's no separate incentive pulling us in a different direction.",
  },
  {
    number: "04",
    title: "Hands stay on it",
    body: "Cleaning, maintenance, pricing, and messaging are coordinated by us, not left for you to manage around us.",
  },
];

const REGIONS = [
  { name: "Co. Louth", status: "Established base" },
  { name: "Co. Meath", status: "Established base" },
  { name: "Co. Down", status: "Established base" },
  { name: "Island-wide", status: "Expanding", muted: true },
];

export default async function AboutUsPage() {
  const siteNavLinks = await getSiteNavLinks();

  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/landlords" ctaLabel="Send your SOS" sticky />
      <main className="overflow-x-hidden bg-cream text-near-black">
        {/* HERO */}
        <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-deep-forest">
          <Image
            src="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1800&q=80"
            alt=""
            fill
            priority
            className="object-cover opacity-40"
          />
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
            <Reveal
              className={`font-serif mb-8 inline-block rounded-full border border-cream/30 px-[18px] py-2 text-xs font-semibold tracking-widest text-light-sage uppercase`}
            >
              About us
            </Reveal>
            <Reveal
              as="h1"
              delay={120}
              className={`font-serif mb-8 max-w-[16ch] text-[44px] leading-[1.02] font-extrabold tracking-tight text-cream sm:text-6xl lg:text-[92px]`}
            >
              Sós is the Irish word for a break.
            </Reveal>
            <Reveal delay={280} className="max-w-[56ch] text-lg leading-relaxed text-light-sage sm:text-xl">
              That&apos;s the whole idea. Whether you&apos;re here for a few nights away or you own the place someone
              else is dreaming about, we exist to make the break actually feel like one — properly looked after, no
              loose ends, nothing left to chance.
            </Reveal>
          </div>
        </section>

        {/* WHY WE EXIST */}
        <section className="mx-auto max-w-[1200px] px-8 py-24 sm:px-14 sm:py-32">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-18">
            <Reveal>
              <p className={`font-serif mb-4 text-xs font-semibold tracking-widest text-near-black/55 uppercase`}>
                Why we exist
              </p>
              <h2 className={`font-serif mb-6 text-[30px] leading-[1.1] font-bold tracking-tight text-forest-green sm:text-4xl lg:text-[46px]`}>
                We started because &ldquo;self-managed&rdquo; usually means &ldquo;self-exhausted&rdquo;
              </h2>
              <div className="my-7 h-[3px] w-[110px] bg-light-sage" />
              <p className="mb-5 text-base leading-loose text-near-black">
                Most short-term rentals in Ireland are run by hosts doing it all themselves — replying to messages at
                midnight, coordinating cleaners between changeovers, chasing maintenance, and still watching bookings
                sit empty. It&apos;s a lot for one person, and it shows: most self-managing hosts earn 20–35% less
                than they should, not because their place isn&apos;t lovely, but because nobody&apos;s job is to
                sweat the details.
              </p>
              <p className="mb-5 text-base leading-loose text-near-black">
                On the other side, guests searching Airbnb or Booking.com never know what they&apos;re walking into —
                a listing can look perfect and turn out half-managed. We wanted something in between: properties
                that are genuinely cared for, run by people whose actual job is getting it right, not squeezed in
                around someone else&apos;s day job.
              </p>
              <p className="text-base leading-loose font-medium text-near-black">
                That&apos;s Sos Stays — full-service short-term rental management for owners, and properly-run stays
                for guests, across the island of Ireland.
              </p>
            </Reveal>
            <Reveal delay={150} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 h-[300px] overflow-hidden rounded-[18px]">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80"
                  alt="Well-kept holiday home living room"
                  width={900}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                />
              </div>
              <div className="h-[210px] overflow-hidden rounded-[18px]">
                <Image
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=700&q=80"
                  alt="Cosy bedroom in a managed Sos Stays property"
                  width={700}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                />
              </div>
              <div className="h-[210px] overflow-hidden rounded-[18px]">
                <Image
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700&q=80"
                  alt="Kitchen stocked and ready for guests"
                  width={700}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* TWO AUDIENCES */}
        <section className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="mb-14 max-w-[620px]">
              <p className={`font-serif mb-4 text-xs font-semibold tracking-widest text-near-black/55 uppercase`}>
                What we do
              </p>
              <h2 className={`font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-forest-green sm:text-4xl lg:text-[46px]`}>
                One team, two sides of the same stay
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
              <Reveal className="flex flex-col overflow-hidden rounded-[18px] border border-sage-grey/25 bg-cream transition-transform duration-300 hover:-translate-y-1.5">
                <div className="h-[230px] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80"
                    alt="Guest arriving at a Sos Stays property"
                    width={900}
                    height={600}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-9 pb-10">
                  <div className="mb-4 flex items-center gap-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M3 10.5L12 3l9 7.5M5 9.5V20h14V9.5M9.5 20v-6h5v6"
                        stroke="var(--forest-green)"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-xs font-semibold tracking-widest text-forest-green uppercase">
                      For guests
                    </span>
                  </div>
                  <p className="mb-6 text-base leading-loose text-near-black">
                    We list real, individually managed properties — not a marketplace of unmanaged listings hoping
                    for the best. Every Sos property gets self check-in, a stocked kitchen, and a direct line to
                    someone who&apos;ll actually pick up if something&apos;s not right.
                  </p>
                  <p className="text-sm text-near-black/60">
                    Book straight through sosstays.com, or find us on Airbnb, Booking.com, and Vrbo.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={150} className="flex flex-col overflow-hidden rounded-[18px] border border-sage-grey/25 bg-cream transition-transform duration-300 hover:-translate-y-1.5">
                <div className="h-[230px] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80"
                    alt="Owner handing over the keys to a managed property"
                    width={900}
                    height={600}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-9 pb-10">
                  <div className="mb-4 flex items-center gap-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M9 11h.01M15 11h.01"
                        stroke="var(--maroon)"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-xs font-semibold tracking-widest text-maroon uppercase">For owners</span>
                  </div>
                  <p className="mb-6 text-base leading-loose text-near-black">
                    We manage properties end-to-end for self-managing hosts who want their income back without
                    giving up ownership or control: guest communication, pricing, cleaning coordination, and
                    maintenance, all handled.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      "Commission-only, 20–30%",
                      "No setup fee",
                      "No monthly retainer",
                      "Block personal dates any time",
                      "No minimum commitment",
                    ].map((pill) => (
                      <span
                        key={pill}
                        className="rounded-full bg-pale-sage px-[15px] py-2 text-xs font-medium text-deep-forest"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* HOW WE WORK */}
        <section className="mx-auto max-w-[1200px] px-8 py-24 sm:px-14 sm:py-32">
          <Reveal className="mb-14 max-w-[620px]">
            <p className="font-serif mb-4 text-xs font-semibold tracking-widest text-near-black/55 uppercase">
              How we work
            </p>
            <h2 className={`font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-forest-green sm:text-4xl lg:text-[46px]`}>
              A few things we hold ourselves to
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 border-t border-sage-grey/25 md:grid-cols-2">
            {PRINCIPLES.map((item, i) => (
              <Reveal
                key={item.number}
                delay={i * 80}
                className={`flex gap-6 border-b border-sage-grey/25 py-9 ${
                  i % 2 === 0 ? "md:border-r md:pr-12" : "md:pl-12"
                }`}
              >
                <span className={`font-serif pt-1 text-sm font-extrabold text-light-sage`}>
                  {item.number}
                </span>
                <div>
                  <h3 className={`font-serif mb-2.5 text-xl font-bold text-deep-forest`}>{item.title}</h3>
                  <p className="text-[15px] leading-loose text-near-black/65">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* WHERE WE OPERATE */}
        <section className="relative overflow-hidden bg-deep-forest">
          <Image
            src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1800&q=80"
            alt=""
            fill
            className="object-cover opacity-[.34]"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgba(38,52,37,.93), rgba(38,52,37,.6))" }}
          />
          <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-8 py-24 sm:px-14 sm:py-32 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className={`font-serif mb-4 text-xs font-semibold tracking-widest text-light-sage uppercase`}>
                Where we operate
              </p>
              <h2 className={`font-serif mb-6 text-[30px] leading-[1.1] font-bold tracking-tight text-cream sm:text-4xl lg:text-[46px]`}>
                Based in Ireland, growing across it
              </h2>
              <p className="mb-9 text-lg leading-loose text-light-sage">
                We manage properties across the island of Ireland, with an established base in Co. Louth, Co. Meath,
                and Co. Down — and we&apos;re expanding from there.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Button link="/stays" variant="primary" bgColor="cream" color="forest-green" size="custom" className="px-7 py-3.5 text-sm">
                  Explore our current stays →
                </Button>
                <Button
                  link="/areas"
                  variant="secondary"
                  bgColor="transparent"
                  color="cream"
                  animateBgColor="cream"
                  animateColor="forest-green"
                  size="custom"
                  className="border-cream/40 px-7 py-3.5 text-sm"
                >
                  See area guides →
                </Button>
              </div>
            </Reveal>
            <Reveal delay={150} className="flex flex-col">
              {REGIONS.map((region) => (
                <div key={region.name} className="flex items-baseline justify-between border-b border-cream/15 py-6 last:border-b-0">
                  <span className={`font-serif text-2xl font-bold sm:text-[27px] ${region.muted ? "text-light-sage" : "text-cream"}`}>
                    {region.name}
                  </span>
                  <span className="text-xs tracking-widest text-light-sage uppercase">{region.status}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* COMPLIANCE */}
        <section className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
          <Reveal className="mx-auto max-w-[820px] text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-cream">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 12.5l2 2 4.5-4.5M12 3l8 3.5v5.2c0 4.9-3.3 8.4-8 9.8-4.7-1.4-8-4.9-8-9.8V6.5z"
                  stroke="var(--forest-green)"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-serif mb-4 text-xs font-semibold tracking-widest text-near-black/55 uppercase">
              Doing it properly, on paper too
            </p>
            <h2 className={`font-serif mb-6 text-[28px] leading-tight font-bold tracking-tight text-forest-green sm:text-4xl`}>
              Registered, and ready for what&apos;s coming
            </h2>
            <p className="mx-auto max-w-[68ch] text-lg leading-loose text-near-black">
              Sos Stays (CRO 746631) is a registered Irish business. Ireland&apos;s Short-Term Letting Register
              through Fáilte Ireland opens for registration on 1 December 2026, with a compliance deadline of 31
              December 2026 — we&apos;re already set up to meet it, for every property we manage.
            </p>
          </Reveal>
        </section>

        {/* CLOSING CTA */}
        <section className="relative overflow-hidden bg-deep-forest px-8 py-32 text-center sm:px-14 sm:py-[150px]">
          <div
            aria-hidden
            className="about-spin pointer-events-none absolute top-1/2 left-1/2 w-[760px] -translate-x-1/2 -translate-y-1/2 opacity-[.07] [animation:about-spin_110s_linear_infinite]"
            style={{
              backgroundImage: "url('/logo-varient-sm.svg')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              aspectRatio: "387.54 / 398.11",
              filter: "brightness(0) invert(1)",
            }}
          />
          <Reveal className="relative mx-auto max-w-[720px]">
            <h2 className={`font-serif mb-6 text-[32px] leading-tight font-extrabold tracking-tight text-cream sm:text-5xl lg:text-[58px]`}>
              Wherever you&apos;re standing in this — welcome.
            </h2>
            <p className="mb-10 text-lg leading-loose text-light-sage">
              Looking for somewhere good to stay, or looking to hand over a property that&apos;s become more hassle
              than it&apos;s worth — either way, that&apos;s what we&apos;re here for.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button link="/stays" variant="primary" bgColor="cream" color="forest-green" size="custom" className="px-9 py-4 text-[15px]">
                Find your break
              </Button>
              <Button link="/landlords" variant="primary" bgColor="maroon" color="cream" size="custom" className="px-9 py-4 text-[15px]">
                Send your SOS
              </Button>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
