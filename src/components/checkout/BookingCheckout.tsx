"use client";

import { useCallback, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/lib/utils";
import { AddOnSelector, type CheckoutAddOn } from "@/components/checkout/AddOnSelector";
import { PaymentBadge } from "@/components/checkout/PaymentBadge";
import type { StayQuote } from "@/lib/uplistingApi";

export type { CheckoutAddOn };

// Loaded once at module scope, outside the component, per Stripe's guidance —
// recreating the Stripe object on every render breaks Checkout's iframe.
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// The client-side Appearance API only applies to Elements/PaymentElement —
// an embedded_page Checkout Session's colors/font/border are set server-side
// via `branding_settings` on session creation (see api/checkout/session).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function useAddOnSelection(addOns: CheckoutAddOn[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }, []);

  const total = useMemo(
    () => addOns.filter((addOn) => selectedIds.includes(addOn._id)).reduce((sum, addOn) => sum + addOn.price, 0),
    [addOns, selectedIds]
  );

  return { selectedIds, toggle, total };
}

// Guest-details form that, on submit, asks the server for a Stripe embedded
// Checkout Session and swaps itself out for that session's iframe. The
// server (see /api/checkout/session) is the only source of truth for the
// amount charged — it re-derives the quote and re-validates every add-on
// itself rather than trusting anything sent from here.
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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const addOnSelection = useAddOnSelection(addOns);
  const total = quote.total + addOnSelection.total;

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
          addOnIds: addOnSelection.selectedIds,
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
        <PaymentBadge size="sm" className="text-near-black/60" />
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

        <AddOnSelector
          addOns={addOns}
          selectedIds={addOnSelection.selectedIds}
          onToggle={addOnSelection.toggle}
          currency={quote.currency}
        />

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
