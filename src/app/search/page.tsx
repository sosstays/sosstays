import { client } from "@/sanity/client";
import { PROPERTY_PAGES_QUERY } from "@/sanity/queries";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/Button";
import { searchUplistingAvailability, type UplistingAvailableRoom } from "@/lib/uplisting/client";

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
};

type SearchPageParams = {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: string;
};

function formatDateLabel(iso?: string) {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

// Uplisting's /availability returns individual room listings, not our
// Sanity property pages — several listings can belong to one physical
// guesthouse, and there's currently no reliable field linking a listing
// back to a propertyPage document (see lib/uplisting/client.ts). Render
// them as their own cards, sourced entirely from Uplisting, until that
// mapping exists.
function RoomCard({ room }: { room: UplistingAvailableRoom }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-sage-grey/40 shadow-[0_12px_32px_-18px_rgba(63,82,64,0.2)]">
      {room.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- external Uplisting CDN, not configured for next/image
        <img src={room.photoUrl} alt={room.name} className="h-[220px] w-full object-cover" />
      ) : (
        <div className="flex h-[220px] w-full items-center justify-center bg-light-forest-green text-near-black/40">
          No photo yet
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {room.city && <p className="mb-2 text-xs tracking-widest text-near-black/55 uppercase">{room.city}</p>}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h3 className="font-serif text-lg font-bold text-near-black">{room.name}</h3>
          {room.maximumCapacity && (
            <span className="rounded-full bg-light-sage/35 px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-forest-green">
              Sleeps {room.maximumCapacity}
            </span>
          )}
        </div>
        {room.description && <p className="mb-6 line-clamp-3 text-near-black/70">{room.description}</p>}

        {room.uplistingDomain && (
          <Button
            link={room.uplistingDomain}
            external
            variant="primary"
            size="custom"
            className="mt-auto self-start px-6 py-3.5 text-[15px] font-semibold"
          >
            Book this room →
          </Button>
        )}
      </div>
    </div>
  );
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
      ? searchUplistingAvailability({
          checkIn: check_in,
          checkOut: check_out,
          guests: guestCount,
          city: location,
        }).catch((error) => {
          console.error("Uplisting availability search failed:", error);
          return null;
        })
      : Promise.resolve(null),
  ]);

  const checkInLabel = formatDateLabel(check_in);
  const checkOutLabel = formatDateLabel(check_out);
  const criteriaBits = [
    location,
    checkInLabel && checkOutLabel ? `${checkInLabel} – ${checkOutLabel}` : null,
    guestCount ? `${guestCount} guest${guestCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  const showRooms = hasSearchCriteria && availability !== null;

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="bg-cream">
        <div className="mx-auto max-w-6xl px-8 py-8 sm:px-14">
          <SearchBar />
        </div>

        <div className="mx-auto max-w-6xl px-8 pb-12 sm:px-14">
          <h1 className="font-serif text-4xl font-semibold text-near-black">
            {criteriaBits.length > 0 ? "Available rooms" : "All stays"}
          </h1>
          <p className="mt-2 text-near-black/60">
            {criteriaBits.length > 0
              ? criteriaBits.join(" · ")
              : "Book direct — no Airbnb fees, and you'll always know exactly who to call."}
          </p>

          {hasSearchCriteria && !availability && (
            <p className="mt-6 rounded-xl bg-light-forest-green px-5 py-3.5 text-sm text-near-black/80">
              We couldn&apos;t check live availability just now, so here&apos;s every stay — get in touch
              and we&apos;ll confirm dates directly.
            </p>
          )}

          {showRooms ? (
            <>
              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {availability!.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
              {availability!.length === 0 && (
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
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
