"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Search, X, Minus, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export type ShopProduct = {
  _id: string;
  kind: "voucher" | "goods";
  name: string;
  tagline: string;
  badge: string;
  price: number;
  unit: string;
  maxQuantity: number;
  image: { src: string; alt: string } | null;
  shortDescription: string;
  description: string;
  includes: string[];
  deliveryNote: string;
};

export type ShopProperty = { _id: string; name: string; slug: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const money = (n: number) => `€${n}`;

export function ShopClient({
  products,
  properties,
  vouchersBlurb,
  goodsBlurb,
}: {
  products: ShopProduct[];
  properties: ShopProperty[];
  vouchersBlurb: string;
  goodsBlurb: string;
}) {
  const [world, setWorld] = useState<"voucher" | "goods">("voucher");
  const [query, setQuery] = useState("");
  const [openProduct, setOpenProduct] = useState<ShopProduct | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => p.kind === world)
      .filter((p) => !q || `${p.name} ${p.tagline} ${p.shortDescription}`.toLowerCase().includes(q));
  }, [products, world, query]);

  const isVoucherWorld = world === "voucher";

  return (
    <section
      className="relative transition-colors duration-500"
      style={{ background: isVoucherWorld ? "#22301f" : "#e4ebd9" }}
    >
      <div
        className="sticky top-0 z-40 border-b px-8 py-5 backdrop-blur-md transition-colors duration-500 sm:px-14"
        style={{
          background: isVoucherWorld ? "rgba(34,48,31,0.93)" : "rgba(228,235,217,0.94)",
          borderColor: isVoucherWorld ? "rgba(254,254,227,0.22)" : "rgba(74,93,72,0.2)",
        }}
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-5">
          <div
            className="flex gap-1.5 rounded-full border p-1.5"
            style={{
              borderColor: isVoucherWorld ? "rgba(254,254,227,0.22)" : "rgba(74,93,72,0.2)",
              background: isVoucherWorld ? "rgba(254,254,227,0.08)" : "rgba(254,254,227,0.75)",
            }}
          >
            <button
              type="button"
              onClick={() => setWorld("voucher")}
              className="rounded-full px-6 py-3 text-[14.5px] font-semibold transition-colors duration-300"
              style={{
                background: isVoucherWorld ? "#acc196" : "transparent",
                color: isVoucherWorld ? "#22301f" : "rgba(34,48,31,0.72)",
              }}
            >
              eVouchers
            </button>
            <button
              type="button"
              onClick={() => setWorld("goods")}
              className="rounded-full px-6 py-3 text-[14.5px] font-semibold transition-colors duration-300"
              style={{
                background: isVoucherWorld ? "transparent" : "#4a5d48",
                color: isVoucherWorld ? "rgba(254,254,227,0.72)" : "#fefee3",
              }}
            >
              Real things
            </button>
          </div>

          <div className="relative max-w-[420px] flex-1" style={{ minWidth: "260px" }}>
            <Search
              size={18}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 opacity-60"
              color="#4a5d48"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the shop…"
              aria-label="Search the shop"
              className="w-full rounded-xl border border-forest-green/30 bg-cream py-3.5 pr-4.5 pl-11 text-[15px] text-near-black outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(172,193,150,0.55)]"
            />
          </div>

          <span
            className="text-[13px] font-semibold tracking-widest uppercase"
            style={{ color: isVoucherWorld ? "rgba(254,254,227,0.68)" : "rgba(34,48,31,0.68)" }}
          >
            {list.length} {list.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-8 pt-10 pb-28 sm:px-14">
        <p
          className="mb-8 max-w-[56ch] text-[16.5px] leading-relaxed"
          style={{ color: isVoucherWorld ? "rgba(254,254,227,0.68)" : "rgba(34,48,31,0.68)" }}
        >
          {isVoucherWorld ? vouchersBlurb : goodsBlurb}
        </p>

        {list.length === 0 ? (
          <p
            className="my-10 text-[17px]"
            style={{ color: isVoucherWorld ? "rgba(254,254,227,0.68)" : "rgba(34,48,31,0.68)" }}
          >
            Nothing matches that search — try a different word, or switch shelf.
          </p>
        ) : isVoucherWorld ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <VoucherCard key={p._id} product={p} onOpen={() => setOpenProduct(p)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <GoodsCard key={p._id} product={p} onOpen={() => setOpenProduct(p)} />
            ))}
          </div>
        )}
      </div>

      {openProduct && (
        <ProductModal
          product={openProduct}
          properties={properties}
          onClose={() => setOpenProduct(null)}
        />
      )}
    </section>
  );
}

