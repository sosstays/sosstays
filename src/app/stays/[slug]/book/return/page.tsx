import Link from "next/link";
import type { Metadata } from "next";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export default async function BookReturnPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { session_id: sessionId } = await searchParams;

  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen overflow-x-hidden bg-cream font-sans text-near-black">
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <section className="mx-auto max-w-2xl px-8 pt-16 pb-24 text-center sm:px-14">{children}</section>
    </main>
  );

  if (!isStripeConfigured || !sessionId) {
    return shell(
      <p className="text-near-black/70">
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

  if (session.status === "complete") {
    return shell(
      <>
        <h1 className="mb-4 font-serif text-3xl font-extrabold tracking-tight text-near-black">
          Booking confirmed
        </h1>
        <p className="mb-2 text-near-black/80">
          Thanks{meta.guestName ? `, ${meta.guestName}` : ""} — a confirmation email is on its way to{" "}
          {session.customer_details?.email ?? "your inbox"}.
        </p>
        {meta.checkIn && meta.checkOut && (
          <p className="mb-8 text-near-black/60">
            {meta.checkIn} to {meta.checkOut} · {meta.guests} guest{meta.guests === "1" ? "" : "s"}
          </p>
        )}
        <Link href={`/stays/${slug}`} className="text-forest-green underline">
          Back to the property
        </Link>
      </>
    );
  }

  return shell(
    <>
      <h1 className="mb-4 font-serif text-3xl font-extrabold tracking-tight text-near-black">
        Payment didn&apos;t go through
      </h1>
      <p className="mb-8 text-near-black/70">Your card wasn&apos;t charged. You can try again below.</p>
      <Link
        href={`/stays/${slug}/book?${retryParams.toString()}`}
        className="text-forest-green underline"
      >
        Try again
      </Link>
    </>
  );
}
