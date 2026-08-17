// Uplisting's legacy public API (connect.uplisting.io) — auth is a plain
// API key, Base64-encoded into a Basic Authorization header. Requires
// UPLISTING_API_KEY to be set; there is no OAuth flow for this endpoint.

const API_BASE_URL = process.env.UPLISTING_API_BASE_URL || "https://connect.uplisting.io";

export type UplistingAvailableProperty = {
  id: string;
  propertySlug: string;
  name: string;
  maximumCapacity?: number;
};

function authHeader(): string {
  const key = process.env.UPLISTING_API_KEY;
  if (!key) throw new Error("UPLISTING_API_KEY is not configured");
  return `Basic ${Buffer.from(key).toString("base64")}`;
}

/**
 * GET /availability — properties free for the given date range, guest
 * count, and (optional) city. Omitted filters are just left off the query
 * string, matching every property on that criterion.
 */
export async function searchUplistingAvailability({
  checkIn,
  checkOut,
  guests,
  city,
}: {
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  guests?: number;
  city?: string;
}): Promise<UplistingAvailableProperty[]> {
  const url = new URL("/availability", API_BASE_URL);
  if (checkIn) url.searchParams.set("check_in", checkIn);
  if (checkOut) url.searchParams.set("check_out", checkOut);
  if (guests) url.searchParams.set("number_of_guests", String(guests));
  if (city) url.searchParams.set("city", city);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    // Availability changes constantly and is only ever fetched for a
    // specific search — never cache it.
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting availability search failed (${res.status}): ${detail}`);
  }

  const body = (await res.json()) as { data?: unknown[] };
  const entries = body.data;
  if (!Array.isArray(entries)) return [];

  return entries.map((entry) => {
    const property = entry as {
      id: string;
      attributes?: { property_slug?: string; name?: string; maximum_capacity?: number };
    };
    return {
      id: String(property.id),
      propertySlug: property.attributes?.property_slug ?? "",
      name: property.attributes?.name ?? "",
      maximumCapacity: property.attributes?.maximum_capacity,
    };
  });
}
