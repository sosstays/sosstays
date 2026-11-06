-- First-touch marketing attribution on every lead table.
--
-- Written by saveLead() (src/lib/leads.ts) from the `sos_attr` cookie set by
-- AttributionCapture. Shape (all keys optional except source/medium):
--   { source, medium, campaign, term, content, gclid, gbraid, wbraid, fbclid,
--     msclkid, referrer, landing_page, first_seen }
--
-- Safe to run at any time and safe to run before or after the deploy: until
-- the column exists, saveLead() retries the insert without it, so no lead is
-- lost either way. Idempotent.

alter table public.landlord_leads         add column if not exists attribution jsonb;
alter table public.contact_queries        add column if not exists attribution jsonb;
alter table public.newsletter_subscribers add column if not exists attribution jsonb;
alter table public.corporate_leads        add column if not exists attribution jsonb;
alter table public.partner_leads          add column if not exists attribution jsonb;
alter table public.bespoke_trip_leads     add column if not exists attribution jsonb;
alter table public.gift_maker_leads       add column if not exists attribution jsonb;

-- Quick "which channel produces leads" queries.
create index if not exists landlord_leads_attr_source_idx
  on public.landlord_leads ((attribution ->> 'source'), (attribution ->> 'medium'));
create index if not exists contact_queries_attr_source_idx
  on public.contact_queries ((attribution ->> 'source'), (attribution ->> 'medium'));
