import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createBooking } from "@/lib/uplisting";

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone } =
      paymentIntent.metadata;

    try {
      const booking = await createBooking({
        propertyId: Number(propertyId),
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        guestPhone: guestPhone || undefined,
        numberOfGuests: Number(guests),
      });
      console.log(`Created Uplisting booking ${booking.id} for payment ${paymentIntent.id}`);
    } catch (err) {
      // The guest has already been charged at this point — a failure here
      // needs a human to reconcile it manually rather than silently losing
      // the booking, so this logs loudly instead of retrying automatically.
      console.error(
        `Payment ${paymentIntent.id} succeeded but Uplisting booking creation failed — needs manual follow-up:`,
        err,
      );
      return NextResponse.json({ error: "Booking creation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
