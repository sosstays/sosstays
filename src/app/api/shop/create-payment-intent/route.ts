import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { stripe, isStripeConfigured } from "@/lib/stripe";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Single-item, single-purchase checkout for /shop — deliberately not a
// cart (see the design brief this page was built from): one shopProduct,
// one quantity, one PaymentIntent, paid inline via StripeCheckoutForm (the
// same PaymentElement flow BookingFlow uses for property stays).
//
// Fulfillment is manual for both product kinds — see shopProduct.ts and
// the "notes to self" further down. There's no code-generated voucher or
// automated delivery system yet; this route's job is just to charge the
// right amount for the right item and hand the webhook everything a human
// needs to fulfil the order by hand.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    productId,
    quantity,
    buyerName,
    buyerEmail,
    buyerPhone,
    recipientName,
    recipientEmail,
    giftNote,
    propertySlug,
    arrivalDate,
  } = body as Record<string, unknown>;

  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  if (typeof buyerName !== "string" || !buyerName.trim()) {
    return NextResponse.json({ error: "Let us know your name" }, { status: 400 });
  }
  if (typeof buyerEmail !== "string" || !EMAIL_PATTERN.test(buyerEmail.trim())) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  // Price, name, kind and the quantity cap all come from Sanity — never
  // trust anything the client sent about what this item costs.
  const product = await client.fetch(
    `*[_type == "shopProduct" && _id == $id && enabled != false][0]{ kind, name, price, unit, maxQuantity }`,
    { id: productId }
  );
  if (!product) {
    return NextResponse.json({ error: "This item isn't available" }, { status: 404 });
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > product.maxQuantity) {
    return NextResponse.json(
      { error: `Quantity must be between 1 and ${product.maxQuantity}` },
      { status: 400 }
    );
  }

  const metadata: Record<string, string> = {
    orderType: "shop",
    productId,
    productName: product.name,
    productKind: product.kind,
    quantity: String(qty),
    buyerName: buyerName.trim(),
    buyerEmail: buyerEmail.trim(),
    buyerPhone: typeof buyerPhone === "string" ? buyerPhone.trim() : "",
  };

  if (product.kind === "goods") {
    if (typeof propertySlug !== "string" || !propertySlug) {
      return NextResponse.json({ error: "Pick which stay this is for" }, { status: 400 });
    }
    if (typeof arrivalDate !== "string" || !DATE_PATTERN.test(arrivalDate)) {
      return NextResponse.json({ error: "Pick a valid arrival date" }, { status: 400 });
    }
    // Fulfillment needs at least until 2pm the day before (see
    // shopProduct.deliveryNote) — reject anything not strictly in the
    // future so an order can't land for a stay that's already started.
    const today = new Date().toISOString().slice(0, 10);
    if (arrivalDate <= today) {
      return NextResponse.json({ error: "Arrival date must be in the future" }, { status: 400 });
    }

    const property = await client.fetch(
      `*[_type == "propertyPage" && slug.current == $slug][0]{ name }`,
      { slug: propertySlug }
    );
    if (!property) {
      return NextResponse.json({ error: "That property couldn't be found" }, { status: 400 });
    }

    metadata.propertySlug = propertySlug;
    metadata.propertyName = property.name;
    metadata.arrivalDate = arrivalDate;
  } else {
    if (typeof recipientName === "string" && recipientName.trim()) {
      metadata.recipientName = recipientName.trim();
    }
    if (typeof recipientEmail === "string" && recipientEmail.trim()) {
      if (!EMAIL_PATTERN.test(recipientEmail.trim())) {
        return NextResponse.json({ error: "Enter a valid recipient email" }, { status: 400 });
      }
      metadata.recipientEmail = recipientEmail.trim();
    }
    if (typeof giftNote === "string" && giftNote.trim()) {
      // Stripe metadata values are capped at 500 characters.
      metadata.giftNote = giftNote.trim().slice(0, 480);
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(product.price * 100) * qty,
      currency: "eur",
      receipt_email: buyerEmail.trim(),
      description: `${product.name} × ${qty}`,
      metadata,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Shop Stripe payment intent error:", error);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 502 });
  }
}
