# Handoff notes

Known issues and follow-ups that shipped knowingly. None are blocking.

## GA4 purchase tracking (`BookingConfirmedTracker`)

Fires a GA4 `purchase` event from `/stays/[slug]/book/return` via the GTM
`dataLayer` (`src/lib/analytics.ts`). Reviewed 2026-10-23; shipped as-is.

1. **Paid check.** The return page gates on `session.status === "complete"`,
   not `payment_status === "paid"`. Harmless while checkout is cards only; if
   delayed methods (SEPA debit, bank transfer) are ever enabled, a session can
   complete while unpaid and revenue would be over-reported. Tighten to
   `payment_status === "paid"` before enabling them.
2. **Booking order.** The event is meant to render only after the Uplisting
   booking exists. This relies on the webhook idempotency work
   (`uplistingBookingId` stamped onto the session; the return page waits for it
   and returns early otherwise). Keep that early return ahead of the tracker.
3. **GTM mapping not verified.** `trackEvent("purchase", { transaction_id,
   value, currency, items })` pushes flat keys. A GA4 tag using GTM's built-in
   ecommerce data layer expects them inside an `ecommerce` object. Check in Tag
   Assistant (container `GTM-TLKN98WH`) that purchases actually arrive in GA4,
   and wrap the push in `ecommerce` if they don't.
4. **Dedupe is per browser tab** (`sessionStorage`). The same confirmation link
   opened in another browser re-fires the event. A proper fix is a server-side
   hit from the Stripe webhook keyed on the session id.
5. **Unstable `item_id`.** `item_id` is `${propertySlug}-${index}`, so add-on ids
   depend on line-item order. Use a stable product id if per-product reporting
   matters.

## Stripe webhook (`src/app/api/stripe/webhook/route.ts`)

- **Booking path partial failure (fixed).** Stamping `uplistingBookingId` onto
  the session is now outside the booking `try`, retried 3 times, and never
  returns 500 once the Uplisting booking exists. If all 3 attempts fail it logs
  "Uplisting booking created but not recorded on the Stripe session" with the
  session and booking ids; set `uplistingBookingId` on the session by hand (the
  return page shows "finalizing" until it's there).
- **Concurrent deliveries can still race.** The idempotency guard is
  check-then-act with no lock. A unique-keyed Supabase row would close it.
- **Shop orders** (`payment_intent.succeeded`): the order is stored in
  `shop_orders` (unique on `stripe_payment_intent_id`). A paid intent with no
  buyer email (confirmed without `/api/shop/finalize-payment-intent`) is logged
  loudly and not stored, and must be fulfilled by hand from the Stripe
  dashboard. Search logs for "Shop order paid but has no buyer email".
- **No migration in the repo for `shop_orders`.** The table exists in the
  "SOS Stays Database" Supabase project but its SQL isn't checked in. Add one.