function VoucherCard({ product, onOpen }: { product: ShopProduct; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group flex cursor-pointer overflow-hidden rounded-2xl bg-cream text-left shadow-[0_6px_20px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.24)]"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative h-[170px] overflow-hidden bg-pale-sage">
          {product.image && (
            <Image src={product.image.src} alt={product.image.alt || product.name} fill className="object-cover" />
          )}
          <span className="absolute top-3.5 left-3.5 rounded-full bg-deep-forest/90 px-3 py-1.5 text-[11px] font-bold tracking-widest text-cream uppercase">
            {product.badge}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-5 py-5">
          <h3 className="font-serif text-[22px] leading-tight font-bold text-deep-forest">{product.name}</h3>
          <p className="mt-1.5 text-[14px] font-medium text-near-black/55">{product.tagline}</p>
          <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-near-black/72">{product.shortDescription}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-forest-green">
            Details and quantity <span aria-hidden>→</span>
          </span>
        </div>
      </div>
      <div className="flex w-[84px] flex-none flex-col items-center justify-center gap-2.5 border-l-2 border-dashed border-forest-green/30 bg-forest-green">
        <span className="font-condensed text-[24px] font-bold text-cream">{money(product.price)}</span>
        <span
          className="font-condensed text-[10px] font-bold tracking-widest text-cream/65 uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Sos eVoucher
        </span>
      </div>
    </div>
  );
}

