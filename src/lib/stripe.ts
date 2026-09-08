import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
export const isStripeConfigured = Boolean(secretKey);

// The Stripe constructor throws immediately on an empty key, which would
// crash every route that imports this module before it gets a chance to
// check isStripeConfigured. Fall back to a placeholder so construction
// always succeeds; callers must check isStripeConfigured before making any
// actual API call.
export const stripe = new Stripe(secretKey || "sk_test_not_configured");
