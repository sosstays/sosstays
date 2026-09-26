import Image from "next/image";
import { client } from "@/sanity/client";
import { PARTNERS_PAGE_QUERY, PARTNERS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { Button } from "@/components/Button";
import { PartnerDirectory } from "@/components/PartnerDirectory";
import { PartnerLeadForm } from "@/components/PartnerLeadForm";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import {
  PARTNER_CATEGORIES,
  DEFAULT_PARTNERS,
  DEFAULT_SPOTLIGHT_IMAGE,
  getEmptyCategories,
  type Partner,
} from "@/lib/partnersData";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(PARTNERS_PAGE_QUERY);
  return buildMetadata(
    {
      title: page?.seo?.title || "Partner With Sos Stays | Irish Hospitality & Local Business Partners",
      description:
        page?.seo?.description ||
        "Sos Stays partners with cleaners, photographers, tour operators, food producers and hospitality businesses across Ireland. See who we work with, or apply to join.",
      image: page?.seo?.image,
      noIndex: page?.seo?.noIndex,
    },
    "/partners"
  );
}

// ---- Fallback content ----
// This page is driven by the "Partners Page" singleton in Sanity
// (studio/schemaTypes/documents/partnersPage.ts); the directory itself
// comes from the separate, repeatable "partner" documents (partner.ts).
// Everything below is what renders if that content hasn't been created
// yet, so the page never ships half-empty just because an editor hasn't
// filled in every field.

type ImageSlot = { src: string; alt: string };

const DEFAULT_HERO_IMAGE: ImageSlot = {
  src: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1800&q=80",
  alt: "",
};

const DEFAULT_TIERS = [
  {
    title: "Featured Partners",
    body: "Businesses guests will actually book or visit as part of their stay (days out, tours, wellness, food experiences). These get a full profile page: your story, your offer, your photos, and a direct link from ours to yours.",
  },
  {
    title: "Directory Partners",
    body: "Everyone else on this list. A card with your name, what you do, a line on why we rate you, and a link straight to your site or booking page. Simple, but it puts you in front of every guest and every landlord who lands on this page.",
  },
];

