import { client } from "../../sanity/client";
import { SYNCABLE_PROPERTIES_QUERY } from "../../sanity/queries";
import { fetchUplistingCalendar } from "../uplisting/client";
import { MIN_MS_BETWEEN_REQUESTS_PER_PROPERTY, sleep } from "../uplisting/rateLimit";
import { upsertCalendarDays } from "./cache";

const SYNC_WINDOW_MONTHS = 12;
const CHUNK_MONTHS = 3; // keeps each request's payload/date-range small

export type SyncableProperty = {
  _id: string;
  name: string;
  uplistingPropertySlug: string;
};

export async function getSyncableProperties(): Promise<SyncableProperty[]> {
  return client.fetch(SYNCABLE_PROPERTIES_QUERY);
}

/**
 * Pulls the full rolling window for one property, in date-range chunks so
 * a single sync stays well under Uplisting's per-property rate limit even
 * on properties with 12 months of data.
 */
export async function syncPropertyCalendar(
  propertyId: string,
  windowStart: Date = new Date()
): Promise<void> {
  const windowEnd = addMonths(windowStart, SYNC_WINDOW_MONTHS);
  let chunkStart = windowStart;

  while (chunkStart < windowEnd) {
    const chunkEnd = minDate(addMonths(chunkStart, CHUNK_MONTHS), windowEnd);

    const days = await fetchUplistingCalendar(
      propertyId,
      toDateString(chunkStart),
      toDateString(chunkEnd)
    );
    await upsertCalendarDays(propertyId, days);

    chunkStart = chunkEnd;
    if (chunkStart < windowEnd) {
      await sleep(MIN_MS_BETWEEN_REQUESTS_PER_PROPERTY);
    }
  }
}

/**
 * Re-fetches just the affected date range for one property — used by the
 * webhook handler so an availability change shows up without waiting for
 * the next scheduled sync.
 */
export async function syncPropertyCalendarRange(
  propertyId: string,
  fromDate: string,
  toDate: string
): Promise<void> {
  const days = await fetchUplistingCalendar(propertyId, fromDate, toDate);
  await upsertCalendarDays(propertyId, days);
}

/**
 * Runs the full snapshot sync across every property, staggered so
 * property N+1's first request doesn't fire until property N's is done —
 * keeps total request volume spread out rather than bursting.
 */
export async function syncAllProperties(): Promise<{ propertyId: string; ok: boolean; error?: string }[]> {
  const properties = await getSyncableProperties();
  const results: { propertyId: string; ok: boolean; error?: string }[] = [];

  for (const property of properties) {
    try {
      await syncPropertyCalendar(property.uplistingPropertySlug);
      results.push({ propertyId: property.uplistingPropertySlug, ok: true });
    } catch (err) {
      results.push({
        propertyId: property.uplistingPropertySlug,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    await sleep(MIN_MS_BETWEEN_REQUESTS_PER_PROPERTY);
  }

  return results;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function minDate(a: Date, b: Date): Date {
  return a < b ? a : b;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}
