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

  const included = new Map<string, JsonApiResource>();
  for (const resource of body.included ?? []) {
    included.set(`${resource.type}:${resource.id}`, resource);
  }

  function relatedOne(entry: JsonApiResource, key: string): JsonApiResource | undefined {
    const ref = entry.relationships?.[key]?.data;
    const single = Array.isArray(ref) ? ref[0] : ref;
    return single ? included.get(`${single.type}:${single.id}`) : undefined;
  }

  function relatedMany(entry: JsonApiResource, key: string): JsonApiResource[] {
    const ref = entry.relationships?.[key]?.data;
    const list = Array.isArray(ref) ? ref : ref ? [ref] : [];
    return list.map((r) => included.get(`${r.type}:${r.id}`)).filter((r): r is JsonApiResource => Boolean(r));
  }

  return entries.map((entry) => {
    const attrs = entry.attributes ?? {};
    const address = relatedOne(entry, "address");
    const photos = relatedMany(entry, "photos").sort(
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
  });
}
