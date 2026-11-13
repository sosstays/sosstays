import Script from "next/script";
import { client } from "@/sanity/client";
import {
  HERO_SECTION_QUERY,
  HOME_PAGE_QUERY,
  HOMEPAGE_BLOG_QUERY,
  HOMEPAGE_QUERY,
  HOSTS_MODULE_QUERY,
  PROMO_GRID_QUERY,
  PROPERTY_ORDER_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata } from "@/sanity/metadata";
import { JsonLd, buildOrganizationSchema } from "@/sanity/jsonld";
import { MARKET } from "@/lib/market";
import { orderProperties } from "@/lib/propertyOrder";
import type { PropertyCardProps } from "@/components/PropertyCard";
import { PropertyCarousel } from "@/components/PropertyCarousel";
import { BespokeTripCta } from "@/components/BespokeTripCta";
import { Button } from "@/components/Button";
import { PromoGrid } from "@/components/PromoGrid";
import { HomeBlogGrid } from "@/components/HomeBlogGrid";
import { HostsModule } from "@/components/HostsModule";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { HomeHero, type HomeHeroPrompt } from "@/components/home/HomeHero";
import { HomeAreaList, type HomeArea } from "@/components/home/HomeAreaList";
import type { Metadata } from "next";

export const revalidate = 60;

type SanityImage = { alt?: string | null } & Record<string, unknown>;

type HomeProperty = PropertyCardProps & {
  _id: string;
  slug: string;
  homepageImage?: SanityImage | null;
};

type HomePageContent = {
  headerCtaLabel?: string | null;
  headerCtaUrl?: string | null;
  searchPrompts?:
    | {
        typedText?: string | null;
        chipLabel?: string | null;
        location?: string | null;
        property?: { name?: string | null; location?: string | null; image?: SanityImage | null } | null;
      }[]
    | null;
} | null;

// Fallback search prompts (Ireland only), used until the Sanity "Homepage"
// document has its own. `match` picks the stay to show by looking for that
// word in a property's location, so the defaults keep working as
// properties are added or renamed. Each `location` must be one of the
// search bar's own locations (see lib/searchLocations.ts).
const DEFAULT_PROMPTS: { text: string; chip: string; location: string; match: string }[] = [
  { text: "A base for Newgrange and the Boyne Valley", chip: "Near Newgrange", location: "Drogheda", match: "Louth" },
  { text: "A farm stay where the kids can meet the animals", chip: "Farm stay", location: "Wexford", match: "Wexford" },
  { text: "Sea views near the Cliffs of Moher", chip: "Sea views in Clare", location: "Clare", match: "Clare" },
];

function heroImages(image?: SanityImage | null) {
  return image
    ? {
        cardImageUrl: urlFor(image).width(420).height(320).url(),
        heroImageUrl: urlFor(image).width(1800).height(1200).url(),
      }
    : { cardImageUrl: null, heroImageUrl: null };
}

export async function generateMetadata(): Promise<Metadata> {
  // Hardcoded here rather than left to the Sanity default-SEO fallback —
  // this exact title/description is the guest-first homepage copy from the
  // SEO audit's first-stage fix, approved separately from the CMS content
  // itself (no Sanity document changed).
  return buildMetadata(
    {
      title: "Holiday Homes & Guest Accommodation in Ireland | SOS Stays",
      description:
        "Explore stays in Louth, Clare and Wexford, check availability and book directly with SOS Stays.",
    },
    ""
  );
}