const DEFAULT_WHO_WE_WANT = [
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

export default async function PartnersPage() {
  const [data, partnersFromSanity, siteNavLinks] = await Promise.all([
    client.fetch(PARTNERS_PAGE_QUERY),
    client.fetch(PARTNERS_QUERY),
    getGuestSiteNavLinks(),
  ]);

  const heroImage: ImageSlot = data?.heroImage
    ? { src: urlFor(data.heroImage).width(1800).url(), alt: data.heroImage.alt ?? "" }
    : DEFAULT_HERO_IMAGE;

  const tiers = data?.tiers?.length ? data.tiers : DEFAULT_TIERS;
  const whoWeWant = data?.whoWeWantCategories?.length ? data.whoWeWantCategories : DEFAULT_WHO_WE_WANT;
  const partners: Partner[] = partnersFromSanity?.length
    ? partnersFromSanity.map((p) => ({
        ...p,
        slug: p.slug ?? p._id,
        featured: p.featured ?? false,
        image: p.image ? { src: urlFor(p.image).width(900).url(), alt: p.image.alt ?? "" } : undefined,
        profileHref: p.profileHref ?? undefined,
      }))
    : DEFAULT_PARTNERS;
  const emptyCategories = getEmptyCategories(partners);

  const spotlightImage: ImageSlot = data?.spotlightImage
    ? { src: urlFor(data.spotlightImage).width(1600).url(), alt: data.spotlightImage.alt ?? "" }
    : DEFAULT_SPOTLIGHT_IMAGE;

  return (
    <>
      <main className="overflow-x-hidden bg-cream text-near-black">
        {/* HERO */}
        <section className="relative flex flex-col overflow-hidden bg-maroon">
          {/* Nav renders in normal flow here (not as an absolute overlay), so
              it occupies its own space at the top of the section and the
              image below never sits underneath it. */}
          <HeroNav
            links={siteNavLinks}
            variant="landlords"
            ctaHref="/landlords"
            ctaLabel="Send your SOS"
            sticky
          />

          <div className="relative flex-1 px-8 py-16 sm:px-14 sm:py-24">
            <Image src={heroImage.src} alt={heroImage.alt} fill priority className="object-cover object-top" />
            <div className="absolute inset-0 bg-maroon/45" />

            <div className="relative z-10">
              <div className="max-w-[600px] text-left">
                <Reveal as="span" className="mb-7 inline-block rounded-full border border-cream/20 bg-cream/10 px-4.5 py-2 text-xs font-semibold tracking-widest text-cream/80 uppercase">
                  {data?.heroBadge || "Partners"}
                </Reveal>
                <Reveal
                  as="h1"
                  delay={130}
                  className="mb-7 font-serif text-4xl leading-[1.1] font-bold tracking-tight text-cream sm:text-6xl"
                >
                  {data?.heroHeading || "We're better with good people around us. Let's work together."}
                </Reveal>
                <Reveal as="p" delay={260} className="mb-9 max-w-[560px] text-lg leading-relaxed text-cream/90">
                  {data?.introParagraph1 ||
                    "Cleaners, photographers, tour operators and local businesses — see how we work together, and how to get listed."}
                </Reveal>
                <Reveal delay={390} className="flex flex-wrap justify-start gap-4">
                  <Button
                    link="#become-a-partner"
                    variant="primary"
                    bgColor="cream"
                    color="maroon"
                    animateColor="maroon"
                  >
                    Become a partner →
                  </Button>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="mx-auto max-w-[820px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal>
            <p className="mb-6 text-xl leading-relaxed text-near-black sm:text-2xl">
              {data?.introParagraph1 ||
                "Every stay we manage is really a string of small local businesses working together — the cleaner who turns the room around, the photographer who makes it look like itself, the café down the road we send guests to, the operator who takes them out on the water the next morning."}
            </p>
            <p className="mb-6 text-base leading-loose text-near-black/80">
              {data?.introParagraph2 ||
                "We'd rather pay a local business for that than build it all in-house. It keeps the work local, it keeps the money local, and it means every guest gets the actual Irish welcome — not a version of it we invented in an office."}
            </p>
            <p className="text-base leading-loose text-near-black/80">
              {data?.introParagraph3 ||
                "If that sounds like the kind of company you'd want turning up on your books, we'd like to hear from you."}
            </p>
          </Reveal>
        </section>

        {/* HOW WE WORK WITH PARTNERS */}
        <section className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="mb-14 max-w-[720px]">
              <Eyebrow className="mb-4">{data?.tiersEyebrow || "How we work with partners"}</Eyebrow>
              <h2 className="font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-maroon sm:text-4xl">
                {data?.tiersHeading || "Two tiers, not a logo wall"}
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
              {tiers.map((tier: { title: string; body: string }, i: number) => (
                <Reveal
                  key={tier.title}
                  delay={i * 100}
                  className="flex flex-col rounded-[18px] border border-sage-grey/25 bg-cream p-8"
                >
                  <h3 className="font-serif mb-2.5 text-xl font-bold text-maroon">{tier.title}</h3>
                  <p className="text-[15px] leading-loose text-near-black/70">{tier.body}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={200} className="mt-9">
              <p className="text-base leading-loose text-near-black/70">
                {data?.tiersNote ||
                  "Either way, we're not interested in a logo wall. We only list businesses we'd actually recommend to a friend."}
              </p>
            </Reveal>
          </div>
        </section>

        {/* WHO WE'RE LOOKING FOR */}
        <section className="mx-auto max-w-[1200px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal className="mb-14 max-w-[720px]">
            <Eyebrow className="mb-4">{data?.whoWeWantEyebrow || "Who we're looking for"}</Eyebrow>
            <h2 className="font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-maroon sm:text-4xl">
              {data?.whoWeWantHeading || "Six kinds of good people"}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-0 border-t border-sage-grey/25 sm:grid-cols-2 lg:grid-cols-3">
            {whoWeWant.map((cat: { title: string; body: string }, i: number) => (
              <Reveal
                key={cat.title}
                delay={i * 60}
                className={`border-b border-sage-grey/25 py-8 ${
                  i % 3 !== 2 ? "lg:border-r lg:pr-8" : ""
                } ${i % 3 !== 0 ? "lg:pl-8" : ""} ${i % 2 === 1 ? "sm:pl-8" : ""}`}
              >
                <h3 className="font-serif mb-2.5 text-lg font-bold text-maroon">{cat.title}</h3>
                <p className="text-[15px] leading-loose text-near-black/70">{cat.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* SPOTLIGHT IMAGE */}
        <section className="relative overflow-hidden bg-maroon">
          <Image src={spotlightImage.src} alt={spotlightImage.alt} fill className="object-cover opacity-[.38]" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgba(71,45,48,.92), rgba(71,45,48,.55))" }}
          />
          <div className="relative mx-auto max-w-[820px] px-8 py-24 text-center sm:px-14 sm:py-32">
            <Reveal>
              <h2 className="font-serif mb-5 text-[28px] leading-[1.15] font-bold tracking-tight text-cream sm:text-4xl">
                {data?.spotlightHeading || "The kind of local businesses already on the list"}
              </h2>
              <p className="text-lg leading-loose text-cream/80">
                {data?.spotlightBody ||
                  "From family days out to the person who takes the photos that actually sell a stay — a look at who we're already working with."}
              </p>
            </Reveal>
          </div>
        </section>

        {/* PARTNER DIRECTORY */}
        <section className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal className="mb-12 max-w-[720px]">
              <Eyebrow className="mb-4">{data?.directoryEyebrow || "The directory"}</Eyebrow>
              <h2 className="font-serif text-[30px] leading-[1.1] font-bold tracking-tight text-maroon sm:text-4xl">
                {data?.directoryHeading || "Partner directory"}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <PartnerDirectory partners={partners} categories={PARTNER_CATEGORIES} emptyCategories={emptyCategories} />
            </Reveal>
          </div>
        </section>

        {/* BECOME A PARTNER */}
        <section id="become-a-partner" className="mx-auto max-w-[820px] px-8 py-24 sm:px-14 sm:py-28">
          <Reveal className="mb-10">
            <Eyebrow className="mb-4">{data?.becomePartnerEyebrow || "Become a partner"}</Eyebrow>
            <h2 className="font-serif mb-4 text-[30px] leading-[1.1] font-bold tracking-tight text-maroon sm:text-4xl">
              {data?.becomePartnerHeading || "Tell us about your business"}
            </h2>
            <p className="text-base leading-loose text-near-black/70">
              {data?.becomePartnerIntro || "Tell us a bit about your business and we'll get back to you."}
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
