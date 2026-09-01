// Endpoint and query params follow Uplisting's OAuth API docs ("Search
// availability" under Endpoints > Properties) rather than the older
// top-level "Availability" page — same URL and response shape either way,
// but the OAuth section is the maintained one. Auth is the exception: the
// OAuth docs show `Authorization: Bearer <token>`, but our API key is a
// legacy-style key, and the API only accepts it Basic-encoded (a raw
// Bearer send gets a 401 "Authorization header is missing or malformed" —
// confirmed against the live API).
//
// Despite the JSON:API resource type being "properties", each entry here
// is one Uplisting room/unit listing (e.g. "Family Ensuite, Balcony &
// Bunks | Boyne Valley"), not one of our Sanity property pages — several
// listings can belong to the same physical guesthouse. There's currently
// no reliable way to roll them back up to a Sanity property (see
// app/search/page.tsx), so callers should render these as their own
// cards rather than trying to match them to propertyPage documents.

const API_BASE_URL = process.env.UPLISTING_API_BASE_URL || "https://connect.uplisting.io";

export type UplistingAvailableRoom = {
  id: string;
  propertySlug: string;
  name: string;
  description?: string;
  maximumCapacity?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  city?: string;
  photoUrl?: string;
  /** Uplisting's own hosted page for this listing — the only booking link we have for it. */
  uplistingDomain?: string;
};

function authHeader(): string {
  const key = process.env.UPLISTING_API_KEY;
  if (!key) throw new Error("UPLISTING_API_KEY is not configured");
  return `Basic ${Buffer.from(key).toString("base64")}`;
}

type JsonApiResource = {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data?: { id: string; type: string } | { id: string; type: string }[] }>;
};

function relatedOne(
  entry: JsonApiResource,
  included: Map<string, JsonApiResource>,
  key: string
): JsonApiResource | undefined {
  const ref = entry.relationships?.[key]?.data;
  const single = Array.isArray(ref) ? ref[0] : ref;
  return single ? included.get(`${single.type}:${single.id}`) : undefined;
}

function relatedMany(
  entry: JsonApiResource,
  included: Map<string, JsonApiResource>,
  key: string
): JsonApiResource[] {
  const ref = entry.relationships?.[key]?.data;
  const list = Array.isArray(ref) ? ref : ref ? [ref] : [];
  return list.map((r) => included.get(`${r.type}:${r.id}`)).filter((r): r is JsonApiResource => Boolean(r));
}

function toIncludedMap(included: JsonApiResource[] | undefined): Map<string, JsonApiResource> {
  const map = new Map<string, JsonApiResource>();
  for (const resource of included ?? []) {
    map.set(`${resource.type}:${resource.id}`, resource);
  }
  return map;
}

function mapAvailableRoom(entry: JsonApiResource, included: Map<string, JsonApiResource>): UplistingAvailableRoom {
  const attrs = entry.attributes ?? {};
  const address = relatedOne(entry, included, "address");
  const photos = relatedMany(entry, included, "photos").sort(
    (a, b) => Number(a.attributes?.order ?? 0) - Number(b.attributes?.order ?? 0)
  );

  return {
    id: String(entry.id),
    propertySlug: String(attrs.property_slug ?? ""),
    name: String(attrs.name ?? ""),
    description: attrs.description ? String(attrs.description) : undefined,
    maximumCapacity: typeof attrs.maximum_capacity === "number" ? attrs.maximum_capacity : undefined,
    bedrooms: typeof attrs.bedrooms === "number" ? attrs.bedrooms : undefined,
    beds: typeof attrs.beds === "number" ? attrs.beds : undefined,
    bathrooms: typeof attrs.bathrooms === "number" ? attrs.bathrooms : undefined,
    city: address?.attributes?.city ? String(address.attributes.city) : undefined,
    photoUrl: photos[0]?.attributes?.url ? String(photos[0].attributes.url) : undefined,
    uplistingDomain: attrs.uplisting_domain ? String(attrs.uplisting_domain) : undefined,
  };
}

/**
 * GET /availability — room listings free for the given date range, guest
 * count, and (optional) city. Omitted filters are just left off the query
 * string, matching every listing on that criterion.
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
}): Promise<UplistingAvailableRoom[]> {
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

  const body = (await res.json()) as { data?: JsonApiResource[]; included?: JsonApiResource[] };
  const entries = body.data;
  if (!Array.isArray(entries)) return [];

  const included = toIncludedMap(body.included);
  return entries.map((entry) => mapAvailableRoom(entry, included));
}

export type UplistingRoomFees = {
  /** Flat one-time fee, e.g. cleaning. 0 if the property has none enabled. */
  cleaningFee: number;
  /** One-time charge per guest beyond `extraGuestThreshold` (0 if disabled or no threshold set). */
  extraGuestFee: number;
  extraGuestThreshold: number;
  /** The four tax shapes Uplisting supports for a property — each is 0 when not configured. */
  taxPerBooking: number; // flat, once
  taxPerBookingPercent: number; // % of the accommodation subtotal
  taxPerNight: number; // flat × nights
  taxPerPersonPerNight: number; // flat × guests × nights
};

export type UplistingRoomDetail = UplistingAvailableRoom & {
  /** Every photo for this listing, in Uplisting's display order (photoUrl above is just photos[0]). */
  photos: string[];
  amenities: string[];
  fees: UplistingRoomFees;
};

