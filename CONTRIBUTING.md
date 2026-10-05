# Contributing to SOS Stays

This repo (`web/`) is the Next.js frontend. Content is managed in a separate
Sanity Studio (`../studio`, sibling directory, not in this git repo).

## Project layout

```
SOS-Website/
├── web/       # Next.js 16 app (this repo, App Router, Tailwind v4) — deployed via Netlify
└── studio/    # Sanity Studio (schema + CMS UI) — not under version control yet
```

- `web/src/app/` — routes (App Router). Dynamic routes: `areas/[slug]`,
  `blog/[slug]`, `landlords/[slug]`, `stays/[slug]`.
- `web/src/app/api/` — Next.js route handlers for form submissions
  (contact, newsletter, calculator lead, MailerLite subscribe).
- `web/src/components/` — shared React components.
- `web/src/sanity/` — Sanity client, image URL builder, GROQ queries
  (`queries.ts`), portable text renderer, JSON-LD/metadata helpers.
- `web/src/lib/` — non-Sanity helpers (revenue calculator math, Google Maps
  embed helper, nav links, landlord handoff logic).
- `studio/schemaTypes/documents/` — one file per Sanity document type
  (e.g. `landlordPage.ts`, `blogPost.ts`, `countyPricingStats.ts`,
  `propertyPage.ts`). Add new content types here, then run typegen (below).

## Setup

Two apps, two dev servers. Run both when working on anything that touches
CMS content.

```bash
cd web && npm install
cd ../studio && npm install
```

Copy `web/.env.local` (already present, gitignored) and fill in any blank
keys before testing locally — Google Maps autocomplete and MailerLite
sync will silently no-op or 500 without them.

Required env vars in `web/.env.local`:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_DISQUS_SHORTNAME` (blog comments)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (address autocomplete on landlord/calculator forms)
- `MAILERLITE_API_KEY` + one `MAILERLITE_*_GROUP_ID` per form (landlord, newsletter, calculator, contact, pricing)
- `UPLISTING_API_KEY` (property/booking data — see `Uplisting API [Public].postman_collection.json` at repo root for endpoint reference)

## Running locally

```bash
cd web && npm run dev       # http://localhost:3000
cd studio && npm run dev    # http://localhost:3333
```

(`.claude/launch.json` at the repo root already defines both as named dev
servers — `web-dev` and `studio` — for anyone using Claude Code's preview
tooling.)

## Working with Sanity content

1. Add/change a field: edit the relevant file in `studio/schemaTypes/documents/`.
2. Update the GROQ query in `web/src/sanity/queries.ts` to fetch the new field.
3. Regenerate types from the studio: `npm run typegen` (runs
   `sanity schema extract` + `sanity typegen generate`).
4. Consume the field in the page/component — `web/src/sanity/portableText.tsx`
   handles rich text, `web/src/sanity/image.ts` handles image URLs.

Never fabricate content or stats for a document that has no real data yet
(e.g. per-county pricing for an area we don't operate in) — use an honest
"expanding to this area soon" state instead of a placeholder number.

## Branching & commits

Remote repo: `github.com/sosstays/sosstays` (configured as both the `origin`
and `sosstays` remotes — they point at the same place; push to `origin`
unless told otherwise).

- `main` = production. Netlify auto-deploys `main` to the live site.
- `dev` = preview/staging branch. Netlify builds a deploy preview from `dev`
  so changes can be checked before they go live. **Always branch off the
  latest `dev`, not `main`:**

  ```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/<short-description>
  ```

- Branch naming: `feature/<short-description>` (see `git branch -a` for
  examples — one branch per page or discrete feature, e.g.
  `feature/pricing-page`, `feature/revenue-calculator-page`).
- Commit messages: short, imperative, describe the user-visible change
  (e.g. "Fix tab-pill selector distorting into an oval when it wraps").
- Flow: `feature/*` → PR into `dev` → verify on the `dev` preview deploy →
  `dev` → `main` to ship to production. Don't merge a feature branch
  straight into `main`.

## Before opening a PR

```bash
npm run lint
npm run build
```

Fix lint/build errors before requesting review — Netlify will fail the
deploy preview otherwise.

## UI/UX conventions

- Required form fields get a red asterisk.
- Validation errors use the `--error-red` CSS variable — never the maroon
  brand color, which is reserved for brand/marketing use, not error states.
- Forms that sync to MailerLite (`web/src/app/api/*-subscribe/route.ts`,
  `route.ts` for `calculator-lead`) should degrade gracefully if a
  `MAILERLITE_*` env var is missing rather than crashing the request.

## Testing before you claim something works

There's no automated test suite yet — verify UI changes by actually running
`npm run dev` and clicking through the flow (including edge cases: empty
states, validation errors, mobile widths) before saying a feature is done.
