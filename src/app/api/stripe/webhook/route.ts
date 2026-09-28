import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { createUplistingBooking } from "@/lib/uplistingApi";

// Fulfillment step of the embedded-checkout lifecycle: Stripe calls this once
// payment succeeds, and we turn that into a confirmed Uplisting booking.
// Note: no idempotency store yet — Stripe can redeliver this event, which
// would call createUplistingBooking twice for the same session. Fine for a
// first pass at low volume; revisit before this goes to real bookings.
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured || !webhookSecret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Shop orders (see /api/shop/create-payment-intent) pay via a
  // PaymentIntent, not a Checkout Session, so they land here instead of
  // the checkout.session.completed branch below. Every PaymentIntent on
  // the account fires this event — including the ones Checkout Sessions
  // create internally for property bookings — so this only acts on ones
  // it tagged itself via metadata.orderType.
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    if (intent.metadata?.orderType === "shop") {
      // No fulfillment automation yet (see shopProduct.ts): vouchers are
      // sent by hand and goods orders are prepped by hand, both triggered
      // by Stripe's own "successful payment" dashboard notification. This
      // log line is just the server-side paper trail; the metadata below
      // is what actually gets read by whoever fulfils the order.
      console.log("Shop order paid", {
        paymentIntentId: intent.id,
        ...intent.metadata,
      });
    }
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    if (!meta.uplistingPropertyId || !meta.checkIn || !meta.checkOut) {
      console.error("checkout.session.completed missing booking metadata", session.id);
      return NextResponse.json({ error: "Missing booking metadata" }, { status: 400 });
    }

    try {
      const { bookingId } = await createUplistingBooking({
        propertyId: Number(meta.uplistingPropertyId),
        checkIn: meta.checkIn,
        checkOut: meta.checkOut,
        numberOfGuests: Number(meta.guests) || 1,
        guestName: meta.guestName,
        guestEmail: meta.guestEmail || session.customer_details?.email || undefined,
        guestPhone: meta.guestPhone || undefined,
      });
      console.log(`Created Uplisting booking ${bookingId} for Checkout Session ${session.id}`);
    } catch (error) {
      console.error("Failed to create Uplisting booking after payment", session.id, error);
      // Return 500 so Stripe retries — a paid session must not silently fail to book.
      return NextResponse.json({ error: "Booking creation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