function GoodsCard({ product, onOpen }: { product: ShopProduct; onOpen: () => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[18px] border border-forest-green/18 bg-cream text-left shadow-[0_2px_10px_rgba(34,48,31,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(34,48,31,0.18)]"
    >
      <div className="relative h-[210px] overflow-hidden bg-pale-sage">
        {product.image && (
          <Image
            src={product.image.src}
            alt={product.image.alt || product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute top-3.5 left-3.5 rounded-full bg-cream/95 px-3 py-1.5 text-[11px] font-bold tracking-widest text-deep-forest uppercase">
          {product.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5.5 py-5">
        <div className="flex items-baseline justify-between gap-3.5">
          <h3 className="font-serif text-[21px] leading-tight font-bold text-deep-forest">{product.name}</h3>
          <span className="font-condensed text-[19px] font-bold text-forest-green">{money(product.price)}</span>
        </div>
        <p className="mt-1.5 text-[14px] font-medium text-near-black/55">{product.tagline}</p>
        <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-near-black/72">{product.shortDescription}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-forest-green">
          Details and quantity <span aria-hidden>→</span>
        </span>
      </div>
    </article>
  );
}

function ProductModal({
  product,
  properties,
  onClose,
}: {
  product: ShopProduct;
  properties: ShopProperty[];
  onClose: () => void;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [paid, setPaid] = useState(false);
  const [paidEmail, setPaidEmail] = useState("");

  const isGoods = product.kind === "goods";

  // Mounting the PaymentElement needs a clientSecret, so one is created as
  // soon as the item is opened — on the same screen as the name/card
  // fields, rather than after a separate "continue" step. It only knows
  // the product + a starting quantity at this point; the buyer's details
  // and the final quantity are validated and attached to this same
  // PaymentIntent at submit time by finalize-payment-intent, right before
  // confirmPayment (see that route for why).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product._id, quantity: 1 }),
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
  }, [product._id]);

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-6">
      <div onClick={onClose} className="absolute inset-0 bg-[rgba(23,28,22,0.62)]" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative grid max-h-[88vh] w-full max-w-[940px] grid-cols-1 overflow-auto rounded-[22px] bg-cream shadow-[0_40px_90px_rgba(23,28,22,0.45)] sm:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="relative min-h-[220px] bg-pale-sage sm:min-h-[340px]">
          {product.image && (
            <Image src={product.image.src} alt={product.image.alt || product.name} fill className="object-cover" />
          )}
          <span className="absolute top-4.5 left-4.5 rounded-full bg-deep-forest/90 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-cream uppercase">
            {product.badge}
          </span>
        </div>

        <div className="px-7 py-8 sm:px-9">
          <div className="flex items-start justify-between gap-4.5">
            <div>
              <h2 className="font-serif text-[30px] leading-[1.05] font-bold text-deep-forest">{product.name}</h2>
              <p className="mt-2 text-[15px] font-medium text-near-black/55">{product.tagline}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-full border border-forest-green/30 text-deep-forest transition-colors hover:bg-light-sage/40"
            >
              <X size={17} />
            </button>
          </div>

          {paid ? (
            <div className="mt-8 flex flex-col items-start gap-3">
              <CheckCircle2 size={44} stroke="var(--forest-green)" strokeWidth={1.75} />
              <h3 className="font-serif text-2xl font-bold text-forest-green">You&apos;re all set</h3>
              <p className="text-[15px] leading-relaxed text-near-black/72">
                Payment went through — a receipt is on its way to {paidEmail}.{" "}
                {isGoods
                  ? "We'll have it ready in the house before check-in."
                  : "We'll be in touch with the voucher shortly."}
              </p>
              <Button variant="secondary" size="md" onClick={onClose} className="mt-2">
                Close
              </Button>
            </div>
          ) : (
            <>
              <p className="mt-5 text-[15.5px] leading-relaxed text-near-black/75">{product.description}</p>

              <div className="mt-5.5 flex flex-col gap-2.5">
                {product.includes.map((line) => (
                  <div key={line} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-near-black/72">
                    <span className="mt-2 h-1.75 w-1.75 flex-none rounded-full bg-light-sage" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5.5 rounded-xl bg-light-sage/30 px-4.5 py-3.5 text-[14px] leading-relaxed text-deep-forest">
                {product.deliveryNote}
              </div>

              {loadError ? (
                <p role="alert" className="mt-6 text-[13px] text-error-red">
                  {loadError}
                </p>
              ) : !clientSecret || !stripePromise ? (
                <p className="mt-6 text-[14px] text-near-black/55">
                  {stripePromise ? "Preparing checkout…" : "Payments are not configured."}
                </p>
              ) : (
                <Elements
                  key={clientSecret}
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: { variables: { colorPrimary: "#4a5d48" } } }}
                >
                  <CheckoutFields
                    product={product}
                    properties={properties}
                    paymentIntentId={paymentIntentId}
                    onPaid={(email) => {
                      setPaidEmail(email);
                      setPaid(true);
                    }}
                  />
                </Elements>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Buyer/recipient/delivery fields and the card element together, one
// screen, one submit — see the create/finalize split in
// web/src/app/api/shop/*-payment-intent for how the amount and
// fulfillment metadata get attached before this confirms payment. Needs
// useStripe/useElements, so it has to live inside <Elements>, as a
// sibling of everything that doesn't (the product description above it
// stays in ProductModal).
function CheckoutFields({
  product,
  properties,
  paymentIntentId,
  onPaid,
}: {
  product: ShopProduct;
  properties: ShopProperty[];
  paymentIntentId: string;
  onPaid: (email: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [qty, setQty] = useState(1);
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
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
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
