import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { PROPERTY_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { buildUplistingBookingUrl } from "@/sanity/uplisting";
import { buildMetadata } from "@/sanity/metadata";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: re-fetch at most once a minute

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
    <main className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-[#0F6E56]">
        {property.location}
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-[#1C1C1C]">
        {property.name}
      </h1>
      <p className="mt-4 text-lg text-[#555550]">{property.shortDescription}</p>

      {property.gallery?.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {property.gallery.map((img: any, i: number) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={urlFor(img).width(600).height(600).url()}
                alt={img.alt || property.name}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#555550]">
        {property.sleeps && <span>Sleeps {property.sleeps}</span>}
        {property.bedrooms && <span>· {property.bedrooms} bedrooms</span>}
      </div>

      {property.amenities?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {property.amenities.map((a: string) => (
            <li
              key={a}
              className="rounded-full bg-[#E8F5F0] px-3 py-1 text-sm text-[#0F6E56]"
            >
              {a}
            </li>
          ))}
        </ul>
      )}

      {property.fullDescription && (
        <div className="prose prose-neutral mt-8 max-w-none">
          <PortableText value={property.fullDescription} />
        </div>
      )}

      <div className="mt-10">
        {bookingUrl ? (
          <a
            href={bookingUrl}
            className="inline-block rounded-md bg-[#0F6E56] px-6 py-3 font-medium text-white hover:bg-[#0A5540]"
          >
            Book Now
          </a>
        ) : (
          <span className="inline-block rounded-md bg-[#E2E2DC] px-6 py-3 font-medium text-[#555550]">
            Booking coming soon
          </span>
        )}
      </div>

      {property.relatedAreaGuide && (
        <p className="mt-6 text-sm text-[#555550]">
          Explore more of{" "}
          <Link
            href={`/areas/${property.relatedAreaGuide.slug}`}
            className="text-[#0F6E56] underline"
          >
            {property.relatedAreaGuide.areaName}
          </Link>
        </p>
      )}
    </main>
  );
}
