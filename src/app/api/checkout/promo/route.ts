import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { checkPromotionCode, promoDiscount } from "@/lib/promo";

// Looks up a guest-entered code against Stripe's own Promotion Codes, so
// BookingSummaryCard can show the discount before a Checkout Session exists.
// Supports fixed-amount and percent-off coupons. The `subtotal` the client
// sends (accommodation + add-ons) is only used to preview the discount and to
// enforce a code's minimum spend — the discount actually charged is always
// computed by Stripe at session creation, and api/checkout/session re-verifies
// the code against its own server-derived total rather than trusting this.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const b = (body ?? {}) as Record<string, unknown>;
  const code = typeof b.code === "string" ? b.code.trim() : "";
  const currency = typeof b.currency === "string" ? b.currency.toLowerCase() : "";
  const subtotal = typeof b.subtotal === "number" && Number.isFinite(b.subtotal) ? b.subtotal : NaN;
  if (!code || !currency || !(subtotal > 0)) {
    return NextResponse.json({ error: "code, currency and subtotal are required" }, { status: 400 });
  }

  let promotionCode;
  try {
    // `promotion.coupon` comes back as just an id unless expanded.
    const list = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
      expand: ["data.promotion.coupon"],
    });
    promotionCode = list.data[0];
  } catch (error) {
    console.error("Stripe promotion code lookup failed", error);
    return NextResponse.json({ error: "Could not check that code" }, { status: 502 });
  }

  const coupon = promotionCode?.promotion.coupon as Stripe.Coupon | undefined;
  if (!promotionCode) {
    return NextResponse.json({ valid: false, error: "That promo code isn't valid." });
  }

  const check = checkPromotionCode(promotionCode, coupon, currency, subtotal);
  if (!check.ok) {
    return NextResponse.json({ valid: false, error: check.reason });
  }

  return NextResponse.json({
    valid: true,
    promotionCodeId: promotionCode.id,
    percentOff: check.terms.percentOff,
    amountOff: check.terms.amountOff,
    discountAmount: promoDiscount(check.terms, subtotal),
    currency,
  });
}
