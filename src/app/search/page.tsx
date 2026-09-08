import { client } from "@/sanity/client";
import { PROPERTY_PAGES_QUERY } from "@/sanity/queries";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { SearchResultCard, type SearchResultRoom } from "@/components/SearchResultCard";
import { searchUplistingAvailability, getUplistingCalendar } from "@/lib/uplisting/client";

export const metadata = {
  title: "Search stays | Sos Stays",
  description: "Find an available holiday home across Louth, Meath, and the Mournes.",
};

type SosPropertyPage = {
  _id: string;
  name: string;
  slug: string;
  location: string;
  shortDescription?: string;
  sleeps?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  uplistingPropertySlug?: string;
  roomTypes?: SearchResultRoom[];
};

type SearchPageParams = {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: string;
};

// Real availability lookups are often fast enough (sub-second) that
// loading.tsx's "finding the best deals" animation barely registers —
// which reads as broken rather than reassuring. Padding the search out
// to a minimum perceived duration makes the wait feel intentional
// instead of instant/glitchy. Only applied when an actual search ran;
// plain browsing (no criteria) shouldn't be artificially slowed down.
const MIN_SEARCH_DELAY_MS = 2200;

function withMinDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([promise, new Promise((resolve) => setTimeout(resolve, ms))]).then(([result]) => result);
}

function formatDateLabel(iso?: string) {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

// Local-date arithmetic only — no toISOString(): that converts to UTC,
// which silently rolls the date back a day whenever the server's local
// timezone is ahead of UTC (bit us here: Ireland's BST offset turned
// "2026-09-10" into "2026-09-09").
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nightsInRange(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  const cursor = parseISODate(checkIn);
  const end = parseISODate(checkOut);
  while (cursor < end) {
    nights.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return nights;
}

// Approx "from" price beside each room in a matched property's list —
// the average nightly accommodation rate over the exact nights searched
// (no fees folded in, unlike the room page's booking total: this is a
// ballpark for comparing rooms at a glance, not a checkout figure).
// Best-effort: a failed/empty calendar lookup just omits the price for
// that room rather than fabricating one or failing the whole search.
async function withApproxPrices(
  propertyId: string | undefined,
  checkIn: string,
  checkOut: string
): Promise<number | undefined> {
  if (!propertyId) return undefined;
  try {
    const days = await getUplistingCalendar(propertyId, checkIn, checkOut);
    const nights = nightsInRange(checkIn, checkOut);
    const rates = nights
      .map((night) => days.find((d) => d.date === night)?.dayRate)
      .filter((rate): rate is number => typeof rate === "number");
    if (rates.length === 0) return undefined;
    return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
  } catch {
    return undefined;
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageParams>;
}) {
  const { location, check_in, check_out, guests } = await searchParams;
  const guestCount = guests ? Number(guests) : undefined;
  const hasSearchCriteria = Boolean(check_in || check_out || location || guestCount);

  const [properties, availability] = await Promise.all([
    client.fetch<SosPropertyPage[]>(PROPERTY_PAGES_QUERY),
    // A search is only ever made for one specific date/guest combination —
    // never worth caching — and Uplisting being unreachable shouldn't take
    // the whole page down, so fall back to showing every stay instead.
    hasSearchCriteria
      ? withMinDelay(
          searchUplistingAvailability({
            checkIn: check_in,
            checkOut: check_out,
            guests: guestCount,
            city: location,
          }).catch((error) => {
            console.error("Uplisting availability search failed:", error);
            return null;
          }),
          MIN_SEARCH_DELAY_MS
        )
      : Promise.resolve(null),
  ]);

  const checkInLabel = formatDateLabel(check_in);
  const checkOutLabel = formatDateLabel(check_out);
  const criteriaBits = [
    location,
    checkInLabel && checkOutLabel ? `${checkInLabel} – ${checkOutLabel}` : null,
    guestCount ? `${guestCount} guest${guestCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  const availableSlugs = availability ? new Set(availability.map((room) => room.propertySlug)) : null;
  // Uplisting's calendar (used for pricing) is keyed by numeric property
  // id, not the property_slug Sanity's roomTypes[].roomId stores — the
  // availability search already carries both, so build the lookup once.
  const slugToPropertyId = new Map((availability ?? []).map((room) => [room.propertySlug, room.id]));

  // Sanity's roomTypes[].roomId is the Uplisting room ID for that room —
  // a property "matches" a search when at least one of its rooms is
  // among the available listings Uplisting just returned.
  const matchedProperties = availableSlugs
    ? properties
        .map((property) => ({
          property,
          matchedRooms: (property.roomTypes ?? []).filter(
            (room) => room.roomId && availableSlugs.has(room.roomId)
          ),
        }))
        .filter((entry) => entry.matchedRooms.length > 0)
    : [];

  const matchedPropertiesWithPrices =
    check_in && check_out
      ? await Promise.all(
          matchedProperties.map(async ({ property, matchedRooms }) => ({
            property,
            matchedRooms: await Promise.all(
              matchedRooms.map(async (room) => ({
                ...room,
                fromPricePerNight: await withApproxPrices(
                  room.roomId ? slugToPropertyId.get(room.roomId) : undefined,
                  check_in,
                  check_out
                ),
              }))
            ),
          }))
        )
      : matchedProperties;

  const showMatches = hasSearchCriteria && availableSlugs !== null;

  return (
    <main className="flex-1 bg-cream">
      <div className="mx-auto max-w-6xl px-8 py-8 sm:px-14">
        <SearchBar
          initialLocation={location}
          initialCheckIn={check_in}
          initialCheckOut={check_out}
          initialGuests={guestCount}
        />
      </div>

      <div className="mx-auto max-w-6xl px-8 pb-12 sm:px-14">
        <h1 className="font-serif text-4xl font-semibold text-near-black">
          {criteriaBits.length > 0 ? "Available stays" : "All stays"}
        </h1>
        <p className="mt-2 text-near-black/60">
          {criteriaBits.length > 0
            ? criteriaBits.join(" · ")
            : "Book direct — no Airbnb fees, and you'll always know exactly who to call."}
        </p>

        {hasSearchCriteria && !availableSlugs && (
          <p className="mt-6 rounded-xl bg-light-forest-green px-5 py-3.5 text-sm text-near-black/80">
            We couldn&apos;t check live availability just now, so here&apos;s every stay — get in touch and
            we&apos;ll confirm dates directly.
          </p>
        )}

        {showMatches ? (
          <>
            <div className="mt-10 flex flex-col gap-12">
              {matchedPropertiesWithPrices.map(({ property, matchedRooms }) => (
                <SearchResultCard
                  key={property._id}
                  slug={property.slug}
                  name={property.name}
                  location={property.location}
                  sleeps={property.sleeps}
                  coverImage={property.coverImage}
                  rooms={matchedRooms}
                  checkIn={check_in}
                  checkOut={check_out}
                  guests={guestCount}
                />
              ))}
            </div>
            {matchedProperties.length === 0 && (
              <p className="mt-8 text-near-black/60">
                Nothing available for those dates — try a different range, or check back soon.
              </p>
            )}
          </>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                slug={property.slug}
                name={property.name}
                location={property.location}
                shortDescription={property.shortDescription}
                sleeps={property.sleeps}
                coverImage={property.coverImage}
                surface="framed"
                hideDescription
                hideCta
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
