"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Button } from "@/components/Button";
import { urlFor } from "@/sanity/image";
import type { StayQuote } from "@/lib/uplistingApi";

// Loaded once at module scope, outside the component, per Stripe's guidance —
// recreating the Stripe object on every render breaks Checkout's iframe.
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// The client-side Appearance API only applies to Elements/PaymentElement —
// an embedded_page Checkout Session's colors/font/border are set server-side
// via `branding_settings` on session creation (see api/checkout/session).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CheckoutAddOn = {
  _id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: ({ alt?: string } & Record<string, unknown>) | null;
};

type Props = {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  quote: StayQuote;
  /** A specific room's Uplisting property id, overriding the property-level one — see RoomBookingBar. */
  propertyId?: number;
  addOns?: CheckoutAddOn[];
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

export function BookingCheckout({
  slug,
  propertyId,
  checkIn,
  checkOut,
  guests,
  quote,
  addOns = [],
}: Props) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const addOnsTotal = useMemo(
    () => addOns.filter((addOn) => selectedAddOnIds.includes(addOn._id)).reduce((sum, addOn) => sum + addOn.price, 0),
    [addOns, selectedAddOnIds]
  );
  const total = quote.total + addOnsTotal;

  function toggleAddOn(id: string) {
    setSelectedAddOnIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }

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
          propertyId,
          checkIn,
          checkOut,
          guests,
          addOnIds: selectedAddOnIds,
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
      <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-bright-cream">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-bright-cream">
      <div className="flex items-center justify-between border-b border-dashed border-border-subtle bg-pale-sage/40 px-[26px] py-[15px]">
        <span className="text-xs font-semibold tracking-[0.06em] text-forest-green uppercase">
          Secure checkout
        </span>
        <span className="flex items-center gap-2 text-xs text-near-black/60">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Payment held by Stripe
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-[34px] py-[26px] sm:px-[42px] sm:pb-[42px]">
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

        {addOns.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-sm text-near-black">Add to your stay</span>
            {addOns.map((addOn) => {
              const checked = selectedAddOnIds.includes(addOn._id);
              return (
                <label
                  key={addOn._id}
                  className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-3.5 transition-colors ${
                    checked ? "border-forest-green bg-light-forest-green/30" : "border-sage-grey/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAddOn(addOn._id)}
                    className="mt-1 h-4 w-4 accent-forest-green"
                  />
                  {addOn.image && (
                    <div className="relative h-14 w-14 flex-none overflow-hidden rounded-[6px]">
                      <Image
                        src={urlFor(addOn.image).width(112).height(112).url()}
                        alt={addOn.image.alt ?? addOn.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-medium text-near-black">{addOn.name}</span>
                      <span className="flex-none text-[15px] text-forest-green">
                        +{formatCurrency(addOn.price, quote.currency)}
                      </span>
                    </div>
                    {addOn.description && (
                      <p className="mt-0.5 text-[13px] text-near-black/60">{addOn.description}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

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
          className="self-start px-8 py-3.5 text-[15px] font-semibold disabled:opacity-60"
        >
          {submitting ? "Preparing payment…" : `Send your SOS — pay ${formatCurrency(total, quote.currency)}`}
        </Button>
      </form>
    </div>
  );
}
