"use client";

import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Button } from "@/components/Button";
import type { StayQuote } from "@/lib/uplistingApi";

// Loaded once at module scope, outside the component, per Stripe's guidance —
// recreating the Stripe object on every render breaks Checkout's iframe.
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  quote: StayQuote;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

export function BookingCheckout({ slug, checkIn, checkOut, guests, quote }: Props) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const fetchClientSecret = useCallback(() => {
    if (!clientSecret) throw new Error("No client secret available yet");
    return Promise.resolve(clientSecret);
  }, [clientSecret]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Let us know your name.");
      return;
    }
    if (!EMAIL_PATTERN.test(guestEmail.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          checkIn,
          checkOut,
          guests,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || "Could not start checkout");
      }
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
    } finally {
      setSubmitting(false);
    }
  }

  if (clientSecret && stripePromise) {
    return (
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">
            Full Name <span className="text-error-red">*</span>
          </span>
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Jane Doe"
            className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">
            Email <span className="text-error-red">*</span>
          </span>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">Phone</span>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="+353 1 234 5678"
            className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
          />
        </label>

        {error && (
          <p role="alert" className="text-[13px] text-error-red">
            {error}
          </p>
        )}
        {!stripePromise && (
          <p role="alert" className="text-[13px] text-error-red">
            Checkout isn&apos;t configured yet — missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          variant="primary"
          size="custom"
          className="self-start px-8 py-3 text-[15px] font-semibold disabled:opacity-60"
        >
          {submitting ? "Preparing payment…" : "Continue to payment"}
        </Button>
      </form>

      <div className="flex flex-col gap-4 rounded-[10px] border border-sage-grey/40 p-6">
        <div className="flex justify-between text-sm text-near-black/70">
          <span>Check-in</span>
          <span className="text-near-black">{checkIn}</span>
        </div>
        <div className="flex justify-between text-sm text-near-black/70">
          <span>Check-out</span>
          <span className="text-near-black">{checkOut}</span>
        </div>
        <div className="flex justify-between text-sm text-near-black/70">
          <span>Guests</span>
          <span className="text-near-black">{guests}</span>
        </div>
        <div className="my-1 border-t border-sage-grey/40" />
        <div className="flex justify-between text-sm text-near-black/70">
          <span>{quote.numberOfNights} night stay</span>
          <span className="text-near-black">{formatCurrency(quote.accommodationTotal, quote.currency)}</span>
        </div>
        {quote.cleaningFee > 0 && (
          <div className="flex justify-between text-sm text-near-black/70">
            <span>Cleaning fee</span>
            <span className="text-near-black">{formatCurrency(quote.cleaningFee, quote.currency)}</span>
          </div>
        )}
        <div className="my-1 border-t border-sage-grey/40" />
        <div className="flex justify-between text-base font-semibold text-near-black">
          <span>Total</span>
          <span>{formatCurrency(quote.total, quote.currency)}</span>
        </div>
      </div>
    </div>
  );
}
