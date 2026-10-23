# SOS Stays — Codebase Guide

SOS Stays is a short-term rental / serviced-accommodation company. The platform is made of **five separate applications** in separate git repos (there is no single monorepo build). This guide explains what each piece is, how they connect, how to get the code running, and how to add features.

> Last verified against website `main` @ `0576e74` (2026-10-23). Branches move quickly — when something here disagrees with the code, trust the code and fix this file.
>
> This guide contains no credentials. Secrets (`.env` files, API keys) are handed over privately by the maintainer — never commit them.

## Contents

1. [Quick start](#1-quick-start)
2. [The big picture](#2-the-big-picture)
3. [Repos, branches and where to merge](#3-repos-branches-and-where-to-merge)
4. [Marketing website](#4-marketing-website-sosstayssosstays)
5. [Admin dashboard](#5-admin-dashboard-sosstayssosstays_admin)
6. [Concierge site](#6-concierge-site-sosstaysconcierge)
7. [Database and Edge Functions](#7-database-and-edge-functions-sosstayssosstays_database)
8. [How to add a feature](#8-how-to-add-a-feature)
9. [Known gaps](#9-known-gaps)

---

## 1. Quick start

**Accounts you need access to** (ask the maintainer): the `sosstays` GitHub organisation, Netlify, Sanity (two projects), Supabase, Uplisting, Stripe, MailerLite, WhatChimp (WhatsApp), Twilio (SMS), Google Cloud (Maps) and Google Tag Manager.

**Tools:** Git, a current Node.js LTS, and the Supabase CLI if you touch the database.

```bash
mkdir SOS-Website && cd SOS-Website
git clone https://github.com/sosstays/sosstays.git web      # lands on `dev`, the default branch
git clone <studio-repo-url> studio                          # website Sanity Studio; URL from the maintainer
cd web && npm install && cd ../studio && npm install && cd ..

git clone https://github.com/sosstays/sosstays_admin.git "SOS - Admin Dashboard"
git clone https://github.com/sosstays/sosstays_database.git SOS-Database
git clone https://github.com/sosstays/concierge.git SOS-Concierge
```

1. Get the `.env.local` files from the maintainer and place them in each app (the variable *names* are listed per app below).
2. Run the website with `npm run dev` in `web` (http://localhost:3000) and the Studio with `npm run dev` in `studio` (http://localhost:3333). Run both when working on anything CMS-driven.
3. Read `web/AGENTS.md`, `web/CLAUDE.md` and `web/HANDOFF.md`. The pinned Next.js version has breaking changes from what you (or an AI assistant) may expect — check `node_modules/next/dist/docs/` before writing Next.js code. `HANDOFF.md` lists known follow-ups that shipped knowingly.
4. Create a branch (see [section 3](#3-repos-branches-and-where-to-merge)), make your change, run `npm run lint && npm run build`, and open a PR.

There is **no automated test suite**. Verify changes by running the app and clicking through the flow, including mobile widths, empty states and validation errors.

**Windows troubleshooting:** if `git fetch` fails with `SSL certificate problem: unable to get local issuer certificate`, run `git config --global http.sslBackend schannel`.

---

## 2. The big picture

```
Guest books a room on the marketing site (Next.js + Stripe + Uplisting)
        │
        ▼
Uplisting (external PMS) fires a webhook ──▶ Supabase Edge Function `uplisting-webhook`
        │                                          │
        │                                          ▼
        │                                   Supabase Postgres (properties/guests/bookings)
        │                                          │
        │                              pg_cron (daily) ──▶ `send-checkin-reminders` ──▶ WhatsApp (WhatChimp)
        │                                          │
        ▼                                          ▼
Guest clicks the WhatsApp check-in link ──▶ Concierge static site ──▶ `link-booking` + `concierge-signup`
        (per-property, content from a separate Sanity CMS)                Edge Functions

Website forms (landlord form, revenue calculator, contact, partner, corporate, newsletter)
──▶ Next.js /api routes ──▶ Supabase first (source of truth), then MailerLite.

Website shop (vouchers and goods) ──▶ Stripe PaymentIntent ──▶ webhook ──▶ `shop_orders` table.

Internally: the Admin Dashboard reads/writes the same Supabase tables (bookings, guests,
properties, the lead and contact tables, concierge sign-ups, activities) and shows them as
lists, a lead pipeline board and a per-contact activity timeline.
```

- **Two separate Sanity CMS projects** — don't confuse them: the *website Studio* (blog, landing pages, area guides, landlord pages, pricing, shop, per-market homepage content) and the *Concierge Studio* (per-property venues, FAQs, wifi/check-in info).
- **One shared Supabase project** backs the website's guest accounts and shop orders, the admin dashboard and the concierge check-in flow.
- **Uplisting** is the property-management system of record for listings, availability, pricing and reservations. Everything else is downstream of it.
- **Two markets (Ireland and India).** The website is one codebase built twice, once per market. See [Markets](#markets-ireland-and-india).

---

## 3. Repos, branches and where to merge

| Project | GitHub repo | Main branch(es) |
|---|---|---|
| Marketing website | `sosstays/sosstays` | `main` (production) + `dev` (staging) |
| Website CMS (Sanity Studio) | separate repo — ask the maintainer | `main` |
| Admin dashboard | `sosstays/sosstays_admin` | `main` |
| Database / Edge Functions | `sosstays/sosstays_database` | `main` |
| Concierge site + its Studio | `sosstays/concierge` | `main` |

### Website workflow (`sosstays/sosstays`)

The documented flow:

- **`main` = production.** Netlify auto-deploys it to the live site.
- **`dev` = staging.** Netlify builds a deploy preview from it so changes can be checked before going live.
- Branch off the latest `dev`:
  ```bash
  git checkout dev && git pull origin dev
  git checkout -b feature/<short-description>
  ```
- Branch prefixes: `feature/`, `fix/`, `fixes/`, `chore/`, `docs/`. One branch per page or discrete change.
- **Flow: `feature/*` → PR into `dev` → verify on the dev preview → merge `dev` into `main` to ship.**
- Before opening a PR run `npm run lint && npm run build` (Netlify fails the preview otherwise).
- Commit messages: short, imperative, describing the visible change.

**Current state differs from that flow.** Recent work (webhook idempotency, shop orders, the India SEO work, the promo grid) was merged straight into `main`, so `origin/dev` is about 25 commits *behind* `main`. If you branch from `dev` today you will not have those changes. Before starting, either branch from `main`, or first bring `dev` up to date: `git checkout dev && git pull origin dev && git merge origin/main`. Agree with the team which flow you are following.

Other things worth knowing:
- The repo has two remotes, `origin` and `sosstays`, pointing at the same place. Push to `origin`. `git status` may report `main` "ahead" because of the stale `sosstays` ref — run `git fetch origin` and trust `origin/*`.
- See what is in flight: `git fetch origin && git branch -r --no-merged origin/main`. Some old branches (for example `feature/account-ui`, `fixes/quick-wins`, `feature/uplisting-calendar-cache`) hold unmerged work — check before duplicating it.

**Running branches in parallel** (for example several AI-assistant sessions) — use worktrees:
```bash
git worktree add ../SOS-Website-<name> -b feature/<name> origin/dev
```
Each worktree needs its own `npm install` and `.env.local`. On Windows, `git worktree remove` can fail with "Filename too long" on `node_modules`; delete the folder with `rm -rf` from Git Bash, then run `git worktree prune`.

### Admin dashboard and Concierge

Both use a single `main` branch with short-lived `feature/*` branches. Branch off `main` and open a PR back into `main`. The admin dashboard has no deploy target yet, so merging changes nothing live. For Concierge, check in Netlify which branch each property site deploys from.

### Database repo — different rules

**Supabase itself is the source of truth, not this repo.** Changes are made on the live project (through the Supabase dashboard / MCP) and then recorded here. Read `DEPLOYED.md` and `DEPLOY_LOG.md` at the repo root first. In short:

- **Do not run `supabase db push` or `supabase db reset` from this folder.** Local migration numbers (`0001`…) do not match the remote version timestamps, and the local files are not a complete mirror.
- Before changing a live function or the schema, snapshot the current live code or schema into the repo and commit it, change one thing at a time, then add an entry to `DEPLOY_LOG.md` (what changed, files, applied-at time, how it was verified, how to undo).
- Reversible changes ship with a down script in `supabase/migrations-down/`. Unapplied migrations wait in `supabase/migrations-pending/`.
- `supabase/snapshots/` holds read-only snapshots of the live schema. The git tag `baseline-2026-10-10` marks the deployed baseline; to roll a function back, check out the tag and redeploy that one function.

---

## 4. Marketing website (`sosstays/sosstays`)

### Tech stack
- Next.js `^16` (App Router), React `^19`, TypeScript `^6`.
- Tailwind CSS v4 — configured in CSS via `@theme inline` in `src/app/globals.css` (no `tailwind.config.js`). Brand tokens (`--forest-green`, `--cream`, `--maroon`, …) live there. Fonts: Playfair Display (headings) and Inter (body).
- Sanity (`next-sanity`) for content, Supabase (`@supabase/ssr`) for guest accounts, leads and shop orders, Stripe for payments, Twilio for SMS, `@googlemaps/js-api-loader` for maps and address autocomplete.
- Deployed on Netlify (`@netlify/plugin-nextjs`).

### Markets (Ireland and India)
One codebase serves two sites. The active market is chosen **at build time** by the `SITE_MARKET` env var (`ie` or `in`; unset means `ie`; an invalid value fails the build). Each market is its own Netlify site, so `netlify.toml` is shared and contains no per-market logic.

- **Content:** `src/sanity/client.ts` injects `$market` into every GROQ fetch, so queries filter on `market == $market`. Singleton documents use ids of the form `<type>-<market>` (for example `promoGrid-in`, `partnersPage-ie`). Landing pages with no market set count as Ireland.
- **Navigation and footer:** `src/lib/marketLinks.ts` drops links whose target has no content in the current market.
- **Country switcher:** a shared `countrySwitcher` Sanity document lists the markets and their URLs; the switcher in the nav does a full navigation to the other site.
- **SEO:** canonical URLs, `og:url`, sitemap and robots point at the market's own domain (`SITE_URL`); `lang` and `og:locale` follow the market. Ireland is indexable by default; India is `noindex` unless an editor explicitly allows it. `SITE_NOINDEX=true` forces `noindex` and an empty sitemap for the whole site. Default SEO copy is market-specific so India never inherits Irish text (`DEFAULT_SEO`).
- **When adding content or a page, make it market-aware:** filter queries on `$market`, and create the singleton for each market in the Studio.

### Routes (`src/app`)
- `/` — homepage: hero, promo grid, featured stays, blog grid, area spotlight, landlord CTA. `/[slug]` — catch-all for Sanity `landingPage` documents.
- `/stays/[slug]` — property page (gallery, room types, add-ons, live Uplisting pricing). `/stays/[slug]/book*` — Stripe checkout; `/stays/[slug]/book/return` — post-payment page.
- `/shop`, `/shop/checkout` — vouchers and goods, paid by Stripe PaymentIntent (`/api/shop/create-payment-intent`, `/api/shop/finalize-payment-intent`).
- `/areas/[slug]`, `/blog/[slug]`, `/about`, `/partners/[slug]`, `/corporate-stays` — Sanity-driven content pages.
- `/landlords`, `/landlords/[slug]` — landlord funnel and revenue calculator. `/pricing`, `/pricing/[slug]` — per-county pricing pages.
- `/contact` (phone number is required, validated on client and server), `/search` — live availability search against Uplisting.
- `/api/{mailerlite-subscribe,calculator-lead,contact-subscribe,partner-lead,corporate-lead,newsletter-subscribe}` — every public form posts here. Each calls `saveLead()` (`src/lib/leads.ts`): save to Supabase first, then push to MailerLite and record the subscriber id. If either side fails the lead is not lost.
- `/account`, `/account/login`, `/auth/callback` — Supabase magic-link guest login and bookings dashboard.
- `/oauth/uplisting/callback` — admin utility for completing Uplisting's OAuth handshake; not linked from the site.
- `sitemap.ts`, `robots.ts`, `llms.txt` — all market-aware.

### CMS (Sanity)
- `src/sanity/client.ts` — client (`useCdn: false` on purpose, to avoid stale server-rendered content). `queries.ts` — all GROQ queries. Also `image.ts`, `portableText.tsx`, `metadata.ts`, `jsonld.tsx`, and generated `sanity.types.ts`.
- Content types live in the separate website Studio: `blogPost`, `propertyPage`, `areaGuide`, `landlordPage`, `landingPage`, `aboutPage`, `partner`, `partnersPage`, `countyPricingStats`, `corporateStaysPage`, `shopPage`, `shopProduct`, `addOn` (checkout add-ons), plus singletons (`siteSettings`, `footer`, `navigation`, `heroSection`, `hostsModule`, `promoGrid`, `countrySwitcher`, `privacyPolicyPage`, `termsPage`). Singletons exist once per market in the Studio sidebar (Ireland / India).
- **Adding a field:** edit the schema in `studio/schemaTypes/documents/`, update the GROQ query in `src/sanity/queries.ts`, run `npm run typegen` in the Studio, then use the field in the page.
- **Adding a page type:** new schema → new GROQ query → new route under `src/app/`.
- Never invent content or stats for a document with no real data; use an honest "expanding to this area soon" state.

### Uplisting integration — two auth surfaces
1. **Legacy Basic-auth key** (`src/lib/uplisting/client.ts`, `UPLISTING_API_KEY`) for `/availability`, `/properties`, `/calendar/:id`.
2. **OAuth2 (Authorization Code + PKCE)** (`src/lib/uplistingApi.ts`; a near-duplicate lives in `src/lib/uplisting.ts`) — the only method Uplisting accepts for `GET /quotes` (authoritative live pricing) and `POST /bookings`. Needs `UPLISTING_OAUTH_CLIENT_ID`, `_CLIENT_SECRET`, `_REFRESH_TOKEN`. The refresh token must be created once by an admin through `/oauth/uplisting/callback`.
3. `UPLISTING_MOCK_QUOTES=true` returns a fake quote so checkout can be exercised without live credentials. Development only.

Read the inline comments in these files — they record real API quirks found by testing. The Uplisting Postman collection documents the full API.

### Payments
**Stays (Stripe embedded Checkout)**
1. `src/components/checkout/BookingCheckout.tsx` collects guest details and add-ons.
2. `POST /api/checkout/session` re-validates server-side, fetches a **fresh Uplisting quote** (never trusts client-sent amounts), checks add-ons against Sanity's stored prices, and creates a branded Checkout Session.
3. The client mounts Stripe's embedded checkout with the returned `clientSecret`.
4. `POST /api/stripe/webhook` verifies the Stripe signature. On `checkout.session.completed` it creates the Uplisting reservation and records the booking id on the Stripe session, so a redelivered event does not book twice.
5. The return page waits briefly for that booking id before confirming, then fires a GA4 `purchase` event through Google Tag Manager (`src/lib/analytics.ts`).

**Shop (Stripe PaymentIntent)**: `payment_intent.succeeded` in the same webhook stores the order in the Supabase `shop_orders` table (unique on the PaymentIntent id) and sends the receipt.

Always re-derive prices on the server. Related routes: `/api/checkout/quote`, `/api/checkout/session-status`. See `HANDOFF.md` for the known follow-ups on tracking and the webhook.

### Guest auth
Passwordless Supabase magic link: `/account/login` → `signInWithOtp()` → email link → `/auth/callback` exchanges the code for a session → `/account` reads the guest's own rows through row-level security.

### Environment variables (names only)
- Market: `SITE_MARKET`, `SITE_NOINDEX`.
- Sanity: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`.
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Uplisting: `UPLISTING_API_KEY`, `UPLISTING_API_BASE_URL`, `UPLISTING_AUTH_BASE_URL`, `UPLISTING_OAUTH_CLIENT_ID`, `UPLISTING_OAUTH_CLIENT_SECRET`, `UPLISTING_OAUTH_REFRESH_TOKEN`, `UPLISTING_MOCK_QUOTES`.
- MailerLite: `MAILERLITE_API_KEY` plus per-form `MAILERLITE_*_GROUP_ID` (landlord, newsletter, calculator, contact, pricing).
- Twilio (SMS): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`.
- Other: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_DISQUS_SHORTNAME`.

There is no committed `.env` example file. Forms that sync to MailerLite should degrade gracefully when a `MAILERLITE_*` variable is missing rather than crashing.

### Deploy
Netlify: build `npm run build`, publish `.next`. `netlify.toml` excludes `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` from Netlify's secret scanner because it is a public, referrer-restricted client key. Set `SITE_MARKET` (and `SITE_NOINDEX` where needed) per Netlify site.

### UI conventions
- Required form fields get a red asterisk.
- Validation errors use `--error-red`, never the brand maroon.

---

## 5. Admin dashboard (`sosstays/sosstays_admin`)

Internal tool to view and edit the shared Supabase tables in one place. It makes no Uplisting or MailerLite calls of its own; it reads and writes the tables other systems populate.

- **Stack:** Next.js 16 (App Router), React 19, shadcn/ui (Base UI primitives), Tailwind v4, `@supabase/supabase-js` (server-only client), `iron-session` for the login session. No table library (the column selector is hand-rolled), no global state library, no API routes — everything is Server Actions.
- **Config-driven CRUD:** `src/lib/tables/config.ts` defines every table — fields, types, editability, list columns, relations and form groupings. `queries.ts` and `actions.ts` are generic and work purely from that config. Lists support search, sorting, a per-table column selector and record deletion.
- **Pages (`src/app/(dashboard)`):** home, `properties`, `guests`, `bookings`, `leads` (landlord), `partner-leads`, `corporate-leads`, `contact-queries`, `newsletter`, `concierge` (guests who signed in on a concierge page, with or without a booking) and `contacts` (one row per email across all tables, with a detail page; `src/lib/contacts.ts`).
- **Lead pipeline and activity log:** a pipeline board for landlord, partner and corporate leads; a merged activity timeline on each contact page; notes and calls; stage changes; and a "needs attention" card. Code is in `src/lib/activities*.ts`, `src/lib/timeline.ts` and the `activity-timeline`, `add-activity-form`, `lead-board`, `pipeline-view` and `needs-attention` components.
- **Add a table or page:** add it to `src/lib/tables/config.ts` and add a route folder under `src/app/(dashboard)/`. No new CRUD code is needed.
- **Auth:** a password-gated session (`src/app/login/actions.ts`, `src/middleware.ts`). Ask the maintainer for access.
- **Env vars (names):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_PASSWORD`, `SESSION_SECRET`. The service-role key is server-only and must never reach the browser.
- **Deploy:** not decided yet. See `admin-dashboard-plan.md` and `DESIGN_HANDOFF.md` in that repo.

---

## 6. Concierge site (`sosstays/concierge`)

A static, no-build-step site (`index.html`, `script.js`, `style.css`) that guests open from a WhatsApp check-in link (`?bookingid=...`). One Netlify deployment per physical property.

**Flow**
1. The guest fills in a name/email form (Netlify Forms with a honeypot; the marketing opt-in box is ticked by default). The booking id comes from the URL.
2. In parallel: submit to Netlify Forms; if marketing opt-in is ticked, call `/.netlify/functions/subscribe` (MailerLite, key kept server-side; the property name is sent along); call the Supabase Edge Functions `link-booking` (attaches the email to the booking and returns room number, lock code and dates) and `concierge-signup` (records every gate sign-in, with or without a booking, in Supabase).
3. Property content (wifi, venues, FAQs, logo) is fetched at page load from Sanity's public GROQ API, keyed by `SANITY_PROPERTY_ID`, which `/.netlify/functions/config` supplies from an env var. The same bundle therefore serves every property.

**`studio/`** (in this repo) is a separate Sanity Studio. One `property` document per physical property references shared `foodVenue`, `attractionVenue` and `travelVenue` documents, so one restaurant can be recommended by several properties.

**Add a new property:** create a `property` document in this Studio and set `SANITY_PROPERTY_ID` on a new Netlify site. No code change.

**Netlify Functions** (`netlify/functions/`): `config.js` (returns the property id) and `subscribe.js` (MailerLite signup; needs `MAILERLITE_API_KEY`, optional `MAILERLITE_GROUP_ID`, set in Netlify's site settings).

---

## 7. Database and Edge Functions (`sosstays/sosstays_database`)

Supabase Postgres schema (`supabase/migrations/`) and Deno Edge Functions (`supabase/functions/`). **Read the database workflow in [section 3](#database-repo--different-rules) before changing anything** — Supabase is the source of truth and this repo records it.

### Schema
- `properties` — one row per Uplisting *listing* (a room, not necessarily a building). `checkin_subdomain` groups several listings under one Concierge subdomain; `nickname`, `access_instructions` and `public_name` (guest-facing name) feed guest messages.
- `guests` — created or linked through the Concierge check-in form (verified email). `auth_user_id` links to Supabase Auth for website login.
- `bookings` — `uplisting_reservation_id`, links to property and guest, `checkin_token` (the public `bookingid` used in check-in URLs; internal ids are never exposed), room number and lock code, and `confirmation_sent_at` / `reminder_sent_at` / `post_stay_sent_at` to prevent duplicate WhatsApp sends.
- `guest_profiles` — view of lifetime stays and revenue per guest.
- `landlord_leads`, `partner_leads`, `corporate_leads`, `contact_queries`, `newsletter_subscribers` — website form submissions, each with a `status`, MailerLite ids and an `updated_at` trigger. An empty `mailerlite_synced_at` means saved in Supabase but the MailerLite push failed.
- `concierge_signups` — every sign-in on a Concierge page, with marketing consent.
- `activities` — notes, calls and stage changes shown in the admin timeline.
- `shop_orders` — website shop purchases, unique on the Stripe PaymentIntent id.
- `contacts` — a view unioning every table that holds a person, by lower-cased email, with a `roles` array.
- Row-level security: an authenticated guest can read only their own `guests`, `bookings` and related `properties` rows.

### Edge Functions
- `uplisting-webhook` — receives Uplisting webhooks (signature-verified), upserts `properties` and `bookings`, and sends a WhatsApp confirmation for direct bookings. It carries its own inlined copy of the WhatChimp sender (without the retry logic in `_shared/whatchimp.ts`).
- `send-checkin-reminders` — run daily by a `pg_cron` job; sends tomorrow's check-in reminder with the Concierge link.
- `link-booking` and `concierge-signup` — called by the Concierge guest form.
- `send-post-stay-messages` — post-stay WhatsApp message. Deployed but **not scheduled yet**; see `DEPLOY_LOG.md` for what must be done first.
- `_shared/whatchimp.ts` — WhatsApp Business API wrapper. Template ids change when templates are re-approved; keep them in sync with WhatChimp. Reminders skip silently if `access_instructions` or `checkin_subdomain` is unset on a property.

`checkin_instructions_template.json` is the WhatsApp template spec. It may be out of date versus the live template (it has 4 variables; the code sends 3).

---

## 8. How to add a feature

| I want to… | Go to |
|---|---|
| Add a marketing or landing page | Website: new Sanity schema + GROQ query (filtered on `$market`) + route. For a one-off page, reuse the `landingPage` catch-all (`/[slug]`). |
| Launch or change content for one market | Website Studio: the Ireland / India singleton for that type; see [Markets](#markets-ireland-and-india) |
| Add or change a shop product | Website Studio: `shopProduct` / `shopPage` |
| Show a new table in the admin | Dashboard: `src/lib/tables/config.ts` |
| Add a concierge property | Concierge Studio: new `property` document + a Netlify site with `SANITY_PROPERTY_ID` |
| Change what happens on booking creation/cancellation | Database: `supabase/functions/uplisting-webhook` (follow the database workflow) |
| Change the check-in reminder text or timing | Database: `send-checkin-reminders` and its `pg_cron` schedule |
| Touch checkout or payments | Website: `src/app/api/checkout/session/route.ts` and `src/app/api/stripe/webhook/route.ts` |
| Call Uplisting | Check whether the call needs the legacy key or OAuth; only `/quotes` and `POST /bookings` are OAuth-only |
| Add a form that captures leads | Website: new `/api/*` route that calls `saveLead()`; add the table to the database and dashboard config |

Every change: branch, run `npm run lint && npm run build`, test in the browser, open a PR.

---

## 9. Known gaps

- `src/lib/uplisting.ts` and `src/lib/uplistingApi.ts` are near-duplicate OAuth clients and should be consolidated.
- No automated tests anywhere (website, dashboard or concierge).
- The admin dashboard has no deploy target yet.
- Follow-ups on analytics tracking and the Stripe webhook are tracked in `web/HANDOFF.md`.
- Database: the `shop_orders` migration and the post-stay function are newer than the last committed baseline, and migration numbering is shared between applied files (`migrations/`) and drafts (`migrations-pending/`). Check `DEPLOY_LOG.md` for what is actually applied before assuming a number is free.
- `checkin_instructions_template.json` may be stale relative to the live WhatsApp template.
- Check `git branch -r --no-merged origin/main` for unmerged work before starting something that might already exist.
