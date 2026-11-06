# Handoff notes

Known issues and follow-ups that shipped knowingly. None are blocking.

## GA4 purchase tracking (`BookingConfirmedTracker`)

Fires a GA4 `purchase` event from `/stays/[slug]/book/return` via the GTM
`dataLayer` (`src/lib/analytics.ts`). Reviewed 2026-10-23; shipped as-is.

1. **Paid check (fixed).** The tracker now only renders when
   `payment_status === "paid"`, so delayed methods can't over-report revenue.
2. **Booking order.** The event is meant to render only after the Uplisting
   booking exists. This relies on the webhook idempotency work
   (`uplistingBookingId` stamped onto the session; the return page waits for it
   and returns early otherwise). Keep that early return ahead of the tracker.
3. **GTM mapping (payload fixed, tag still to verify).** `purchase`,
   `view_item` and `begin_checkout` now push inside an `ecommerce` object
   (after clearing the previous one) via `trackEcommerce`. Still check in Tag
   Assistant that the GA4 event tags read the ecommerce data layer — see
   "GA4 / GTM setup" below.
4. **Dedupe is per browser tab** (`sessionStorage`). The same confirmation link
   opened in another browser re-fires the event. A proper fix is a server-side
   hit from the Stripe webhook keyed on the session id.
5. **`item_id` (fixed).** The accommodation line uses the property slug and
   add-ons use `addon-<name>`. (Don't use Stripe's `price.product`: inline
   `price_data` makes a new ad-hoc product per session.)

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

## GA4 / GTM setup (acquisition source + purchase funnel)

Code side is done; these are the console steps that make it show up in GA4.

- **Events pushed to the dataLayer:** `attribution_captured` (once per session,
  with `first_touch_source/medium/campaign/landing_page`), `generate_lead`
  (`form_name` = landlord_sos, revenue_estimate, contact, corporate_stays,
  partner, newsletter), `view_item`, `begin_checkout`, `purchase`. Every page
  also pushes `site_market` and `site_hostname` before GTM loads.
- **Create in GTM:** a Data Layer Variable for `ecommerce`; GA4 Event tags for
  view_item / begin_checkout / purchase (send ecommerce data from the data
  layer) and generate_lead (param `form_name`); Data Layer Variables for the
  `first_touch_*` params. Register `form_name` and `first_touch_source` /
  `first_touch_medium` as GA4 custom dimensions (event-scoped).
- **Funnel:** GA4 > Explore > Funnel exploration: view_item > begin_checkout >
  purchase, broken down by Session default channel group / source / medium.
- **Source also lives on the record:** leads get `attribution` (jsonb) in
  Supabase, and Stripe checkout sessions/payment intents get `attr_*` metadata,
  so a paid booking shows its channel in the Stripe dashboard. Run
  `supabase/migrations/20261106000000_add_attribution.sql` (until then leads
  still save, just without the column).
- **Separate stream for .in:** either set `NEXT_PUBLIC_GTM_ID` on the .in
  deployment to a second container, or in the shared container make the GA4
  config tag fire with a different Measurement ID when `site_hostname` is
  sosstays.in (or add a hostname filter in GA4). Checkout is embedded Stripe on
  our own domain, so no referral-exclusion is needed unless that changes.
- Known gap: purchase dedupe is still per browser tab (item 4 above); a
  server-side Measurement Protocol hit from the webhook would close it.
