"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/lib/utils";
import { AddOnSelector, type CheckoutAddOn } from "@/components/checkout/AddOnSelector";
import { PaymentBadge } from "@/components/checkout/PaymentBadge";
import type { StayQuote } from "@/lib/uplistingApi";

export type { CheckoutAddOn };

// A Stripe fixed-amount promo code the guest has successfully applied —
// see api/checkout/promo, which looks this up. Percent-off coupons aren't
// supported yet (see that route for why).
export type AppliedPromo = { code: string; promotionCodeId: string; discountAmount: number };

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
  /** Called whenever the selected add-ons or applied promo change, so a parent can keep the summary card in sync. */
  onSummaryChange?: (summary: { selectedAddOns: CheckoutAddOn[]; promo: AppliedPromo | null }) => void;
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
  onSummaryChange,
}: Props) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const addOnSelection = useAddOnSelection(addOns);

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "checking" | "applied" | "invalid" | "error">("idle");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const total = Math.max(0, quote.total + addOnSelection.total - (appliedPromo?.discountAmount ?? 0));

  useEffect(() => {
    onSummaryChange?.({
      selectedAddOns: addOns.filter((addOn) => addOnSelection.selectedIds.includes(addOn._id)),
      promo: appliedPromo,
    });
  }, [addOns, addOnSelection.selectedIds, appliedPromo, onSummaryChange]);

  async function applyPromoCode() {
    const code = promoCodeInput.trim();
    if (!code) return;
    setPromoStatus("checking");
    setPromoError("");
    try {
      const res = await fetch("/api/checkout/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, currency: quote.currency }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoStatus("invalid");
        setPromoError(data.error || "That promo code isn't valid.");
        return;
      }
      setAppliedPromo({ code, promotionCodeId: data.promotionCodeId, discountAmount: data.discountAmount });
      setPromoStatus("applied");
    } catch {
      setPromoStatus("error");
      setPromoError("Couldn't check that code — please try again.");
    }
  }

  function clearPromoCode() {
    setAppliedPromo(null);
    setPromoStatus("idle");
    setPromoError("");
    setPromoCodeInput("");
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
          addOnIds: addOnSelection.selectedIds,
          promotionCodeId: appliedPromo?.promotionCodeId,
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
    // No border/background here — Stripe's embedded_page iframe already
    // draws its own card chrome via branding_settings (see api/checkout/
    // session), so wrapping it in another bordered box just doubles the
    // frame at the edges. overflow-hidden still clips it to our radius.
    return (
      <div className="overflow-hidden rounded-[18px] shadow-[0_1px_3px_rgba(30,26,15,0.08)]">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-bright-cream shadow-[0_1px_3px_rgba(30,26,15,0.08)]">
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

        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">Promo code</span>
          {appliedPromo ? (
            <div className="flex items-center justify-between rounded-[10px] border border-forest-green bg-light-forest-green/30 px-3.5 py-2.5">
              <span className="text-[15px] text-near-black">
                <strong className="font-medium">{appliedPromo.code}</strong> applied — −
                {formatCurrency(appliedPromo.discountAmount, quote.currency)}
              </span>
              <button
                type="button"
                onClick={clearPromoCode}
                className="text-[13px] font-medium text-near-black/60 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={promoCodeInput}
                onChange={(e) => {
                  setPromoCodeInput(e.target.value);
                  if (promoStatus !== "idle") setPromoStatus("idle");
                }}
                placeholder="Enter code"
                className="min-w-0 flex-1 border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
              />
              <button
                type="button"
                onClick={applyPromoCode}
                disabled={!promoCodeInput.trim() || promoStatus === "checking"}
                className="flex-none self-end pb-1.5 text-[13px] font-semibold text-forest-green underline decoration-dotted underline-offset-2 disabled:opacity-50"
              >
                {promoStatus === "checking" ? "Checking…" : "Apply"}
              </button>
            </div>
          )}
          {(promoStatus === "invalid" || promoStatus === "error") && (
            <p className="text-[13px] text-error-red">{promoError}</p>
          )}
        </div>

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
