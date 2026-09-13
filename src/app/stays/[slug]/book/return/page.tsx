import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { PROPERTY_BOOKING_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { stripe, isStripeConfigured } from "@/lib/stripe";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BookReturnPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { session_id: sessionId } = await searchParams;

  const shell = (children: React.ReactNode) => (
    <main className={`${poppins.className} min-h-screen overflow-x-hidden bg-cream font-sans text-near-black`}>
      <header className="flex items-center justify-between px-8 py-[22px] sm:px-14">
        <Link href="/" className="flex items-center">
          <Logo className="h-[30px] w-auto text-forest-green" />
        </Link>
      </header>
      <section className="mx-auto max-w-[760px] px-6 pt-8 pb-16">{children}</section>
    </main>
  );

  if (!isStripeConfigured || !sessionId) {
    return shell(
      <p className="text-center text-near-black/70">
        We couldn&apos;t find that checkout session.{" "}
        <Link href={`/stays/${slug}`} className="text-forest-green underline">
          Back to the property
        </Link>
        .
      </p>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const meta = session.metadata ?? {};
  const retryParams = new URLSearchParams({
    checkIn: meta.checkIn ?? "",
    checkOut: meta.checkOut ?? "",
    guests: meta.guests ?? "",
  });

  if (session.status !== "complete") {
    return shell(
      <div className="text-center">
        <h1 className="mb-4 font-serif text-3xl font-extrabold tracking-tight text-near-black">
          Payment didn&apos;t go through
        </h1>
        <p className="mb-8 text-near-black/70">Your card wasn&apos;t charged. You can try again below.</p>
        <Link href={`/stays/${slug}/book?${retryParams.toString()}`} className="text-forest-green underline">
          Try again
        </Link>
      </div>
    );
  }

  const property = await client.fetch(PROPERTY_BOOKING_QUERY, { slug });
  const confirmationCode = `SOS-${session.id.slice(-6).toUpperCase()}`;
  const guestCount = Number(meta.guests) || undefined;

  return shell(
    <>
      <div className="pb-8 text-center">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" className="mx-auto mb-4">
          <circle cx="50" cy="50" r="38" stroke="var(--light-sage)" strokeWidth="3" />
          <path d="M34 51l11 11 22-23" stroke="var(--forest-green)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="mb-2.5 font-serif text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] font-extrabold tracking-tight text-near-black">
          That&apos;s your break sorted.
        </h1>
        <p className="mx-auto max-w-[420px] text-lg leading-[1.55] text-near-black/70">
          Details are on their way to {session.customer_details?.email ?? "your inbox"}. Turn up, take a
          breath, settle in.
        </p>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-bright-cream">
        {property?.coverImage ? (
          <div className="relative h-[200px] w-full">
            <Image
              src={urlFor(property.coverImage).width(1000).height(400).url()}
              alt={property.name}
              fill
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="px-8 py-8 sm:px-[46px] sm:py-10">
          <dl className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-6 text-[15px] sm:grid-cols-[160px_minmax(0,1fr)]">
            {meta.checkIn && meta.checkOut && (
              <>
                <dt className="border-b border-border-subtle py-3.5 text-near-black/60">Dates</dt>
                <dd className="border-b border-border-subtle py-3.5 font-semibold text-near-black">
                  {formatDate(meta.checkIn)} – {formatDate(meta.checkOut)}
                </dd>
              </>
            )}
            {property?.name && (
              <>
                <dt className="border-b border-border-subtle py-3.5 text-near-black/60">Property</dt>
                <dd className="border-b border-border-subtle py-3.5 font-semibold text-near-black">
                  {property.name}
                  {guestCount ? ` · ${guestCount} guest${guestCount === 1 ? "" : "s"}` : ""}
                </dd>
              </>
            )}
            <dt className="border-b border-border-subtle py-3.5 text-near-black/60">Total paid</dt>
            <dd className="border-b border-border-subtle py-3.5 font-semibold text-near-black">
              {typeof session.amount_total === "number"
                ? new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: session.currency?.toUpperCase() ?? "GBP",
                  }).format(session.amount_total / 100)
                : "—"}
            </dd>
            <dt className="py-3.5 text-near-black/60">Confirmation</dt>
            <dd className="py-3.5 font-semibold tracking-[0.06em] text-near-black">{confirmationCode}</dd>
          </dl>

          <div className="mt-7 flex gap-3">
            <Button link={`/stays/${slug}`} variant="secondary" size="md">
              Book another stay
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
