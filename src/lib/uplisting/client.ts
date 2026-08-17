import type { UplistingCalendarDay, UplistingProperty } from "./types";

const API_BASE_URL = process.env.UPLISTING_API_BASE_URL || "https://connect.uplisting.io";

function authHeader(): string {
  const key = process.env.UPLISTING_API_KEY;
  if (!key) throw new Error("UPLISTING_API_KEY is not configured");
  return `Basic ${Buffer.from(key).toString("base64")}`;
}

async function uplistingGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const url = new URL(path, API_BASE_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting request to ${path} failed (${res.status}): ${detail}`);
  }

  return res.json();
}

/**
 * GET /calendar/:listing_id — per-day availability for one property.
 * Response is limited to 12 months at a time.
 */
export async function fetchUplistingCalendar(
  uplistingPropertyId: string,
  fromDate: string, // YYYY-MM-DD
  toDate: string // YYYY-MM-DD
): Promise<UplistingCalendarDay[]> {
  const body = (await uplistingGet(`/calendar/${uplistingPropertyId}`, {
    from: fromDate,
    to: toDate,
  })) as { calendar?: { days?: unknown[] } };

  const days = body.calendar?.days;
  if (!Array.isArray(days)) return [];

  return days.map((entry) => {
    const day = entry as Record<string, unknown>;
    return {
      date: String(day.date),
      isAvailable: Boolean(day.available),
      minStay:
        typeof day.minimum_length_of_stay === "number" ? day.minimum_length_of_stay : undefined,
    };
  });
}

/**
 * GET /properties — used to resolve Sanity's uplistingPropertySlug to the
 * numeric property ID that the Calendar API and webhooks actually key on.
 */
export async function fetchUplistingProperties(): Promise<UplistingProperty[]> {
  const body = (await uplistingGet("/properties")) as { data?: unknown[] };
  const entries = body.data;
  if (!Array.isArray(entries)) return [];

  return entries.map((entry) => {
    const property = entry as {
      id: string;
      attributes?: { property_slug?: string; name?: string };
    };
    return {
      id: String(property.id),
      slug: property.attributes?.property_slug ?? "",
      name: property.attributes?.name ?? "",
    };
  });
}
