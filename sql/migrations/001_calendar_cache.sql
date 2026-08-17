-- Cache-first availability store. Everything in the UI reads from this
-- table; nothing calls Uplisting live except the sync job and the single
-- live-check exception at booking time (see src/lib/calendar/liveCheck.ts).
create table if not exists calendar_cache (
  property_id text not null,
  date date not null,
  is_available boolean not null,
  min_stay integer,
  last_synced_at timestamptz not null default now(),
  primary key (property_id, date)
);

create index if not exists calendar_cache_property_date_idx
  on calendar_cache (property_id, date);
