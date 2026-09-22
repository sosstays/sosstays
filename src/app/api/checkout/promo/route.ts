import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";

// Looks up a guest-entered code against Stripe's own Promotion Codes, so
// BookingSummaryCard can show the discount before a Checkout Session exists.
// Only fixed-amount ("amount_off") coupons are supported for now — a
// percent-off coupon is rejected here rather than guessing at Stripe's
// rounding, since the actual discount is only ever finalized by Stripe at
// session creation (see api/checkout/session, which re-verifies this same
// code rather than trusting the amount this route returns).
export async function POST(request: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof (body as Record<string, unknown> | null)?.code === "string" ? (body as Record<string, string>).code.trim() : "";
  const currencyRaw = typeof (body as Record<string, unknown> | null)?.currency === "string" ? (body as Record<string, string>).currency : "";
  const currency = currencyRaw.toLowerCase();
  if (!code || !currency) {
    return NextResponse.json({ error: "code and currency are required" }, { status: 400 });
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
  if (!promotionCode || !coupon || !coupon.valid) {
    return NextResponse.json({ valid: false, error: "That promo code isn't valid." });
  }

  if (coupon.amount_off == null || coupon.currency !== currency) {
    return NextResponse.json({ valid: false, error: "That promo code can't be applied to this booking." });
  }

  return NextResponse.json({
    valid: true,
    promotionCodeId: promotionCode.id,
    discountAmount: coupon.amount_off / 100,
    currency: coupon.currency,
  });
}
