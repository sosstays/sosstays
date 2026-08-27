import { notFound } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/client";
import { LANDING_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildMetadata, SITE_URL } from "@/sanity/metadata";
import { buildUplistingBookingUrl } from "@/sanity/uplisting";
import { JsonLd, buildBreadcrumbSchema } from "@/sanity/jsonld";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { ItineraryTimeline } from "@/components/ItineraryTimeline";
import { StickyBookingBar } from "@/components/StickyBookingBar";
import type { Metadata } from "next";

export const revalidate = 60;

const SLUG = "hotels-near-funtasia";

async function getData() {
  const [page, siteSettings] = await Promise.all([
    client.fetch(LANDING_PAGE_QUERY, { slug: SLUG }),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);
  return { page, siteSettings };
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getData();
  if (!page) return {};
  return buildMetadata(page.seo, `/${SLUG}`);
}

// Splits a string like "~15 min" into its leading number (for CountUp) and
// surrounding text, so CMS-authored stats can animate without hardcoding
// the number separately from its copy.
function splitNumeric(text: string) {
  const match = text.match(/\d+(\.\d+)?/);
  if (!match || match.index === undefined) return null;
  const num = parseFloat(match[0]);
  const decimals = match[0].includes(".") ? match[0].split(".")[1].length : 0;
  return {
    num,
    decimals,
    prefix: text.slice(0, match.index),
    suffix: text.slice(match.index + match[0].length),
  };
}

function StatNumber({ text, className }: { text: string; className?: string }) {
  const parsed = splitNumeric(text);
  if (!parsed) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      <CountUp to={parsed.num} decimals={parsed.decimals} prefix={parsed.prefix} suffix={parsed.suffix} />
    </span>
  );
}

