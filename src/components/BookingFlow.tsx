"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Quote = {
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  numberOfGuests: number;
  currency: string;
  averagePricePerNight: number;
  cleaningFee: number;
  accommodationTotal: number;
  total: number;
};

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency });

function QuoteSummary({ quote }: { quote: Quote }) {
  const format = currencyFormatter(quote.currency);
  return (
    <div className="rounded-[10px] border border-sage-grey/40 p-6">
      <div className="mb-4 flex items-center justify-between text-[15px]">
        <span className="text-near-black/70">
          {format.format(quote.averagePricePerNight)} × {quote.numberOfNights}{" "}
          {quote.numberOfNights === 1 ? "night" : "nights"}
        </span>
        <span className="text-near-black">{format.format(quote.accommodationTotal)}</span>
      </div>
      {quote.cleaningFee > 0 && (
        <div className="mb-4 flex items-center justify-between text-[15px]">
          <span className="text-near-black/70">Cleaning fee</span>
          <span className="text-near-black">{format.format(quote.cleaningFee)}</span>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-sage-grey/40 pt-4 text-base font-semibold">
        <span className="text-near-black">Total</span>
        <span className="text-forest-green">{format.format(quote.total)}</span>
      </div>
    </div>
  );
}

export function BookingFlow({
  propertyId,
  maxGuests,
}: {
  propertyId: number;
  maxGuests?: number;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [detailsError, setDetailsError] = useState("");

  const [clientSecret, setClientSecret] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  async function handleGetPrice(e: React.FormEvent) {
    e.preventDefault();
    setQuoteError("");
    setQuote(null);
    setClientSecret("");

    if (!checkIn || !checkOut) {
      setQuoteError("Pick both a check-in and check-out date.");
      return;
    }
    if (checkOut <= checkIn) {
      setQuoteError("Check-out must be after check-in.");
      return;
    }

    setQuoteLoading(true);
    try {
      const params = new URLSearchParams({
        property_id: String(propertyId),
        check_in: checkIn,
        check_out: checkOut,
        guests: String(guests),
      });
      const res = await fetch(`/api/uplisting/quote?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch a price");
      setQuote(data);
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "Failed to fetch a price");
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();
    setDetailsError("");

    if (!guestName.trim()) {
      setDetailsError("Let us know your name.");
      return;
    }
    if (!EMAIL_PATTERN.test(guestEmail.trim())) {
      setDetailsError("Enter a valid email address.");
      return;
    }

    setPaymentLoading(true);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut,
          guests,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      setClientSecret(data.clientSecret);
      setQuote(data.quote);
    } catch (err) {
      setDetailsError(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setPaymentLoading(false);
    }
  }

  if (paid) {
    return (
      <div className="rounded-[10px] border border-forest-green/40 bg-light-sage/20 p-8 text-center">
        <h2 className="mb-2 font-serif text-2xl font-bold text-forest-green">You&apos;re all set</h2>
        <p className="text-[15px] text-near-black/70">
          Your payment went through and your booking is confirmed. A confirmation will be sent to{" "}
          {guestEmail}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleGetPrice} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-near-black">
              Check-in <span className="text-error-red">*</span>
            </span>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black focus:border-forest-green focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-near-black">
              Check-out <span className="text-error-red">*</span>
            </span>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black focus:border-forest-green focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-near-black">
              Guests <span className="text-error-red">*</span>
            </span>
            <input
              type="number"
              min={1}
              max={maxGuests}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black focus:border-forest-green focus:outline-none"
            />
          </label>
        </div>

        {quoteError && (
          <p role="alert" className="text-[13px] text-error-red">
            {quoteError}
          </p>
        )}

        <Button
          type="submit"
          disabled={quoteLoading}
          variant="primary"
          size="custom"
          className="self-start px-8 py-3 text-[15px] font-semibold disabled:opacity-60"
        >
          {quoteLoading ? "Checking price…" : "Check price"}
        </Button>
      </form>

      {quote && !clientSecret && (
        <>
          <QuoteSummary quote={quote} />

          <form onSubmit={handleContinueToPayment} className="flex flex-col gap-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-near-black">
                Full name <span className="text-error-red">*</span>
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
                placeholder="+44 7700 900000"
                className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
              />
            </label>

            {detailsError && (
              <p role="alert" className="text-[13px] text-error-red">
                {detailsError}
              </p>
            )}

            <Button
              type="submit"
              disabled={paymentLoading}
              variant="primary"
              size="custom"
              className="self-start px-8 py-3 text-[15px] font-semibold disabled:opacity-60"
            >
              {paymentLoading ? "Preparing checkout…" : "Continue to payment"}
            </Button>
          </form>
        </>
      )}

      {quote && clientSecret && (
        <>
          <QuoteSummary quote={quote} />
          <StripeCheckoutForm clientSecret={clientSecret} onPaid={() => setPaid(true)} />
        </>
      )}
    </div>
  );
}
