import { fetchUplistingCalendar } from "../uplisting/client";
import { MIN_MS_BETWEEN_REQUESTS_PER_PROPERTY, sleep } from "../uplisting/rateLimit";
import { upsertCalendarDays } from "./cache";
import { resolveSyncableProperties } from "./properties";

const SYNC_WINDOW_MONTHS = 12;
const CHUNK_MONTHS = 3; // keeps each request's payload/date-range small

/**
 * Pulls the full rolling window for one property, in date-range chunks so
 * a single sync stays well under Uplisting's per-property rate limit even
 * on properties with 12 months of data.
 *
 * `uplistingPropertyId` is Uplisting's numeric property ID (not the
 * property_slug used for booking links) — see resolveSyncableProperties.
 */
export async function syncPropertyCalendar(
  uplistingPropertyId: string,
  windowStart: Date = new Date()
): Promise<void> {
  const windowEnd = addMonths(windowStart, SYNC_WINDOW_MONTHS);
  let chunkStart = windowStart;

  while (chunkStart < windowEnd) {
    const chunkEnd = minDate(addMonths(chunkStart, CHUNK_MONTHS), windowEnd);

    const days = await fetchUplistingCalendar(
      uplistingPropertyId,
      toDateString(chunkStart),
      toDateString(chunkEnd)
    );
    await upsertCalendarDays(uplistingPropertyId, days);

    chunkStart = chunkEnd;
    if (chunkStart < windowEnd) {
      await sleep(MIN_MS_BETWEEN_REQUESTS_PER_PROPERTY);
    }
  }
}

/**
 * Re-fetches just the affected date range for one property — used by the
 * webhook handler so an availability change shows up without waiting for
 * the next scheduled sync. `uplistingPropertyId` is the numeric ID the
 * webhook payload already carries as `property_id`.
 */
export async function syncPropertyCalendarRange(
  uplistingPropertyId: string,
  fromDate: string,
  toDate: string
): Promise<void> {
  const days = await fetchUplistingCalendar(uplistingPropertyId, fromDate, toDate);
  await upsertCalendarDays(uplistingPropertyId, days);
}

/**
 * Runs the full snapshot sync across every property, staggered so
 * property N+1's first request doesn't fire until property N's is done —
 * keeps total request volume spread out rather than bursting.
 */
export async function syncAllProperties(): Promise<
  { propertyId: string; ok: boolean; error?: string }[]
> {
  const properties = await resolveSyncableProperties();
  const results: { propertyId: string; ok: boolean; error?: string }[] = [];

  for (const property of properties) {
    try {
      await syncPropertyCalendar(property.uplistingPropertyId);
      results.push({ propertyId: property.uplistingPropertyId, ok: true });
    } catch (err) {
      results.push({
        propertyId: property.uplistingPropertyId,
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