export default async function HotelsNearFuntasiaPage() {
  const { page, siteSettings } = await getData();
  if (!page) notFound();

  const bookingUrl =
    page.primaryCtaUrl ||
    (page.featuredProperty?.uplistingPropertySlug && siteSettings?.bookingSubdomainUrl
      ? buildUplistingBookingUrl({
          bookingSubdomain: siteSettings.bookingSubdomainUrl,
          propertySlug: page.featuredProperty.uplistingPropertySlug,
        })
      : undefined);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: page.heroHeadline || "Hotels near Funtasia", url: `${SITE_URL}/${SLUG}` },
  ]);

  const property = page.featuredProperty;
  const gallery = property?.gallery ?? [];
  const marqueeItems = page.marqueeItems?.length ? page.marqueeItems : page.heroTags ?? [];
  const activitySection = page.infoSections?.find((s) => s.layout === "photoGrid");
  const otherSections = page.infoSections?.filter((s) => s !== activitySection) ?? [];
  const mapQuery = property ? `${property.name}, ${property.location}` : page.distanceLabel;

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      <JsonLd data={breadcrumbSchema} />

      {/* HERO */}
      <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden bg-deep-forest px-8 pt-[180px] pb-16 sm:px-14 sm:pt-[200px]">
        {page.heroImage && (
          <div className="absolute inset-[-12%_0]">
            <Image
              src={urlFor(page.heroImage).width(2000).height(1300).url()}
              alt={page.heroImage.alt ?? page.heroHeadline}
              fill
              priority
              className="sos-hero-ken-burns object-cover"
              style={{ objectPosition: "center 45%" }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-forest/62 via-deep-forest/34 to-deep-forest/82" />

        <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" />

        <div className="relative mx-auto w-full max-w-6xl">
          {page.heroEyebrow && (
            <Reveal as="p" className="mb-3.5 text-[13px] font-semibold tracking-[0.22em] text-light-sage uppercase">
              {page.heroEyebrow}
            </Reveal>
          )}
          <h1 className="max-w-[15ch] font-serif text-[clamp(2.75rem,6.6vw,6.5rem)] leading-[0.98] font-extrabold tracking-tight text-cream">
            {page.heroHeadline}
          </h1>
          {page.heroSubtext && (
            <Reveal as="p" delay={200} className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/88">
              {page.heroSubtext}
            </Reveal>
          )}

          {page.heroTags && page.heroTags.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2.5">
              {page.heroTags.map((tag, i) => (
                <Reveal
                  key={tag}
                  delay={300 + i * 60}
                  as="span"
                  className="rounded-full border border-light-sage/45 bg-cream/10 px-4.5 py-2 text-sm font-semibold text-cream backdrop-blur-sm"
                >
                  {tag}
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={500} className="mt-9 flex flex-wrap items-center gap-3.5">
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full bg-cream px-8.5 py-4.5 text-base font-semibold text-deep-forest transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
              >
                {page.primaryCtaLabel || "Book direct"} →
              </a>
            )}
            {page.secondaryCtaUrl && (
              <a
                href={page.secondaryCtaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-cream/60 px-8 py-4 text-base font-medium text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/14"
              >
                {page.secondaryCtaLabel}
              </a>
            )}
          </Reveal>
        </div>

        {page.distanceStat && (
          <Reveal
            delay={650}
            className="absolute right-8 bottom-16 hidden items-center gap-4 rounded-[18px] border border-cream/24 bg-deep-forest/55 px-6.5 py-5 backdrop-blur-md sm:right-14 sm:flex"
          >
            <span className="relative flex h-2.5 w-2.5 flex-none">
              <span className="sos-distance-pulse absolute inset-0 rounded-full bg-light-sage" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-light-sage" />
            </span>
            <div>
              <StatNumber
                text={page.distanceStat}
                className="font-serif text-3xl leading-none font-bold text-cream"
              />
              {page.distanceLabel && (
                <div className="mt-1.5 text-xs tracking-[0.14em] text-cream/70 uppercase">
                  {page.distanceLabel}
                </div>
              )}
            </div>
          </Reveal>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="22" height="30" viewBox="0 0 22 30" fill="none" aria-hidden="true">
            <path
              d="M11 2v22M4 17l7 7 7-7"
              stroke="rgba(254,254,227,0.62)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      {marqueeItems.length > 0 && (
        <div className="overflow-hidden border-b border-cream/12 bg-forest-green py-5">
          <div className="sos-marquee flex w-max">
            {[0, 1].map((rep) => (
              <div
                key={rep}
                aria-hidden={rep === 1}
                className="flex items-center gap-11 pr-11 text-[15px] font-medium tracking-[0.14em] whitespace-nowrap text-cream/78 uppercase"
              >
                {marqueeItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-11">
                    <span>{item}</span>
                    <span className="text-light-sage">✳</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GEOGRAPHY */}
      {page.distanceStat && (
        <section className="mx-auto max-w-6xl px-8 pt-26 sm:px-14">
          <Reveal as="p" className="mb-3.5 text-[13px] font-semibold tracking-[0.2em] text-forest-green/80 uppercase">
            The geography
          </Reveal>
          {page.geographyHeading && (
            <Reveal
              as="h2"
              delay={80}
              className="max-w-[22ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
            >
              {page.geographyHeading}
            </Reveal>
          )}
          {page.distanceText && (
            <Reveal as="p" delay={150} className="mt-5.5 max-w-2xl text-[17px] leading-relaxed text-near-black/72">
              {page.distanceText}
            </Reveal>
          )}

          <div className="mt-13 grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <Reveal delay={120} className="flex flex-col">
              {property && (
                <div className="rounded-[18px] border border-sage-grey/40 bg-white p-6.5 shadow-[0_4px_16px_hsl(220_20%_20%/0.06)]">
                  <div className="text-xs font-semibold tracking-[0.18em] text-light-sage uppercase">
                    You sleep here
                  </div>
                  <div className="mt-2.5 font-serif text-xl font-bold text-deep-forest">{property.name}</div>
                  <div className="mt-1.5 text-[15px] leading-relaxed text-near-black/62">{property.location}</div>
                </div>
              )}

              <div className="flex items-center gap-4.5 px-6.5 py-4.5">
                <svg width="2" height="72" viewBox="0 0 2 72" className="flex-none" aria-hidden="true">
                  <line x1="1" y1="0" x2="1" y2="72" stroke="var(--light-sage)" strokeWidth="2" strokeDasharray="6 7" strokeLinecap="round" />
                </svg>
                <div>
                  <StatNumber text={page.distanceStat} className="font-serif text-3xl leading-none font-bold text-maroon" />
                  <div className="mt-1.5 text-xs tracking-[0.16em] text-near-black/50 uppercase">Door to door by car</div>
                </div>
              </div>

              <div className="rounded-[18px] border border-sage-grey/40 bg-pale-sage p-6.5">
                <div className="text-xs font-semibold tracking-[0.18em] text-forest-green/80 uppercase">
                  You play here
                </div>
                <div className="mt-2.5 font-serif text-xl font-bold text-deep-forest">
                  {page.destinationName || "Funtasia"}
                </div>
                {page.distanceLabel && (
                  <div className="mt-1.5 text-[15px] leading-relaxed text-near-black/62">{page.distanceLabel}</div>
                )}
              </div>
            </Reveal>

            <Reveal delay={220} className="flex flex-col gap-3.5">
              <div className="relative min-h-[380px] flex-1 overflow-hidden rounded-[18px] border border-sage-grey/40 shadow-[0_12px_32px_hsl(220_20%_20%/0.1)]">
                <iframe
                  title={`Map showing ${mapQuery}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery ?? "")}&output=embed`}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              {page.proximityStats && page.proximityStats.length > 0 && (
                <div className="grid grid-cols-3 gap-3.5">
                  {page.proximityStats.map((stat) => (
                    <div key={stat.label} className="rounded-[10px] border border-sage-grey/40 bg-bright-cream px-5 py-4.5">
                      <StatNumber text={stat.value} className="font-serif text-2xl leading-none font-bold text-deep-forest" />
                      <div className="mt-1.5 text-[13px] text-near-black/60">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {property && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                    `${property.name}, ${property.location}`
                  )}&destination=${encodeURIComponent("Funtasia, Drogheda")}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-forest-green"
                >
                  Get driving directions to Funtasia →
                </a>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* PROPERTY SHOWCASE */}
      {property && (
        <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            {gallery.length > 0 && (
              <Reveal className="grid h-[540px] grid-cols-[1.5fr_1fr] grid-rows-2 gap-3.5">
                <a
                  href={`/stays/${property.slug}`}
                  className="group relative row-span-2 overflow-hidden rounded-[18px]"
                >
                  <Image
                    src={urlFor(gallery[0]).width(900).height(1200).url()}
                    alt={gallery[0].alt ?? property.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </a>
                {gallery.slice(1, 3).map((img, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-[18px]">
                    <Image
                      src={urlFor(img).width(700).height(560).url()}
                      alt={img.alt ?? property.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                ))}
              </Reveal>
            )}

            <div>
              <Reveal as="p" className="mb-3.5 text-[13px] font-semibold tracking-[0.2em] text-forest-green/80 uppercase">
                Where you&apos;ll stay {property.location && `· ${property.location}`}
              </Reveal>
              <Reveal
                as="h2"
                delay={80}
                className="font-serif text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.05] font-bold tracking-tight text-deep-forest"
              >
                {property.name}
              </Reveal>

              {property.reviewScore && (
                <Reveal delay={140} className="mt-5.5 flex items-center gap-3.5">
                  <span className="inline-flex items-baseline gap-1.5 rounded-full bg-deep-forest px-4 py-2 text-cream">
                    <strong className="font-serif text-[17px] font-bold">
                      <CountUp to={property.reviewScore} decimals={1} />
                    </strong>
                    <span className="text-[13px] opacity-85">Superb</span>
                  </span>
                  {property.reviewCount && (
                    <span className="text-sm text-near-black/55">
                      <CountUp to={property.reviewCount} /> reviews
                    </span>
                  )}
                </Reveal>
              )}

              {property.shortDescription && (
                <Reveal as="p" delay={190} className="mt-5.5 text-[17px] leading-relaxed text-near-black/72">
                  {property.shortDescription}
                </Reveal>
              )}

              <Reveal
                delay={240}
                className="mt-7.5 grid grid-cols-4 gap-0 border-t border-b border-sage-grey/40"
              >
                {[
                  { value: property.sleeps, label: "Guests" },
                  { value: property.beds, label: "Beds" },
                  { value: property.bedrooms, label: "Bedrooms" },
                  { value: property.bathrooms, label: "Bathrooms" },
                ].map(
                  (stat) =>
                    stat.value != null && (
                      <div key={stat.label} className="py-5">
                        <div className="font-serif text-3xl leading-none font-bold text-deep-forest">
                          <CountUp to={stat.value} />
                        </div>
                        <div className="mt-1.5 text-xs tracking-[0.14em] text-near-black/50 uppercase">
                          {stat.label}
                        </div>
                      </div>
                    )
                )}
              </Reveal>

              {property.amenities && property.amenities.length > 0 && (
                <Reveal delay={290} className="mt-6 flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full border border-sage-grey/40 bg-bright-cream px-3.5 py-1.5 text-[13px] font-medium text-forest-green"
                    >
                      {amenity}
                    </span>
                  ))}
                </Reveal>
              )}

              <Reveal delay={340} className="mt-8 flex flex-wrap gap-3">
                {bookingUrl && (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full bg-forest-green px-7.5 py-4 text-[15px] font-semibold text-cream transition-all duration-200 hover:-translate-y-0.5 hover:brightness-90"
                  >
                    Check dates &amp; book direct
                  </a>
                )}
                <a
                  href={`/stays/${property.slug}`}
                  className="inline-flex items-center rounded-full border border-forest-green px-7 py-3.5 text-[15px] font-medium text-forest-green transition-colors duration-200 hover:bg-pale-sage"
                >
                  See the full stay
                </a>
              </Reveal>
            </div>
          </div>

          {property.roomTypes && property.roomTypes.length > 0 && (
            <div className="mt-16">
              <Reveal as="h3" className="mb-5.5 font-serif text-2xl font-bold text-deep-forest">
                The rooms — and which one the kids want
              </Reveal>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {property.roomTypes.map((room, i) => (
                  <Reveal
                    key={room.name}
                    delay={60 + i * 80}
                    className="group overflow-hidden rounded-[18px] border border-sage-grey/40 bg-white shadow-[0_4px_16px_hsl(220_20%_20%/0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_hsl(220_20%_20%/0.16)]"
                  >
                    <div className="relative h-[210px] overflow-hidden">
                      {room.image && (
                        <Image
                          src={urlFor(room.image).width(800).height(560).url()}
                          alt={room.image.alt ?? room.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {i === 0 && (
                        <span className="absolute top-3.5 left-3.5 rounded-full bg-maroon px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-cream uppercase">
                          The kids&apos; pick
                        </span>
                      )}
                    </div>
                    <div className="p-5.5 pt-5.5">
                      <div className="font-serif text-lg font-bold text-near-black">{room.name}</div>
                      <div className="mt-2 text-sm leading-relaxed text-near-black/65">
                        {room.bedConfiguration}
                        {room.guests ? ` — sleeps ${room.guests}.` : "."}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* DIRECT BOOKING PUSH */}
      {page.directBookingHeadline && (
        <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
          <Reveal className="relative overflow-hidden rounded-[18px] bg-maroon px-8 py-14 sm:px-16">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/images/sos-mark-pattern.svg')",
                backgroundSize: "150px",
                backgroundRepeat: "repeat",
              }}
            />
            <div className="relative mx-auto max-w-2xl">
              {page.directBookingBadge && (
                <span className="inline-block rounded-full bg-cream/14 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-cream uppercase">
                  {page.directBookingBadge}
                </span>
              )}
              <h2 className="mt-5 max-w-[20ch] font-serif text-[clamp(1.9rem,3.2vw,2.75rem)] leading-[1.06] font-bold tracking-tight text-cream">
                {page.directBookingHeadline}
              </h2>
              {page.directBookingText && (
                <p className="mt-5 text-[17px] leading-relaxed text-cream/78">{page.directBookingText}</p>
              )}
              {bookingUrl && (
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7.5 inline-flex items-center rounded-full bg-cream px-8 py-4 text-[15px] font-semibold text-maroon transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)]"
                >
                  {page.primaryCtaLabel || "Book direct"} →
                </a>
              )}
            </div>
          </Reveal>
        </section>
      )}

      {/* FUNTASIA ACTIVITIES — magazine photo grid, for the info section
          explicitly marked layout: "photoGrid" in Sanity (see landingPage.ts) */}
      {activitySection && (
        <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
          {activitySection.eyebrow && (
            <Reveal as="p" className="mb-3.5 text-[13px] font-semibold tracking-[0.2em] text-forest-green/80 uppercase">
              {activitySection.eyebrow}
            </Reveal>
          )}
          {activitySection.heading && (
            <Reveal
              as="h2"
              delay={80}
              className="max-w-[26ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
            >
              {activitySection.heading}
            </Reveal>
          )}
          {activitySection.body && (
            <Reveal as="p" delay={150} className="mt-5.5 mb-11 max-w-2xl text-[17px] leading-relaxed text-near-black/72">
              {activitySection.body}
            </Reveal>
          )}

          <div className="grid auto-rows-[248px] grid-cols-12 gap-4.5">
            {activitySection.items?.map((item, i) => {
              const big = i === 0;
              const wide = i === activitySection.items!.length - 1 && activitySection.items!.length % 2 !== 0;
              return (
                <Reveal
                  key={item.title ?? i}
                  delay={100 * i}
                  className={`group relative overflow-hidden rounded-[18px] bg-deep-forest ${
                    big
                      ? "col-span-12 row-span-2 lg:col-span-7"
                      : wide
                        ? "col-span-12"
                        : "col-span-12 sm:col-span-6 lg:col-span-5"
                  }`}
                >
                  {item.image && (
                    <Image
                      src={urlFor(item.image).width(1200).height(900).url()}
                      alt={item.image.alt ?? item.title ?? ""}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      style={wide ? { objectPosition: "center 40%" } : undefined}
                    />
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/88 to-transparent ${big ? "to-38%" : "to-30%"}`}
                  />
                  <div className={`absolute right-6 bottom-6 left-6 ${wide ? "top-1/2 right-auto max-w-[46ch] -translate-y-1/2" : ""}`}>
                    {item.tag && (
                      <span className="inline-block rounded-full bg-cream/18 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-cream uppercase backdrop-blur-sm">
                        {item.tag}
                      </span>
                    )}
                    {item.title && (
                      <h3 className={`mt-3 font-serif font-bold text-cream ${big ? "text-3xl" : "text-xl"}`}>
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className={`mt-2 max-w-[46ch] text-cream/82 ${big ? "text-[15px]" : "text-sm"}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          {page.pricingTiers && page.pricingTiers.length > 0 && (
            <Reveal className="mt-6.5 rounded-[18px] border border-sage-grey/40 bg-pale-sage p-8.5 sm:p-9.5">
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div className="flex flex-wrap gap-11">
                  {page.pricingTiers.map((tier) => (
                    <div key={tier.label}>
                      <div className="font-serif text-[34px] leading-none font-bold text-deep-forest">
                        {tier.amount}
                      </div>
                      <div className="mt-1.5 text-xs tracking-[0.14em] text-near-black/55 uppercase">
                        {tier.label}
                      </div>
                    </div>
                  ))}
                </div>
                {(page.pricingNote || page.pricingLink) && (
                  <div className="max-w-[40ch]">
                    {page.pricingNote && (
                      <p className="text-sm leading-relaxed text-near-black/68">{page.pricingNote}</p>
                    )}
                    {page.pricingLink && (
                      <a
                        href={page.pricingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-block text-sm font-semibold text-forest-green"
                      >
                        {page.pricingLinkLabel || "Check current rates →"}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          )}
        </section>
      )}

      {/* OTHER INFO SECTIONS — generic fallback for any section not using layout: "photoGrid" */}
      {otherSections.map((section, i) => (
        <section key={i} className="mx-auto max-w-6xl px-8 pt-16 sm:px-14">
          {section.eyebrow && (
            <p className="mb-2 text-xs font-semibold tracking-widest text-near-black/55 uppercase">
              {section.eyebrow}
            </p>
          )}
          {section.heading && (
            <h2 className="mb-2 font-serif text-[26px] font-bold tracking-tight text-forest-green">
              {section.heading}
            </h2>
          )}
          {section.body && <p className="mb-7 max-w-2xl text-near-black/70">{section.body}</p>}
          {section.items && section.items.length > 0 && (
            <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
              {section.items.map((item, j) => (
                <div key={j} className="rounded-[10px] border border-sage-grey/40 bg-light-sage/10 p-5">
                  {item.tag && (
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide text-forest-green uppercase">
                      {item.tag}
                    </span>
                  )}
                  {item.title && <h3 className="font-serif font-bold text-near-black">{item.title}</h3>}
                  {item.description && (
                    <p className="mt-1 text-[13px] leading-normal text-near-black/65">{item.description}</p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[13px] font-semibold text-forest-green"
                    >
                      Learn more →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* ITINERARY */}
      {page.itineraryDays && page.itineraryDays.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
          {page.itineraryEyebrow && (
            <Reveal as="p" className="mb-3.5 text-[13px] font-semibold tracking-[0.2em] text-forest-green/80 uppercase">
              {page.itineraryEyebrow}
            </Reveal>
          )}
          {page.itineraryHeading && (
            <Reveal
              as="h2"
              delay={80}
              className="max-w-[24ch] font-serif text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.04] font-bold tracking-tight text-deep-forest"
            >
              {page.itineraryHeading}
            </Reveal>
          )}
          {page.itineraryText && (
            <Reveal as="p" delay={150} className="mt-5.5 mb-13 max-w-2xl text-[17px] leading-relaxed text-near-black/72">
              {page.itineraryText}
            </Reveal>
          )}
          <ItineraryTimeline days={page.itineraryDays} />
        </section>
      )}

      {/* WHILE YOU'RE IN THE AREA */}
      {page.relatedAreaGuide?.thingsToDo && page.relatedAreaGuide.thingsToDo.length > 0 && (
        <section className="mx-auto max-w-6xl px-8 pt-28 sm:px-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Reveal as="p" className="mb-3.5 text-[13px] font-semibold tracking-[0.2em] text-forest-green/80 uppercase">
                While you&apos;re in the area
              </Reveal>
              <Reveal
                as="h2"
                delay={80}
                className="max-w-[24ch] font-serif text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.06] font-bold tracking-tight text-deep-forest"
              >
                More from our {page.relatedAreaGuide.areaName} guide
              </Reveal>
            </div>
            <Reveal
              delay={140}
              as="a"
              href={`/areas/${page.relatedAreaGuide.slug}`}
              className="text-[15px] font-semibold text-forest-green"
            >
              See the full area guide →
            </Reveal>
          </div>

          <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {page.relatedAreaGuide.thingsToDo.slice(0, 3).map((item, i) => (
              <Reveal
                key={item.title}
                delay={i * 100}
                as="a"
                href={`/areas/${page.relatedAreaGuide!.slug}`}
                className="group relative block h-[380px] overflow-hidden rounded-[18px] bg-deep-forest"
              >
                {item.image && (
                  <Image
                    src={urlFor(item.image).width(800).height(1000).url()}
                    alt={item.image.alt ?? item.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 to-42% to-transparent" />
                <div className="absolute right-6.5 bottom-6 left-6.5">
                  <h3 className="font-serif text-xl font-bold text-cream">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-cream/82">{item.description}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      {page.finalCtaHeadline && (
        <section className="mx-auto mt-28 mb-24 max-w-6xl px-8 sm:px-14">
          <Reveal className="relative overflow-hidden rounded-[18px] bg-deep-forest px-8 py-20 text-center sm:px-16">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/images/sos-mark-pattern.svg')",
                backgroundSize: "150px",
                backgroundRepeat: "repeat",
              }}
            />
            <div className="relative mx-auto max-w-[660px]">
              <h2 className="font-serif text-[clamp(2rem,3.8vw,3.25rem)] leading-[1.06] font-bold tracking-tight text-cream">
                {page.finalCtaHeadline}
              </h2>
              {page.finalCtaText && (
                <p className="mx-auto mt-5 max-w-[50ch] text-[17px] leading-relaxed text-light-sage">
                  {page.finalCtaText}
                </p>
              )}
              <div className="mt-8.5 flex flex-wrap justify-center gap-3.5">
                {bookingUrl && (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full bg-cream px-8.5 py-4.5 text-base font-semibold text-deep-forest transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.3)]"
                  >
                    {page.primaryCtaLabel || "Book direct"} →
                  </a>
                )}
                {page.finalCtaSecondaryUrl && (
                  <a
                    href={page.finalCtaSecondaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-cream/55 px-8 py-4 text-base font-medium text-cream transition-colors duration-200 hover:bg-cream/14"
                  >
                    {page.finalCtaSecondaryLabel}
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* STICKY BOOKING BAR */}
      {page.stickyBarEnabled !== false && bookingUrl && property && (
        <StickyBookingBar
          title={property.name}
          meta={[
            page.distanceStat && page.distanceLabel ? `${page.distanceStat} from Funtasia` : "",
            property.sleeps ? `Sleeps ${property.sleeps}` : "",
            property.reviewScore && property.reviewCount
              ? `${property.reviewScore} Superb · ${property.reviewCount} reviews`
              : "",
          ].filter(Boolean)}
          ctaLabel={page.primaryCtaLabel || "Book direct"}
          ctaHref={bookingUrl}
        />
      )}
    </main>
  );
}
