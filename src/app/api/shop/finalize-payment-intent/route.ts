import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { fetchShopProduct, validateQuantity, buildShopOrderMetadata } from "@/lib/shopOrder";

// Step 2 of the shop checkout, called right before stripe.confirmPayment
// once the buyer has filled in every field on the same screen as the
// PaymentElement — see create-payment-intent for the split. Re-validates
// everything (never trusts what the client showed as the total) and sets
// the final amount + receipt email + fulfillment metadata on the
// PaymentIntent created there.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { paymentIntentId, productId, quantity, ...fields } = body as Record<string, unknown>;

  if (typeof paymentIntentId !== "string" || !paymentIntentId) {
    return NextResponse.json({ error: "paymentIntentId is required" }, { status: 400 });
  }
  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const product = await fetchShopProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "This item isn't available" }, { status: 404 });
  }

  const qty = validateQuantity(quantity, product);
  if (qty === null) {
    return NextResponse.json(
      { error: `Quantity must be between 1 and ${product.maxQuantity}` },
      { status: 400 }
    );
  }

  const result = await buildShopOrderMetadata(product, productId, qty, fields as never);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    // Confirm the PaymentIntent this call is finalizing actually belongs
    // to this product — a stale or mismatched id here would otherwise let
    // someone attach one item's fulfillment metadata to a different
    // (possibly cheaper) PaymentIntent.
    const existing = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (existing.metadata?.productId !== productId) {
      return NextResponse.json({ error: "This checkout session has expired — please try again" }, { status: 409 });
    }

    await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(product.price * 100) * qty,
      receipt_email: result.buyerEmail,
      description: `${product.name} × ${qty}`,
      metadata: result.metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Shop Stripe finalize error:", error);
    return NextResponse.json({ error: "Failed to finalize checkout" }, { status: 502 });
  }
}
