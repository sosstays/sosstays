import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getQuote, UplistingQuoteError } from "@/lib/uplisting";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  const body = await request.json();
  const {
    propertyId,
    checkIn,
    checkOut,
    guests,
    guestName,
    guestEmail,
    guestPhone,
  } = body ?? {};

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return NextResponse.json({ error: "A valid propertyId is required" }, { status: 400 });
  }
  if (!DATE_PATTERN.test(checkIn) || !DATE_PATTERN.test(checkOut) || checkOut <= checkIn) {
    return NextResponse.json({ error: "Invalid check-in/check-out dates" }, { status: 400 });
  }
  if (!Number.isFinite(guests) || guests <= 0) {
    return NextResponse.json({ error: "guests must be greater than 0" }, { status: 400 });
  }
  if (typeof guestName !== "string" || !guestName.trim()) {
    return NextResponse.json({ error: "guestName is required" }, { status: 400 });
  }
  if (typeof guestEmail !== "string" || !EMAIL_PATTERN.test(guestEmail.trim())) {
    return NextResponse.json({ error: "A valid guestEmail is required" }, { status: 400 });
  }

  // Re-fetch the quote server-side rather than trusting a client-supplied
  // amount — this is the number that actually gets charged.
  let quote;
  try {
    quote = await getQuote({ propertyId, checkIn, checkOut, numberOfGuests: guests });
  } catch (err) {
    if (err instanceof UplistingQuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Uplisting quote error:", err);
    return NextResponse.json({ error: "Failed to price this stay" }, { status: 502 });
  }

  const stripe = new Stripe(secretKey);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(quote.total * 100),
      currency: quote.currency.toLowerCase(),
      receipt_email: guestEmail.trim(),
      metadata: {
        propertyId: String(propertyId),
        checkIn,
        checkOut,
        guests: String(guests),
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: typeof guestPhone === "string" ? guestPhone.trim() : "",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, quote });
  } catch (err) {
    console.error("Stripe payment intent error:", err);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 502 });
  }
}
