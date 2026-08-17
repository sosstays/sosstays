import type { UplistingCalendarDay } from "./types";

const API_BASE_URL = process.env.UPLISTING_API_BASE_URL || "https://api.uplisting.io";

function apiKey(): string {
  const key = process.env.UPLISTING_API_KEY;
  if (!key) throw new Error("UPLISTING_API_KEY is not configured");
  return key;
}

/**
 * Fetches raw calendar/availability data for one property over a date
 * range from Uplisting's Calendar API.
 *
 * ASSUMPTION — not yet verified against Uplisting's docs: endpoint path,
 * query params, and response shape below are a best guess at their
 * REST conventions. Confirm against Uplisting's API reference (or their
 * support team) and adjust this function + normalizeCalendarResponse
 * before relying on it in production.
 */
export async function fetchUplistingCalendar(
  propertyId: string,
  fromDate: string, // YYYY-MM-DD
  toDate: string // YYYY-MM-DD
): Promise<UplistingCalendarDay[]> {
  const url = new URL(`/v2/properties/${propertyId}/calendar`, API_BASE_URL);
  url.searchParams.set("from", fromDate);
  url.searchParams.set("to", toDate);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting calendar request failed (${res.status}): ${detail}`);
  }

  const body = await res.json();
  return normalizeCalendarResponse(body);
}

// Adjust this to match Uplisting's real response shape once verified.
function normalizeCalendarResponse(body: unknown): UplistingCalendarDay[] {
  const days = Array.isArray(body) ? body : (body as { data?: unknown[] })?.data;
  if (!Array.isArray(days)) return [];

  return days.map((entry) => {
    const day = entry as Record<string, unknown>;
    return {
      date: String(day.date),
      isAvailable: Boolean(day.available ?? day.is_available),
      minStay:
        typeof day.min_stay === "number"
          ? day.min_stay
          : typeof day.minStay === "number"
            ? day.minStay
            : undefined,
    };
  });
}
