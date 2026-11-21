import type Stripe from "stripe";

// Shared by the promo lookup route, the checkout-session route (which
// re-verifies the code), and the checkout UI (which re-prices the discount as
// add-ons change). The discount Stripe actually applies is always computed by
// Stripe at session creation — this only previews it and decides whether a
// code is usable for this booking.

/** What a promotion code takes off: a percentage, or a fixed amount in `currency`. Exactly one is set. */
export type PromoTerms = {
  percentOff: number | null;
  /** Major units (e.g. 20 for €20), not cents. */
  amountOff: number | null;
};

/** Discount in major units for a given subtotal (accommodation + add-ons), never more than the subtotal. */
export function promoDiscount(terms: PromoTerms, subtotal: number): number {
  if (!(subtotal > 0)) return 0;
  let discount = 0;
  if (terms.percentOff != null) {
    // Work in cents so the preview rounds the way a payment amount does.
    discount = Math.round(subtotal * 100 * (terms.percentOff / 100)) / 100;
  } else if (terms.amountOff != null) {
    discount = terms.amountOff;
  }
  return Math.min(discount, subtotal);
}

type CouponCheck = { ok: true; terms: PromoTerms } | { ok: false; reason: string };

/**
 * Whether a Stripe promotion code can be applied to this booking, and on what
 * terms. `subtotal` is in major units; `currency` is the booking's (lowercase).
 */
export function checkPromotionCode(
  promotionCode: Stripe.PromotionCode,
  coupon: Stripe.Coupon | null | undefined,
  currency: string,
  subtotal: number,
): CouponCheck {
  if (!promotionCode.active || !coupon || !coupon.valid) {
    return { ok: false, reason: "That promo code isn't valid." };
  }

  // Our checkout line items use inline price_data, so Stripe creates a fresh
  // ad-hoc product for each one — a coupon limited to specific products would
  // match none of them and Stripe would silently discount nothing, leaving the
  // guest charged more than we previewed.
  if (coupon.applies_to?.products?.length) {
    return { ok: false, reason: "That promo code can't be applied to this booking." };
  }

  const minimum = promotionCode.restrictions?.minimum_amount;
  if (minimum != null) {
    const minCurrency = promotionCode.restrictions?.minimum_amount_currency;
    if ((minCurrency && minCurrency !== currency) || subtotal * 100 < minimum) {
      return { ok: false, reason: "This booking doesn't meet that promo code's minimum spend." };
    }
  }

  if (coupon.percent_off != null) {
    return { ok: true, terms: { percentOff: coupon.percent_off, amountOff: null } };
  }

  // Fixed-amount coupons are tied to one currency.
  if (coupon.amount_off != null && coupon.currency === currency) {
    return { ok: true, terms: { percentOff: null, amountOff: coupon.amount_off / 100 } };
  }

  return { ok: false, reason: "That promo code can't be applied to this booking." };
}
