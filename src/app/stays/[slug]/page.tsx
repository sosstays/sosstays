import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { PROPERTY_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { buildUplistingBookingUrl } from "@/sanity/uplisting";
import { buildMetadata } from "@/sanity/metadata";
import { portableTextToPlain } from "@/sanity/portableText";
import { HeroNav } from "@/components/HeroNav";
import { MinimalFooter } from "@/components/MinimalFooter";
import { PropertyGallery } from "@/components/PropertyGallery";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: re-fetch at most once a minute

function BookNowCta({
  bookingUrl,
  className,
}: {
  bookingUrl: string | null;
  className?: string;
}) {
  return bookingUrl ? (
    <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className={className}>
      Book now
    </a>
  ) : (
    <span className={`${className} cursor-not-allowed opacity-60`}>Booking coming soon</span>
  );
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await client.fetch(PROPERTY_PAGE_QUERY, { slug });
  if (!property) return {};
  return buildMetadata(property.seo, `/stays/${slug}`);
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const [property, siteSettings] = await Promise.all([
    client.fetch(PROPERTY_PAGE_QUERY, { slug }),
    client.fetch(SITE_SETTINGS_QUERY),
  ]);

  if (!property) notFound();

  // The Book Now link only resolves once Site Settings has a real
  // booking subdomain URL configured. Until then, show a disabled
  // state rather than a broken link.
  const bookingUrl =
    siteSettings?.bookingSubdomainUrl && property.uplistingPropertySlug
      ? buildUplistingBookingUrl({
          bookingSubdomain: siteSettings.bookingSubdomainUrl,
          propertySlug: property.uplistingPropertySlug,
        })
      : null;

  return (
    <main className="overflow-x-hidden bg-cream font-sans text-near-black">
      {/* HERO GALLERY */}
      <section className="relative">
        <HeroNav />
        <PropertyGallery images={property.gallery ?? []} alt={property.name} />
      </section>

      {/* TITLE BLOCK */}
      <section className="mx-auto max-w-4xl px-8 pt-9 sm:px-14">
        <p className="mb-3 text-xs font-medium tracking-widest text-forest-green uppercase">
          {property.location}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-3xl leading-tight font-extrabold tracking-tight text-near-black sm:text-4xl">
            {property.name}
          </h1>
          {property.sleeps && (
            <span className="rounded-full bg-light-sage/35 px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-forest-green">
              Sleeps {property.sleeps}
            </span>
          )}
        </div>
      </section>

      {/* AVAILABILITY BAR */}
      <section className="mx-auto max-w-4xl px-8 pt-7 sm:px-14">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-[10px] border border-sage-grey/40 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--forest-green)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-none"
            >
              <rect x="4" y="5" width="16" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M4 11h16" />
            </svg>
            <span className="text-[15px] font-medium text-near-black">
              Check availability for your dates
            </span>
          </div>
          <BookNowCta
            bookingUrl={bookingUrl}
            className="inline-block rounded-full bg-forest-green px-7 py-3.5 text-[15px] font-semibold whitespace-nowrap text-cream transition-opacity hover:opacity-85"
          />
        </div>
      </section>

      {/* STORY */}
      <section className="px-8 pt-12 sm:px-14">
        {property.amenities?.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2.5">
            {property.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="rounded-full bg-light-sage/25 px-4 py-2 text-[13px] text-near-black"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
        {(property.sleeps || property.bedrooms) && (
          <p className="mb-5 text-sm text-near-black/60">
            {[
              property.sleeps && `Sleeps ${property.sleeps}`,
              property.bedrooms && `${property.bedrooms} bedrooms`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {property.shortDescription && (
          <p className="mb-5 max-w-[720px] text-lg leading-[1.65] text-near-black">
            {property.shortDescription}
          </p>
        )}
        {property.fullDescription && (
          <div className="prose prose-neutral max-w-[720px] text-near-black/80 [&_p]:my-3">
            <PortableText value={property.fullDescription} />
          </div>
        )}
      </section>

      {/* IN THE AREA */}
      {property.relatedAreaGuide && (
        <section className="mx-auto mt-14 max-w-[1100px] px-8 py-14 sm:px-14">
          <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight text-forest-green">
            In the area
          </h2>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[1.3fr_1fr]">
            <div className="h-[280px] overflow-hidden rounded-[10px] border border-sage-grey/40">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${property.location}, Ireland`
                )}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
            <div>
              {property.relatedAreaGuide.introduction && (
                <p className="mb-4.5 text-[15px] leading-[1.65] text-near-black">
                  {portableTextToPlain(property.relatedAreaGuide.introduction, 260)}
                </p>
              )}
              <Link
                href={`/areas/${property.relatedAreaGuide.slug}`}
                className="text-sm font-semibold text-forest-green"
              >
                Read the {property.relatedAreaGuide.areaName} guide →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {property.faqs?.length > 0 && (
        <section className="mx-auto max-w-[720px] px-8 pb-24 sm:px-14">
          <h2 className="mb-6 font-serif text-2xl font-bold tracking-tight text-forest-green">
            Good to know
          </h2>
          <div className="border-t border-sage-grey/40">
            {property.faqs.map((faq: any, i: number) => (
              <details key={i} className="border-b border-sage-grey/40 py-4.5">
                <summary className="cursor-pointer text-[15px] font-semibold text-near-black marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-near-black/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl px-8 pb-24 text-center sm:px-14">
        <div className="rounded-[18px] bg-forest-green px-8 py-14">
          <h2 className="mb-3 font-serif text-2xl font-bold tracking-tight text-cream">
            Ready to stay at {property.name}?
          </h2>
          <p className="mb-7 text-[15px] text-light-sage">Check your dates and send it.</p>
          <BookNowCta
            bookingUrl={bookingUrl}
            className="inline-block rounded-full bg-cream px-8 py-4 text-[15px] font-semibold text-forest-green transition-opacity hover:opacity-85"
          />
        </div>
      </section>

      <MinimalFooter />
    </main>
  );
}
