"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/Button";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function PayButton({ onPaid }: { onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed — please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onPaid();
    } else {
      // A redirect-based payment method sent the guest away and back —
      // Stripe's own redirect handling covers that case; nothing succeeded
      // synchronously here.
      setError("Payment did not complete — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      {error && (
        <p role="alert" className="text-[13px] text-error-red">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={!stripe || submitting}
        variant="primary"
        size="custom"
        className="self-start px-8 py-3 text-[15px] font-semibold disabled:opacity-60"
      >
        {submitting ? "Processing…" : "Pay now"}
      </Button>
    </form>
  );
}

export function StripeCheckoutForm({
  clientSecret,
  onPaid,
}: {
  clientSecret: string;
  onPaid: () => void;
}) {
  if (!stripePromise) {
    return (
      <p role="alert" className="text-[13px] text-error-red">
        Payments are not configured.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PayButton onPaid={onPaid} />
    </Elements>
  );
}
