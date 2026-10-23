import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { createUplistingBooking } from "@/lib/uplistingApi";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Inserts the shop_orders row (unique on PaymentIntent id, so redeliveries
// can't duplicate it). Returns false only when the order could not be stored,
// which is the one case worth a Stripe retry.
async function recordShopOrder(intent: Stripe.PaymentIntent): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return true; // not configured: keep the old log-only behaviour

  const m = intent.metadata ?? {};
  // Metadata is attached by /api/shop/finalize-payment-intent before the card
  // is confirmed; a PaymentIntent confirmed without that call has no buyer
  // details. buyer_email is NOT NULL, so fall back to the receipt email and
  // otherwise give up loudly — a 500 here would make Stripe retry forever
  // for an order that can never be stored.
  const buyerEmail = m.buyerEmail || intent.receipt_email;
  if (!buyerEmail) {
    console.error(
      "Shop order paid but has no buyer email, cannot store it — fulfil manually from the Stripe dashboard",
      { paymentIntentId: intent.id, amount: intent.amount_received || intent.amount, metadata: m }
    );
    return true;
  }
  const { error } = await supabase.from("shop_orders").insert({
    stripe_payment_intent_id: intent.id,
    product_id: m.productId || null,
    product_name: m.productName || "Shop order",
    product_kind: m.productKind === "goods" ? "goods" : "voucher",
    quantity: Number(m.quantity) || 1,
    amount_total: intent.amount_received || intent.amount,
    currency: intent.currency,
    buyer_name: m.buyerName || null,
    buyer_email: buyerEmail,
    buyer_phone: m.buyerPhone || null,
    recipient_name: m.recipientName || null,
    recipient_email: m.recipientEmail || null,
    gift_note: m.giftNote || null,
    delivery_method: m.deliveryMethod || null,
    delivery_address: m.deliveryAddress || null,
    delivery_postcode: m.deliveryPostcode || null,
    property_slug: m.propertySlug || null,
    property_name: m.propertyName || null,
    arrival_date: m.arrivalDate || null,
    stay_date_type: m.stayDateType || null,
  });
  // 23505 = unique violation: Stripe redelivered an event we already stored.
  if (error && error.code !== "23505") {
    console.error("Failed to insert shop order", intent.id, error);
    return false;
  }
  return true;
}

// Fulfillment step of the embedded-checkout lifecycle: Stripe calls this once
// payment succeeds, and we turn that into a confirmed Uplisting booking.
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
      const saved = await recordShopOrder(intent);
      if (!saved) {
        // 500 so Stripe redelivers; the unique PaymentIntent id makes the retry safe.
        return NextResponse.json({ error: "Failed to record shop order" }, { status: 500 });
      }
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

    // Idempotency guard: Stripe can redeliver this event (retries, duplicate
    // webhook endpoints, etc). Re-fetch the session rather than trusting the
    // event payload, since metadata written by a previous delivery of this
    // same event is only visible on the current object, not on the payload
    // Stripe already sent. uplistingBookingId is written back onto the
    // session immediately after a successful booking, below.
    const currentSession = await stripe.checkout.sessions.retrieve(session.id);
    if (currentSession.metadata?.uplistingBookingId) {
      console.log(
        `Checkout Session ${session.id} already has Uplisting booking ${currentSession.metadata.uplistingBookingId}, skipping`
      );
      return NextResponse.json({ received: true });
    }

    let bookingId: string;
    try {
      ({ bookingId } = await createUplistingBooking({
        propertyId: Number(meta.uplistingPropertyId),
        checkIn: meta.checkIn,
        checkOut: meta.checkOut,
        numberOfGuests: Number(meta.guests) || 1,
        guestName: meta.guestName,
        guestEmail: meta.guestEmail || session.customer_details?.email || undefined,
        guestPhone: meta.guestPhone || undefined,
      }));
      console.log(`Created Uplisting booking ${bookingId} for Checkout Session ${session.id}`);
    } catch (error) {
      console.error("Failed to create Uplisting booking after payment", session.id, error);
      // Return 500 so Stripe retries — a paid session must not silently fail to book.
      return NextResponse.json({ error: "Booking creation failed" }, { status: 500 });
    }

    // The booking now exists, so nothing below may return 500: a retry would
    // find no uplistingBookingId on the session and book a second time.
    // Retry the stamp a few times, then give up loudly and still return 200.
    let stamped = false;
    for (let attempt = 1; attempt <= 3 && !stamped; attempt++) {
      try {
        await stripe.checkout.sessions.update(session.id, {
          metadata: { ...meta, uplistingBookingId: bookingId },
        });
        stamped = true;
      } catch (error) {
        console.error(
          `Failed to stamp Uplisting booking ${bookingId} onto Checkout Session ${session.id} (attempt ${attempt})`,
          error
        );
      }
    }
    if (!stamped) {
      console.error(
        "Uplisting booking created but not recorded on the Stripe session: a redelivery could double-book and the return page will keep showing 'finalizing'. Set uplistingBookingId on the session manually.",
        { sessionId: session.id, bookingId }
      );
    }
  }

  return NextResponse.json({ received: true });
}
