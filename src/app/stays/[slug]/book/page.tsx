import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { PROPERTY_BOOKING_QUERY } from "@/sanity/queries";
import { getStayQuote, resolveUplistingPropertyId } from "@/lib/uplistingApi";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { StayDateForm } from "@/components/checkout/StayDateForm";
import { BookingCheckout } from "@/components/checkout/BookingCheckout";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Booking pages are transactional, not discoverable content.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await client.fetch(PROPERTY_BOOKING_QUERY, { slug });
  return {
    title: property ? `Book ${property.name} | Sos Stays` : "Book | Sos Stays",
    robots: { index: false, follow: false },
  };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;

  const property = await client.fetch(PROPERTY_BOOKING_QUERY, { slug });
  if (!property) notFound();

  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen overflow-x-hidden bg-cream font-sans text-near-black">
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <section className="mx-auto max-w-5xl px-8 pt-10 pb-20 sm:px-14">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-near-black/55">
          <Link href={`/stays/${slug}`} className="hover:text-near-black">
            {property.name}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-near-black">Book</span>
        </nav>
        <h1 className="mb-8 font-serif text-3xl leading-tight font-extrabold tracking-tight text-near-black sm:text-4xl">
          Complete your booking
        </h1>
        {children}
      </section>
    </main>
  );

  const uplistingPropertyId = resolveUplistingPropertyId(property.uplistingPropertyId);

  if (!uplistingPropertyId) {
    return shell(
      <p className="text-near-black/70">
        Online checkout isn&apos;t set up for this property yet. Please{" "}
        <Link href={`/stays/${slug}`} className="text-forest-green underline">
          go back to the property page
        </Link>{" "}
        and use the Book Now link instead.
      </p>
    );
  }

  const checkIn = first(query.checkIn);
  const checkOut = first(query.checkOut);
  const guestsRaw = first(query.guests);
  const guests = guestsRaw ? Number(guestsRaw) : undefined;

  const hasValidParams =
    checkIn && checkOut && checkOut > checkIn && Number.isInteger(guests) && (guests ?? 0) > 0;

  if (!hasValidParams) {
    return shell(<StayDateForm slug={slug} maxGuests={property.sleeps} />);
  }

  let quote;
  try {
    quote = await getStayQuote({
      propertyId: uplistingPropertyId,
      checkIn: checkIn!,
      checkOut: checkOut!,
      numberOfGuests: guests!,
    });
  } catch (error) {
    console.error("Uplisting quote request failed on /book", error);
    return shell(
      <p role="alert" className="text-error-red">
        We couldn&apos;t fetch a live price for these dates right now. Please try again shortly, or{" "}
        <Link href={`/stays/${slug}`} className="text-forest-green underline">
          go back to the property page
        </Link>
        .
      </p>
    );
  }

  return shell(
    <BookingCheckout slug={slug} checkIn={checkIn!} checkOut={checkOut!} guests={guests!} quote={quote} />
  );
}
