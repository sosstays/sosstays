"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import type { ShopProduct, ShopProperty } from "@/components/shop/ShopClient";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const money = (n: number) => `€${n}`;

// The /shop/checkout page's interactive half — everything from here down
// needs client state (Stripe, form fields), so the page itself stays a
// server component that only fetches the product/properties and renders
// this. Split into two pieces because mounting the PaymentElement needs a
// clientSecret (created here on mount, from just the product + a starting
// quantity), while buyer/recipient/delivery details are validated and
// attached to that same PaymentIntent only at submit time — see
// /api/shop/*-payment-intent for why it's a create/finalize pair rather
// than one call.
export function ShopCheckoutForm({
  product,
  properties,
  initialQuantity,
}: {
  product: ShopProduct;
  properties: ShopProperty[];
  initialQuantity: number;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [paid, setPaid] = useState(false);
  const [paidEmail, setPaidEmail] = useState("");

  const isGoods = product.kind === "goods";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product._id, quantity: initialQuantity }),
    })
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to start checkout");
      });
    return () => {
      cancelled = true;
    };
  }, [product._id, initialQuantity]);

  if (paid) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[18px] border border-forest-green/20 bg-bright-cream p-8">
        <CheckCircle2 size={44} stroke="var(--forest-green)" strokeWidth={1.75} />
        <h2 className="font-serif text-2xl font-bold text-forest-green">You&apos;re all set</h2>
        <p className="text-[15px] leading-relaxed text-near-black/72">
          Payment went through — a receipt is on its way to {paidEmail}.{" "}
          {isGoods
            ? "We'll have it ready in the house before check-in."
            : "We'll be in touch with the voucher shortly."}
        </p>
        <Button link="/shop" variant="secondary" size="md" className="mt-2">
          Back to the shop
        </Button>
      </div>
    );
  }

  if (loadError) {
    return (
      <p role="alert" className="text-[14px] text-error-red">
        {loadError}
      </p>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <p className="text-[14px] text-near-black/55">
        {stripePromise ? "Preparing checkout…" : "Payments are not configured."}
      </p>
    );
  }

  return (
    <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: { variables: { colorPrimary: "#4a5d48" } } }}>
      <CheckoutFields
        product={product}
        properties={properties}
        paymentIntentId={paymentIntentId}
        initialQuantity={initialQuantity}
        onPaid={(email) => {
          setPaidEmail(email);
          setPaid(true);
        }}
      />
    </Elements>
  );
}

function CheckoutFields({
  product,
  properties,
  paymentIntentId,
  initialQuantity,
  onPaid,
}: {
  product: ShopProduct;
  properties: ShopProperty[];
  paymentIntentId: string;
  initialQuantity: number;
  onPaid: (email: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [qty, setQty] = useState(initialQuantity);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [propertySlug, setPropertySlug] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [tomorrow] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const isGoods = product.kind === "goods";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!stripe || !elements) return;
    if (!buyerName.trim()) return setFormError("Let us know your name.");
    if (!EMAIL_PATTERN.test(buyerEmail.trim())) return setFormError("Enter a valid email address.");
    if (isGoods) {
      if (!propertySlug) return setFormError("Pick which stay this is for.");
      if (!arrivalDate) return setFormError("Pick an arrival date.");
    }
    if (recipientEmail.trim() && !EMAIL_PATTERN.test(recipientEmail.trim())) {
      return setFormError("Enter a valid recipient email, or leave it blank.");
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/finalize-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          productId: product._id,
          quantity: qty,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
          ...(isGoods
            ? { propertySlug, arrivalDate }
            : {
                recipientName: recipientName.trim(),
                recipientEmail: recipientEmail.trim(),
                giftNote: giftNote.trim(),
              }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to finalize checkout");

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: { return_url: window.location.href },
      });

      if (confirmError) {
        setFormError(confirmError.message ?? "Payment failed — please try again.");
        setSubmitting(false);
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        onPaid(buyerEmail.trim());
      } else {
        // A redirect-based payment method sent the buyer away and back —
        // Stripe's own redirect handling covers that case; nothing
        // succeeded synchronously here.
        setFormError("Payment did not complete — please try again.");
        setSubmitting(false);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to finalize checkout");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-[18px] border border-sage-grey/25 bg-cream p-7 sm:p-9">
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-1 rounded-full border border-forest-green/30 p-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-deep-forest transition-colors hover:bg-light-sage/45"
          >
            <Minus size={16} />
          </button>
          <span className="font-condensed min-w-[28px] text-center text-[17px] font-bold text-deep-forest">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.maxQuantity, q + 1))}
            aria-label="Increase quantity"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-deep-forest transition-colors hover:bg-light-sage/45"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="text-[13.5px] text-near-black/55">{product.unit}</span>
        <span className="font-condensed ml-auto text-[24px] font-bold text-deep-forest">
          {money(product.price * qty)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">
            Your name <span className="text-error-red">*</span>
          </span>
          <input
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Jane Doe"
            className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">
            Your email <span className="text-error-red">*</span>
          </span>
          <input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-near-black">Phone</span>
        <input
          type="tel"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          placeholder="+353 89 000 0000"
          className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
        />
      </label>

      {isGoods ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-near-black">
              Which stay is this for? <span className="text-error-red">*</span>
            </span>
            <select
              value={propertySlug}
              onChange={(e) => setPropertySlug(e.target.value)}
              className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black focus:border-forest-green focus:outline-none"
            >
              <option value="">Select a property…</option>
              {properties.map((p) => (
                <option key={p._id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-near-black">
              Arrival date <span className="text-error-red">*</span>
            </span>
            <input
              type="date"
              min={tomorrow}
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black focus:border-forest-green focus:outline-none"
            />
          </label>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-near-black">Recipient name</span>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="If this is a gift"
                className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-near-black">Recipient email</span>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Leave blank if it's for you"
                className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-near-black">Gift note</span>
            <input
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              placeholder="Optional — a line to pass on"
              className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
            />
          </label>
        </>
      )}

      <PaymentElement />

      {formError && (
        <p role="alert" className="text-[13px] text-error-red">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        disabled={!stripe || submitting}
        variant="primary"
        size="custom"
        className="self-start px-8 py-3 text-[15px] font-semibold disabled:opacity-60"
      >
        {submitting ? "Processing…" : `Pay now — ${money(product.price * qty)}`}
      </Button>
    </form>
  );
}
