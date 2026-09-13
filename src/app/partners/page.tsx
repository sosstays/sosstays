import Image from "next/image";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { Reveal } from "@/components/Reveal";
import { PartnerDirectory } from "@/components/PartnerDirectory";
import { PartnerLeadForm } from "@/components/PartnerLeadForm";
import { getSiteNavLinks } from "@/lib/navLinks";
import { PARTNER_CATEGORIES, PARTNERS, EMPTY_CATEGORIES } from "@/lib/partnersData";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(
    {
      title: "Partner With Sos Stays | Irish Hospitality & Local Business Partners",
      description:
        "Sos Stays partners with cleaners, photographers, tour operators, food producers and hospitality businesses across Ireland. See who we work with, or apply to join.",
    },
    "/partners"
  );
}

const TIERS = [
  {
    title: "Featured Partners",
    body: "Businesses guests will actually book or visit as part of their stay (days out, tours, wellness, food experiences). These get a full profile page: your story, your offer, your photos, and a direct link from ours to yours.",
  },
  {
    title: "Directory Partners",
    body: "Everyone else on this list. A card with your name, what you do, a line on why we rate you, and a link straight to your site or booking page. Simple, but it puts you in front of every guest and every landlord who lands on this page.",
  },
];

const WHO_WE_WANT = [
  {
    title: "Cleaning companies & freelance cleaners",
    body: "Turnover teams across Louth, Meath, Clare and Wexford.",
  },
  {
    title: "Photographers",
    body: "Property and lifestyle photography for listings.",
  },
  {
    title: "Social & content creators",
    body: "Influencers and creators who cover Irish travel, food, or property.",
  },
  {
    title: "Tour operators & experiences",
    body: "Day tours, activities, anything a guest would book on top of their stay.",
  },
  {
    title: "Food & drink producers",
    body: "Local brands we can put in a welcome basket instead of a supermarket multipack.",
  },
  {
    title: "Hospitality & days out",
    body: "The likes of Funtasia and Tranquil Space — attractions, activities, and hospitality businesses near our stays.",
  },
];

const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1800&q=80",
  alt: "",
};

export default async function PartnersPage() {
  const siteNavLinks = await getSiteNavLinks();

  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/landlords" ctaLabel="Send your SOS" sticky />
      <main className="overflow-x-hidden bg-cream text-near-black">
        {/* HERO */}
        <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-maroon">
          <Image src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} fill priority className="object-cover opacity-40" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(100deg, rgba(71,45,48,.94) 8%, rgba(71,45,48,.55) 60%, rgba(71,45,48,.25) 100%)",
            }}
          />
          <div className="relative mx-auto w-full max-w-[1200px] px-8 py-24 sm:px-14">
            <Reveal className="font-serif mb-8 inline-block rounded-full border border-cream/30 px-[18px] py-2 text-xs font-semibold tracking-widest text-cream/80 uppercase">
              Partners
            </Reveal>
            <Reveal
              as="h1"
              delay={120}
              className="font-serif max-w-[22ch] text-[38px] leading-[1.08] font-extrabold tracking-tight text-cream sm:text-6xl lg:text-[68px]"
            >
              We&apos;re better with good people around us. Let&apos;s work together.
            </Reveal>
          </div>
        </section>

        {/* INTRO */}
        <section className="mx-auto max-w-[820px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal>
            <p className="mb-6 text-xl leading-relaxed text-near-black sm:text-2xl">
              Every stay we manage is really a string of small local businesses working together — the cleaner who
              turns the room around, the photographer who makes it look like itself, the café down the road we send
              guests to, the operator who takes them out on the water the next morning.
            </p>
            <p className="mb-6 text-base leading-loose text-near-black/80">
              We&apos;d rather pay a local business for that than build it all in-house. It keeps the work local, it
              keeps the money local, and it means every guest gets the actual Irish welcome — not a version of it we
              invented in an office.
            </p>
            <p className="text-base leading-loose text-near-black/80">
              If that sounds like the kind of company you&apos;d want turning up on your books, we&apos;d like to
              hear from you.
            </p>
          </Reveal>
        </section>

        {/* HOW WE WORK WITH PARTNERS */}
        <section className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="mb-14 max-w-[720px]">
              <p className="font-serif mb-4 text-xs font-semibold tracking-widest text-near-black/55 uppercase">
                How we work with partners
              </p>
              <h2 className="font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-maroon sm:text-4xl">
                Two tiers, not a logo wall
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
              {TIERS.map((tier, i) => (
                <Reveal
                  key={tier.title}
                  delay={i * 100}
                  className="flex flex-col rounded-[18px] border border-sage-grey/25 bg-cream p-8"
                >
                  <h3 className="font-serif mb-2.5 text-xl font-bold text-near-black">{tier.title}</h3>
                  <p className="text-[15px] leading-loose text-near-black/70">{tier.body}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={200} className="mt-9">
              <p className="text-base leading-loose text-near-black/70">
                Either way, we&apos;re not interested in a logo wall. We only list businesses we&apos;d actually
                recommend to a friend.
              </p>
            </Reveal>
          </div>
        </section>

        {/* WHO WE'RE LOOKING FOR */}
        <section className="mx-auto max-w-[1200px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal className="mb-14 max-w-[720px]">
            <p className="font-serif mb-4 text-xs font-semibold tracking-widest text-near-black/55 uppercase">
              Who we&apos;re looking for
            </p>
            <h2 className="font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-maroon sm:text-4xl">
              Six kinds of good people
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-0 border-t border-sage-grey/25 sm:grid-cols-2 lg:grid-cols-3">
            {WHO_WE_WANT.map((cat, i) => (
              <Reveal
                key={cat.title}
                delay={i * 60}
                className={`border-b border-sage-grey/25 py-8 ${
                  i % 3 !== 2 ? "lg:border-r lg:pr-8" : ""
                } ${i % 3 !== 0 ? "lg:pl-8" : ""} ${i % 2 === 1 ? "sm:pl-8" : ""}`}
              >
                <h3 className="font-serif mb-2.5 text-lg font-bold text-near-black">{cat.title}</h3>
                <p className="text-[15px] leading-loose text-near-black/70">{cat.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PARTNER DIRECTORY */}
        <section className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="mb-12 max-w-[720px]">
              <p className="font-serif mb-4 text-xs font-semibold tracking-widest text-near-black/55 uppercase">
                The directory
              </p>
              <h2 className="font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-maroon sm:text-4xl">
                Partner directory
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <PartnerDirectory partners={PARTNERS} categories={PARTNER_CATEGORIES} emptyCategories={EMPTY_CATEGORIES} />
            </Reveal>
          </div>
        </section>

        {/* BECOME A PARTNER */}
        <section className="mx-auto max-w-[820px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal className="mb-10">
            <p className="font-serif mb-4 text-xs font-semibold tracking-widest text-near-black/55 uppercase">
              Become a partner
            </p>
            <h2 className="font-serif mb-4 text-[30px] leading-[1.1] font-bold tracking-tight text-maroon sm:text-4xl">
              Tell us about your business
            </h2>
            <p className="text-base leading-loose text-near-black/70">
              Tell us a bit about your business and we&apos;ll get back to you.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <PartnerLeadForm />
          </Reveal>
        </section>
      </main>
    </>
  );
}
