import { pool } from "../db";
import type { UplistingCalendarDay } from "../uplisting/types";

export type CachedAvailabilityDay = {
  date: string;
  isAvailable: boolean;
  minStay: number | null;
  lastSyncedAt: string;
};

/**
 * The only read path the UI should use for availability. Never calls
 * Uplisting — just reads whatever the sync job / webhook handler last
 * wrote into calendar_cache.
 */
export async function getCachedAvailability(
  propertyId: string,
  fromDate: string,
  toDate: string
): Promise<CachedAvailabilityDay[]> {
  const { rows } = await pool.query(
    `select date, is_available, min_stay, last_synced_at
     from calendar_cache
     where property_id = $1 and date >= $2 and date <= $3
     order by date asc`,
    [propertyId, fromDate, toDate]
  );

  return rows.map((row) => ({
    date: toDateString(row.date),
    isAvailable: row.is_available,
    minStay: row.min_stay,
    lastSyncedAt: row.last_synced_at.toISOString(),
  }));
}

/**
 * Overwrites cache rows for the given days. Used by both the scheduled
 * full-window sync and the webhook handler's targeted re-fetch.
 */
export async function upsertCalendarDays(
  propertyId: string,
  days: UplistingCalendarDay[]
): Promise<void> {
  if (days.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const day of days) {
      await client.query(
        `insert into calendar_cache (property_id, date, is_available, min_stay, last_synced_at)
         values ($1, $2, $3, $4, now())
         on conflict (property_id, date)
         do update set is_available = excluded.is_available,
                       min_stay = excluded.min_stay,
                       last_synced_at = excluded.last_synced_at`,
        [propertyId, day.date, day.isAvailable, day.minStay ?? null]
      );
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

function toDateString(value: Date | string): string {
  if (typeof value === "string") return value;
  return value.toISOString().slice(0, 10);
}
