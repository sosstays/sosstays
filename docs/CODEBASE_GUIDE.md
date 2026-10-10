# SOS Stays — Codebase Guide

SOS Stays is a short-term rental / serviced-accommodation company. The platform is made of **five separate applications** in separate git repos (there is no single monorepo build). This guide explains what each piece is, how they connect, how to get the code running, and how to add features.

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

**Accounts you need access to** (ask the maintainer): the `sosstays` GitHub organisation, Netlify, Sanity (two projects), Supabase, Uplisting, Stripe, MailerLite, WhatChimp (WhatsApp), and Google Cloud (Maps).

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
3. Read `web/AGENTS.md` and `web/CLAUDE.md`. The pinned Next.js version has breaking changes from what you (or an AI assistant) may expect — check `node_modules/next/dist/docs/` before writing Next.js code.
4. Create a branch off `dev` (see [section 3](#3-repos-branches-and-where-to-merge)), make your change, run `npm run lint && npm run build`, and open a PR into `dev`.

There is **no automated test suite**. Verify changes by running the app and clicking through the flow, including mobile widths, empty states and validation errors.

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
Guest clicks the WhatsApp check-in link ──▶ Concierge static site ──▶ `link-booking` Edge Function
        (per-property, content from a separate Sanity CMS)

Website forms (landlord form, revenue calculator, contact, partner, corporate, newsletter)
──▶ Next.js /api routes ──▶ Supabase first (source of truth), then MailerLite.

Internally: the Admin Dashboard reads/writes the same Supabase tables (properties, guests,
bookings, landlord_leads, partner_leads, corporate_leads, contact_queries,
newsletter_subscribers, plus the read-only `contacts` view).
```

- **Two separate Sanity CMS projects** — don't confuse them: the *website Studio* (blog, landing pages, area guides, landlord pages, pricing) and the *Concierge Studio* (per-property venues, FAQs, wifi/check-in info).
- **One shared Supabase project** backs the website's guest accounts, the admin dashboard and the concierge check-in flow.
- **Uplisting** is the property-management system of record for listings, availability, pricing and reservations. Everything else is downstream of it.

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

- **`main` = production.** Netlify auto-deploys it to the live site.
- **`dev` = staging.** Netlify builds a deploy preview from it so changes can be checked before going live.
- **Always branch off the latest `dev`, never `main`:**
  ```bash
  git checkout dev && git pull origin dev
  git checkout -b feature/<short-description>
  ```
- Branch prefixes: `feature/`, `fix/`, `fixes/`, `chore/`, `docs/`. One branch per page or discrete change.
- **Flow: `feature/*` → PR into `dev` → verify on the dev preview → merge `dev` into `main` to ship.** Never merge a feature branch straight into `main`.
- Before opening a PR run `npm run lint && npm run build` (Netlify fails the preview otherwise).
- Commit messages: short, imperative, describing the visible change.
- The repo has two remotes, `origin` and `sosstays`, pointing at the same place. Push to `origin`. `git status` may report `main` "ahead" because of the stale `sosstays` ref — run `git fetch origin` and trust `origin/*`.
- Keep `dev` in sync: if `main` has commits `dev` lacks, merge `origin/main` into `dev` before branching.
- See what is in flight: `git fetch origin && git branch -r --no-merged origin/dev`.

**Running branches in parallel** (for example several AI-assistant sessions) — use worktrees:
```bash
git worktree add ../SOS-Website-<name> -b feature/<name> origin/dev
```
Each worktree needs its own `npm install` and `.env.local`. On Windows, `git worktree remove` can fail with "Filename too long" on `node_modules`; delete the folder with `rm -rf` from Git Bash, then run `git worktree prune`.

### Other repos

The admin dashboard, database and concierge repos only have `main` and no documented workflow. Recommended: branch off `main`, open a PR back into `main`.

- **Merging does not deploy the database.** Migrations (`supabase/migrations/NNNN_name.sql`) and Edge Functions must be applied to the live Supabase project with the Supabase CLI. Add a new numbered migration; never edit one that has already been applied.
- The admin dashboard has no deploy target yet, so merging to `main` changes nothing live. For Concierge, check in Netlify which branch each property site deploys from.

---

## 4. Marketing website (`sosstays/sosstays`)

### Tech stack
- Next.js `^16` (App Router), React `^19`, TypeScript `^6`.
- Tailwind CSS v4 — configured in CSS via `@theme inline` in `src/app/globals.css` (no `tailwind.config.js`). Brand tokens (`--forest-green`, `--cream`, `--maroon`, …) live there. Fonts: Playfair Display (headings) and Inter (body).
- Sanity (`next-sanity`) for content, Supabase (`@supabase/ssr`) for guest accounts, Stripe embedded Checkout for payments, `@googlemaps/js-api-loader` for maps and address autocomplete.
- Deployed on Netlify (`@netlify/plugin-nextjs`).

### Routes (`src/app`)
- `/` — homepage. `/[slug]` — catch-all for Sanity `landingPage` documents.
- `/stays/[slug]` — property page (gallery, room types, live Uplisting pricing). `/stays/[slug]/book*` — Stripe checkout.
- `/areas/[slug]`, `/blog/[slug]` — Sanity-driven area guides and blog posts.
- `/landlords`, `/landlords/[slug]` — landlord funnel and revenue calculator. `/pricing`, `/pricing/[slug]` — per-county pricing pages.
- `/contact`, `/search` — contact form; live availability search against Uplisting.
- `/corporate-stays` — Sanity-driven workforce accommodation page.
- `/api/{mailerlite-subscribe,calculator-lead,contact-subscribe,partner-lead,corporate-lead,newsletter-subscribe}` — every public form posts here. Each calls `saveLead()` (`src/lib/leads.ts`): save to Supabase first, then push to MailerLite and record the subscriber id. If either side fails the lead is not lost.
- `/account`, `/account/login`, `/auth/callback` — Supabase magic-link guest login and bookings dashboard.
- `/oauth/uplisting/callback` — admin utility for completing Uplisting's OAuth handshake; not linked from the site.

### CMS (Sanity)
- `src/sanity/client.ts` — client (`useCdn: false` on purpose, to avoid stale server-rendered content). `queries.ts` — all GROQ queries. Also `image.ts`, `portableText.tsx`, `metadata.ts`, `jsonld.tsx`.
- Content types live in the separate website Studio: `blogPost`, `propertyPage`, `areaGuide`, `landlordPage`, `landingPage`, `countyPricingStats`, `corporateStaysPage`, `addOn` (checkout add-ons), and singletons (`siteSettings`, `footer`, `navigation`, `heroSection`, `privacyPolicyPage`, `termsPage`).
- **Adding a field:** edit the schema in `studio/schemaTypes/documents/`, update the GROQ query in `src/sanity/queries.ts`, run `npm run typegen` in the Studio, then use the field in the page.
- **Adding a page type:** new schema → new GROQ query → new route under `src/app/`.
- Never invent content or stats for a document with no real data; use an honest "expanding to this area soon" state.

### Uplisting integration — two auth surfaces
1. **Legacy Basic-auth key** (`src/lib/uplisting/client.ts`, `UPLISTING_API_KEY`) for `/availability`, `/properties`, `/calendar/:id`.
2. **OAuth2 (Authorization Code + PKCE)** (`src/lib/uplistingApi.ts`; a near-duplicate lives in `src/lib/uplisting.ts`) — the only method Uplisting accepts for `GET /quotes` (authoritative live pricing) and `POST /bookings`. Needs `UPLISTING_OAUTH_CLIENT_ID`, `_CLIENT_SECRET`, `_REFRESH_TOKEN`. The refresh token must be created once by an admin through `/oauth/uplisting/callback`.
3. `UPLISTING_MOCK_QUOTES=true` returns a fake quote so checkout can be exercised without live credentials. Development only.

Read the inline comments in these files — they record real API quirks found by testing. The Uplisting Postman collection documents the full API.

### Payments (Stripe embedded checkout)
1. `src/components/checkout/BookingCheckout.tsx` collects guest details and add-ons.
2. `POST /api/checkout/session` re-validates server-side, fetches a **fresh Uplisting quote** (never trusts client-sent amounts), checks add-ons against Sanity's stored prices, and creates a branded Checkout Session.
3. The client mounts Stripe's embedded checkout with the returned `clientSecret`.
4. `POST /api/stripe/webhook` verifies the Stripe signature and, on `checkout.session.completed`, creates the reservation in Uplisting.

Always re-derive prices on the server. Related routes: `/api/checkout/quote`, `/api/checkout/session-status`, `/api/stripe/create-payment-intent`.

### Guest auth
Passwordless Supabase magic link: `/account/login` → `signInWithOtp()` → email link → `/auth/callback` exchanges the code for a session → `/account` reads the guest's own rows through row-level security.

### Environment variables (names only)
`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_DISQUS_SHORTNAME`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `MAILERLITE_API_KEY` plus per-form `MAILERLITE_*_GROUP_ID` (landlord, newsletter, calculator, contact, pricing), `UPLISTING_API_KEY`, `UPLISTING_OAUTH_CLIENT_ID` / `_CLIENT_SECRET` / `_REFRESH_TOKEN`, `UPLISTING_MOCK_QUOTES`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

Forms that sync to MailerLite should degrade gracefully when a `MAILERLITE_*` variable is missing rather than crashing.

### Deploy
Netlify: build `npm run build`, publish `.next`. `netlify.toml` excludes `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` from Netlify's secret scanner because it is a public, referrer-restricted client key.

### UI conventions
- Required form fields get a red asterisk.
- Validation errors use `--error-red`, never the brand maroon.

---

## 5. Admin dashboard (`sosstays/sosstays_admin`)

Internal tool to view and edit the shared Supabase tables in one place. It makes no Uplisting or MailerLite calls of its own; it reads and writes the tables other systems populate.

- **Stack:** Next.js 16 (App Router), React 19, shadcn/ui (Base UI primitives), Tailwind v4, `@supabase/supabase-js` (server-only client), `iron-session` for the login session. No table library (the column selector is hand-rolled), no global state library, no API routes — everything is Server Actions.
- **Config-driven CRUD:** `src/lib/tables/config.ts` defines every table — fields, types, editability, list columns, relations and form groupings. `queries.ts` and `actions.ts` are generic and work purely from that config. Tables: `properties`, `guests`, `bookings`, `landlord_leads`, `partner_leads`, `corporate_leads`, `contact_queries`, `newsletter_subscribers`. The one hand-written exception is `/contacts` (one row per email across all tables, over the read-only `contacts` view; `src/lib/contacts.ts`).
- **Add a table or page:** add it to `src/lib/tables/config.ts` and add a route folder under `src/app/(dashboard)/`. No new CRUD code is needed.
- **Auth:** a password-gated session (`src/app/login/actions.ts`, `src/middleware.ts`). Ask the maintainer for access.
- **Env vars (names):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_PASSWORD`, `SESSION_SECRET`. The service-role key is server-only and must never reach the browser.
- **Deploy:** not decided yet. See `admin-dashboard-plan.md` and `DESIGN_HANDOFF.md` in that repo.

---

## 6. Concierge site (`sosstays/concierge`)

A static, no-build-step site (`index.html`, `script.js`, `style.css`) that guests open from a WhatsApp check-in link (`?bookingid=...`). One Netlify deployment per physical property.

**Flow**
1. The guest fills in a name/email form (Netlify Forms with a honeypot). The booking id comes from the URL.
2. In parallel: submit to Netlify Forms; if marketing opt-in is ticked, call `/.netlify/functions/subscribe` (MailerLite, key kept server-side); call the Supabase Edge Function `link-booking`, which attaches the email to the booking and returns room number, lock code and dates.
3. Property content (wifi, venues, FAQs) is fetched at page load from Sanity's public GROQ API, keyed by `SANITY_PROPERTY_ID`, which `/.netlify/functions/config` supplies from an env var. The same bundle therefore serves every property.

**`studio/`** (in this repo) is a separate Sanity Studio. One `property` document per physical property references shared `foodVenue`, `attractionVenue` and `travelVenue` documents, so one restaurant can be recommended by several properties.

**Add a new property:** create a `property` document in this Studio and set `SANITY_PROPERTY_ID` on a new Netlify site. No code change.

**Netlify Functions** (`netlify/functions/`): `config.js` (returns the property id) and `subscribe.js` (MailerLite signup; needs `MAILERLITE_API_KEY`, optional `MAILERLITE_GROUP_ID`, set in Netlify's site settings).

---

## 7. Database and Edge Functions (`sosstays/sosstays_database`)

Supabase Postgres schema (`supabase/migrations/`) and Deno Edge Functions (`supabase/functions/`).

### Schema
- `properties` — one row per Uplisting *listing* (a room, not necessarily a building). `checkin_subdomain` groups several listings under one Concierge subdomain; `nickname` and `access_instructions` feed guest messages.
- `guests` — created or linked through the Concierge check-in form (verified email). `auth_user_id` links to Supabase Auth for website login.
- `bookings` — `uplisting_reservation_id`, links to property and guest, `checkin_token` (the public `bookingid` used in check-in URLs; internal ids are never exposed), room number and lock code, `confirmation_sent_at` / `reminder_sent_at` to prevent duplicate WhatsApp sends.
- `guest_profiles` — view of lifetime stays and revenue per guest.
- `landlord_leads`, `partner_leads`, `corporate_leads`, `contact_queries`, `newsletter_subscribers` — website form submissions, each with a `status`, MailerLite ids and an `updated_at` trigger. An empty `mailerlite_synced_at` means saved in Supabase but the MailerLite push failed.
- `contacts` — a view unioning every table that holds a person, by lower-cased email, with a `roles` array.
- Row-level security: an authenticated guest can read only their own `guests`, `bookings` and related `properties` rows.

### Edge Functions
- `uplisting-webhook` — receives Uplisting webhooks (signature-verified), upserts `properties` and `bookings`, and sends a WhatsApp confirmation for direct bookings.
- `send-checkin-reminders` — run daily by a `pg_cron` job; sends tomorrow's check-in reminder with the Concierge link.
- `link-booking` — called by the Concierge guest form.
- `_shared/whatchimp.ts` — WhatsApp Business API wrapper. The reminder template id has changed several times; keep it in sync with the template approved in WhatChimp. Reminders skip silently if `access_instructions` or `checkin_subdomain` is unset on a property.

`checkin_instructions_template.json` is the WhatsApp template spec. It may be out of date versus the live template (it has 4 variables; the code sends 3).

There is no `supabase/config.toml`, so run `supabase init` / link the project before using the CLI locally.

---

## 8. How to add a feature

| I want to… | Go to |
|---|---|
| Add a marketing or landing page | Website: new Sanity schema + GROQ query + route. For a one-off page, reuse the `landingPage` catch-all (`/[slug]`). |
| Show a new table in the admin | Dashboard: `src/lib/tables/config.ts` |
| Add a concierge property | Concierge Studio: new `property` document + a Netlify site with `SANITY_PROPERTY_ID` |
| Change what happens on booking creation/cancellation | Database: `supabase/functions/uplisting-webhook` |
| Change the check-in reminder text or timing | Database: `send-checkin-reminders` and the `pg_cron` schedule in `0002_messaging.sql` |
| Touch checkout or payments | Website: `src/app/api/checkout/session/route.ts` and `src/app/api/stripe/webhook/route.ts` |
| Call Uplisting | Check whether the call needs the legacy key or OAuth; only `/quotes` and `POST /bookings` are OAuth-only |
| Add a form that captures leads | Website: new `/api/*` route that calls `saveLead()`; add the table to the database and dashboard config |

Every change: branch off `dev`, run `npm run lint && npm run build`, test in the browser, PR into `dev`.

---

## 9. Known gaps

- `src/lib/uplisting.ts` and `src/lib/uplistingApi.ts` are near-duplicate OAuth clients and should be consolidated.
- No automated tests anywhere (website, dashboard or concierge).
- The admin dashboard has no deploy target yet.
- `checkin_instructions_template.json` may be stale relative to the live WhatsApp template.
- Check `git branch -r --no-merged origin/dev` for unmerged work before starting something that might already exist.