function findFee(entries: JsonApiResource[], label: string): number {
  const fee = entries.find((e) => e.attributes?.label === label);
  return fee?.attributes?.enabled === false ? 0 : Number(fee?.attributes?.amount ?? 0);
}

function findTax(entries: JsonApiResource[], label: string): number {
  const tax = entries.find((e) => e.attributes?.label === label);
  return Number(tax?.attributes?.amount ?? 0);
}

/**
 * GET /properties — same resource type /availability returns entries of,
 * but the full (unfiltered) collection rather than a date-range search.
 * There's no /properties/{id} lookup: a single listing has to be picked
 * out of this list by matching `property_slug` (the same value Sanity's
 * roomTypes[].roomId stores, and that /availability's entries expose as
 * `propertySlug` — confirmed against the live API, which 404s on
 * /properties/{id}). Fine to fetch in full each time: this account only
 * has a handful of listings.
 *
 * Used for the room detail page (/stays/[slug]/rooms/[roomId]), which
 * otherwise has no search-result context to pull a room's photos/
 * description/amenities from.
 */
export async function getUplistingRoom(propertySlug: string): Promise<UplistingRoomDetail | null> {
  const res = await fetch(new URL("/properties", API_BASE_URL).toString(), {
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    // Revalidated periodically rather than per-request: unlike
    // /availability this is fixed listing detail (photos, description,
    // room counts), not live date-range availability.
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting properties lookup failed (${res.status}): ${detail}`);
  }

  const body = (await res.json()) as { data?: JsonApiResource[]; included?: JsonApiResource[] };
  const entries = body.data;
  if (!Array.isArray(entries)) return null;

  const entry = entries.find((e) => String(e.attributes?.property_slug ?? "") === propertySlug);
  if (!entry) return null;

  const included = toIncludedMap(body.included);
  const room = mapAvailableRoom(entry, included);
  const photos = relatedMany(entry, included, "photos")
    .sort((a, b) => Number(a.attributes?.order ?? 0) - Number(b.attributes?.order ?? 0))
    .map((p) => (p.attributes?.url ? String(p.attributes.url) : null))
    .filter((url): url is string => Boolean(url));
  const amenities = relatedMany(entry, included, "amenities")
    .map((a) => (a.attributes?.name ? String(a.attributes.name) : null))
    .filter((name): name is string => Boolean(name));

  const feeEntries = relatedMany(entry, included, "fees");
  const taxEntries = relatedMany(entry, included, "taxes");
  const extraGuestFeeEntry = feeEntries.find((e) => e.attributes?.label === "extra_guest_charge");
  const fees: UplistingRoomFees = {
    cleaningFee: findFee(feeEntries, "cleaning_fee"),
    extraGuestFee: findFee(feeEntries, "extra_guest_charge"),
    extraGuestThreshold: Number(extraGuestFeeEntry?.attributes?.guests_included ?? 0),
    taxPerBooking: findTax(taxEntries, "per_booking_amount"),
    taxPerBookingPercent: findTax(taxEntries, "per_booking_percentage"),
    taxPerNight: findTax(taxEntries, "per_night"),
    taxPerPersonPerNight: findTax(taxEntries, "per_person_per_night"),
  };

  return { ...room, photos, amenities, fees };
}

export type UplistingCalendarDay = {
  date: string; // YYYY-MM-DD
  available: boolean;
  dayRate: number;
  minimumLengthOfStay: number;
  closedForArrival: boolean;
  closedForDeparture: boolean;
};

/**
 * GET /calendar/:property_id — per-day availability + rate for one
 * listing, addressed by Uplisting's *numeric* property id (the "id"
 * UplistingRoomDetail carries — not the property_slug used everywhere
 * else in this file). Confirmed against the live API: takes the same
 * Basic-encoded key as /properties and /availability despite Uplisting's
 * docs listing this folder under Bearer Token auth.
 *
 * There's no separate "quote" endpoint — day_rate summed across the
 * selected nights, plus each day's `available` flag, is what stands in
 * for both a price quote and a blocked-dates calendar (see room
 * booking bar, which uses this for both the on-load price display and
 * the pre-booking availability re-check).
 */
export async function getUplistingCalendar(
  propertyId: string,
  from: string,
  to: string
): Promise<UplistingCalendarDay[]> {
  const url = new URL(`/calendar/${propertyId}`, API_BASE_URL);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    // Same reasoning as /availability: this is checked live right before
    // sending a guest to book, so a stale cache defeats the point.
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting calendar lookup failed (${res.status}): ${detail}`);
  }

  const body = (await res.json()) as {
    calendar?: {
      days?: {
        date: string;
        available: boolean;
        day_rate: number;
        minimum_length_of_stay: number;
        closed_for_arrival: boolean;
        closed_for_departure: boolean;
      }[];
    };
  };

  return (body.calendar?.days ?? []).map((day) => ({
    date: day.date,
    available: Boolean(day.available),
    dayRate: Number(day.day_rate),
    minimumLengthOfStay: Number(day.minimum_length_of_stay),
    closedForArrival: Boolean(day.closed_for_arrival),
    closedForDeparture: Boolean(day.closed_for_departure),
  }));
}
