import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { fetchShopProduct, validateQuantity } from "@/lib/shopOrder";

// Step 1 of the shop checkout: mount the PaymentElement as soon as the
// buyer opens an item, on the same screen as their name/email — not a
// separate step after a details form. This only needs a product + a
// starting quantity to get a clientSecret; buyer/recipient/delivery
// details are collected on that same screen and only validated (and
// attached to the PaymentIntent) at submit time by
// /api/shop/finalize-payment-intent, right before confirmPayment.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const productId = (body as Record<string, unknown>)?.productId;
  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const product = await fetchShopProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "This item isn't available" }, { status: 404 });
  }

  const qty = validateQuantity((body as Record<string, unknown>)?.quantity ?? 1, product);
  if (qty === null) {
    return NextResponse.json(
      { error: `Quantity must be between 1 and ${product.maxQuantity}` },
      { status: 400 }
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(product.price * 100) * qty,
      currency: "eur",
      description: `${product.name} × ${qty}`,
      metadata: { orderType: "shop", productId, productName: product.name, productKind: product.kind },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error("Shop Stripe payment intent error:", error);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 502 });
  }
}