export default async function HomePage() {
  const [hero, { properties: allProperties, areas }, siteSettings, propertyOrder, hostsModule, promoGrid, homeBlog, homePage] =
    await Promise.all([
      client.fetch(HERO_SECTION_QUERY),
      client.fetch<{ properties: HomeProperty[]; areas: HomeArea[] }>(HOMEPAGE_QUERY),
      client.fetch(SITE_SETTINGS_QUERY),
      client.fetch(PROPERTY_ORDER_QUERY),
      client.fetch(HOSTS_MODULE_QUERY),
      client.fetch(PROMO_GRID_QUERY),
      client.fetch(HOMEPAGE_BLOG_QUERY),
      client.fetch<HomePageContent>(HOME_PAGE_QUERY),
    ]);

  // No cap here — the carousel is what keeps this section manageable as
  // more stays get added; Property Order in Site Settings controls which
  // ones lead. A property's "Homepage image" (if set in Sanity) leads its
  // card: it becomes the cover and the first/large tile of the collage.
  const properties = orderProperties<HomeProperty>(allProperties, propertyOrder?.orderedSlugs).map((property) => {
    const lead = property.homepageImage;
    if (!lead) return property;
    const rest = (property.gallery ?? []).filter((image) => JSON.stringify(image.asset) !== JSON.stringify(lead.asset));
    return { ...property, coverImage: lead, gallery: [lead, ...rest].slice(0, 3) } as HomeProperty;
  });

  const headingLines: string[] = hero?.heading?.split(/\\n|\n/) ?? [];
  const instagramUrl = siteSettings?.socialLinks?.find(
    (link: { platform: string; url: string }) => link.platform === "instagram",
  )?.url;

  // Search prompts: the CMS list when it has usable entries, otherwise the
  // Ireland defaults matched against the live properties.
  const cmsPrompts: HomeHeroPrompt[] = (homePage?.searchPrompts ?? [])
    .filter((p) => p?.typedText && p?.chipLabel && p?.location)
    .map((p) => ({
      text: p.typedText!,
      chip: p.chipLabel!,
      location: p.location!,
      stay: p.property?.name
        ? { name: p.property.name, place: p.property.location, ...heroImages(p.property.image) }
        : null,
    }));
  const defaultPrompts: HomeHeroPrompt[] =
    MARKET === "ie"
      ? DEFAULT_PROMPTS.map(({ match, ...prompt }) => {
          const stay = properties.find((p) => p.location?.includes(match));
          return {
            ...prompt,
            stay: stay
              ? { name: stay.name, place: stay.location, ...heroImages(stay.coverImage as SanityImage | null) }
              : null,
          };
        })
      : [];
  const prompts = cmsPrompts.length > 0 ? cmsPrompts : defaultPrompts;


  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={buildOrganizationSchema(siteSettings)} />

      {/* HERO — photo, headline and the search bar that types its own
          suggestions. The header inside it is only the logo and one
          button; the rest of the navigation is the site-wide bottom menu
          (HomeDock, rendered by the root layout). hero.body (the old CMS
          paragraph) is intentionally not rendered — it covered the same
          ground as the supporting line. The field itself is untouched in
          Sanity. */}
      <HomeHero
        id={hero?.heroSectionId || "hero"}
        eyebrow={hero?.eyebrow}
        headingLines={headingLines}
        supporting="Explore stays in Louth, Clare and Wexford, check availability and book directly with SOS Stays."
        subBody={hero?.subBody}
        imageUrl={hero?.image ? urlFor(hero.image).width(1800).height(1200).url() : null}
        imageAlt={hero?.image?.alt}
        prompts={prompts}
        ctaHref={homePage?.headerCtaUrl || "/corporate-stays"}
        ctaLabel={homePage?.headerCtaLabel || "Corporate stays"}
      />

      {/* LANDLORD BANNER — thin strip under the hero, maroon per the owner-context accent color */}
      {hero?.secondaryCtaLabel && (
        <section id={hero.landlordBannerSectionId || "owners-banner"} className="bg-maroon px-8 py-5 sm:px-14">
          <Reveal className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center sm:justify-between sm:text-left">
            <p className="text-[15px] font-medium text-cream sm:text-base">
              Own a property? We&apos;ll manage it for you and grow your income.
            </p>
            <Button
              link={hero.secondaryCtaUrl || "/landlords"}
              variant="secondary"
              color="cream"
              animateColor="maroon"
              size="custom"
              className="px-6 py-2.5 text-sm font-semibold"
            >
              {hero.secondaryCtaLabel}
            </Button>
          </Reveal>
        </section>
      )}

      {/* FEATURED STAYS — id stays hardcoded (not CMS-editable like the
          other sections): "/#stays" is linked from the nav CTA and footer
          on every page. */}
      {properties.length > 0 && (
        <section id="stays" className="px-8 py-24 sm:px-14 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <Eyebrow className="mb-3" tone="forest" delay={0}>
                The stays
              </Eyebrow>
              <Reveal as="h2" delay={100} className="font-serif text-4xl font-bold tracking-tight text-forest-green sm:text-6xl">
                A few places to start
              </Reveal>
              <Reveal as="p" delay={200} className="mx-auto mt-4 max-w-[380px] text-near-black/60">
                Have a proper look around each one.
              </Reveal>
            </div>

            <PropertyCarousel properties={properties} />

            <div className="mt-12 text-center">
              <Button link="/stays" variant="primary" bgColor="forest-green" color="cream">
                View all stays
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* AREAS — every area guide as a list on a sage band */}
      <HomeAreaList areas={areas} id={hero?.areasSectionId || "areas"} />

      {/* PROMO GRID — image/title/subtitle tiles */}
      <PromoGrid data={promoGrid} />

      {/* HOSTS MODULE — property-owner services overview + pricing */}
      <div className="pt-24 sm:pt-28">
        <HostsModule data={hostsModule} />
      </div>

      {/* BLOG — featured post + two most recent */}
      <HomeBlogGrid data={homeBlog} id={hero?.blogSectionId || "blog"} />

      {/* LANDLORD CTA — maroon per the owner-context accent color */}
      <section id={hero?.landlordsSectionId || "landlords"} className="bg-maroon px-8 py-28 text-center sm:px-14">
        <div className="mx-auto max-w-xl">
          <Eyebrow className="mb-4" tone="sage" delay={0}>For landlords</Eyebrow>
          <Reveal as="h2" delay={120} className="mb-5 font-serif text-4xl leading-tight font-bold tracking-tight text-cream sm:text-5xl">
            Already self-managing your Airbnb?
          </Reveal>
          <Reveal as="p" delay={220} className="mb-9 text-lg leading-relaxed text-cream/85">
            Most self-managing hosts earn 20–35% less than they should. We&apos;ll
            take it fully off your hands — commission-only, no setup fee.
          </Reveal>
          <Reveal delay={320}>
            <Button link="/landlords" variant="secondary" color="cream" animateColor="maroon">
              Send your SOS
            </Button>
          </Reveal>
        </div>
      </section>

      {/* BESPOKE TRIP CTA */}
      <div id={hero?.bespokeTripSectionId || "bespoke-trip"} className="pt-24 sm:pt-28">
        <BespokeTripCta />
      </div>

      {/* INSTAGRAM FEED — last section on the page, just above the footer.
          The feed itself is the third-party Behold widget, left exactly as
          it was. */}
      <section id={hero?.instagramSectionId || "instagram"} className="px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
            <div>
              <Eyebrow className="mb-2" delay={0}>Follow along</Eyebrow>
              <Reveal as="h2" delay={100} className="font-serif text-2xl font-bold tracking-tight text-forest-green sm:text-3xl">
                On Instagram
              </Reveal>
            </div>
            {instagramUrl && (
              <Reveal delay={200}>
                <Button link={instagramUrl} external variant="primary" size="custom" className="px-7 py-3.5 text-[15px] font-semibold">
                  Follow us on Instagram
                </Button>
              </Reveal>
            )}
          </div>
          <Reveal delay={150}>
            <behold-widget feed-id="WcXQ8APwHKWEf2AxzA0R"></behold-widget>
          </Reveal>
        </div>
      </section>
      <Script src="https://w.behold.so/widget.js" type="module" strategy="afterInteractive" />

    </main>
  );
}
