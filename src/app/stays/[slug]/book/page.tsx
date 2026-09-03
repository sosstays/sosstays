import { notFound } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { PROPERTY_BOOKING_QUERY } from "@/sanity/queries";
import { getStayQuote, resolveUplistingPropertyId } from "@/lib/uplistingApi";
import { Logo } from "@/components/Logo";
import { StayDateForm } from "@/components/checkout/StayDateForm";
import { BookingCheckout } from "@/components/checkout/BookingCheckout";
import { BookingSummaryCard } from "@/components/checkout/BookingSummaryCard";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

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
    <main className={`${poppins.className} min-h-screen overflow-x-hidden bg-cream font-sans text-near-black`}>
      <div className="relative overflow-hidden bg-deep-forest">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/images/sos-mark-pattern.svg')", backgroundSize: "150px", backgroundRepeat: "repeat" }}
        />
        <header className="relative flex items-center justify-between px-8 py-[22px] sm:px-14">
          <Link href="/" className="flex items-center">
            <Logo className="h-[30px] w-auto text-cream" />
          </Link>
          <span className="flex items-center gap-2 text-sm text-sage-300">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect width="18" height="11" x="3" y="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Payment held by Stripe
          </span>
        </header>
        <div className="relative mx-auto max-w-6xl px-8 pt-[26px] pb-[52px] sm:px-14">
          <span className="mb-3.5 inline-block text-xs tracking-[0.06em] text-sage-300 uppercase">
            Sos · a break, in Irish
          </span>
          <h1 className="mb-3.5 max-w-xl font-serif text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] font-extrabold tracking-tight text-cream">
            Your stay is one step away.
          </h1>
          <p className="max-w-lg text-lg leading-[1.55] text-sage-300">
            Pay below and it&apos;s yours — we&apos;ll email your confirmation right after.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-8 pt-10 pb-20 sm:px-14">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-near-black/55">
          <Link href={`/stays/${slug}`} className="hover:text-near-black">
            {property.name}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-near-black">Book</span>
        </nav>
        {children}
      </section>
    </main>
  );

  // property_id in the URL picks a specific room of a multi-room property
  // (see RoomBookingBar) — it takes precedence over the property-level
  // Sanity field, which only fits a single-listing property.
  const propertyIdParam = first(query.property_id);
  const propertyIdOverride =
    propertyIdParam && Number.isInteger(Number(propertyIdParam)) ? Number(propertyIdParam) : undefined;
  const uplistingPropertyId = propertyIdOverride ?? resolveUplistingPropertyId(property.uplistingPropertyId);

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
    return shell(
      <StayDateForm slug={slug} maxGuests={property.sleeps} propertyId={propertyIdOverride} />
    );
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
      <div className="rounded-[10px] border border-error-red/40 border-l-4 bg-error-red/5 p-5">
        <p role="alert" className="text-error-red">
          We couldn&apos;t fetch a live price for these dates right now. Please try again shortly, or{" "}
          <Link href={`/stays/${slug}`} className="underline">
            go back to the property page
          </Link>
          .
        </p>
      </div>
    );
  }

  return shell(
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <BookingCheckout
        slug={slug}
        propertyId={propertyIdOverride}
        checkIn={checkIn!}
        checkOut={checkOut!}
        guests={guests!}
        quote={quote}
      />
      <div className="lg:sticky lg:top-6">
        <BookingSummaryCard
          property={{
            name: property.name,
            location: property.location,
            coverImage: property.coverImage,
            sleeps: property.sleeps,
          }}
          checkIn={checkIn!}
          checkOut={checkOut!}
          guests={guests!}
          quote={quote}
        />
      </div>
    </div>
  );
}
