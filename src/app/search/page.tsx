import { client } from "@/sanity/client";
import { PROPERTY_PAGES_QUERY } from "@/sanity/queries";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { PropertyCard } from "@/components/PropertyCard";
import { searchUplistingAvailability } from "@/lib/uplisting/client";

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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageParams>;
}) {
  const { location, check_in, check_out, guests } = await searchParams;
  const guestCount = guests ? Number(guests) : undefined;

  const [properties, availability] = await Promise.all([
    client.fetch<SosPropertyPage[]>(PROPERTY_PAGES_QUERY),
    // A search is only ever made for one specific date/guest combination —
    // never worth caching — and Uplisting being unreachable shouldn't take
    // the whole page down, so fall back to unfiltered results instead.
    searchUplistingAvailability({
      checkIn: check_in,
      checkOut: check_out,
      guests: guestCount,
      city: location,
    }).catch((error) => {
      console.error("Uplisting availability search failed:", error);
      return null;
    }),
  ]);

  const hasSearchCriteria = Boolean(check_in || check_out || location || guestCount);
  const availableSlugs = availability ? new Set(availability.map((p) => p.propertySlug)) : null;

  const results =
    availableSlugs && hasSearchCriteria
      ? properties.filter((p) => p.uplistingPropertySlug && availableSlugs.has(p.uplistingPropertySlug))
      : properties;

  const checkInLabel = formatDateLabel(check_in);
  const checkOutLabel = formatDateLabel(check_out);
  const criteriaBits = [
    location,
    checkInLabel && checkOutLabel ? `${checkInLabel} – ${checkOutLabel}` : null,
    guestCount ? `${guestCount} guest${guestCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="mx-auto max-w-6xl px-8 py-12 sm:px-14">
        <h1 className="font-serif text-4xl font-semibold text-near-black">
          {criteriaBits.length > 0 ? "Available stays" : "All stays"}
        </h1>
        <p className="mt-2 text-near-black/60">
          {criteriaBits.length > 0
            ? criteriaBits.join(" · ")
            : "Book direct — no Airbnb fees, and you'll always know exactly who to call."}
        </p>

        {hasSearchCriteria && !availability && (
          <p className="mt-6 rounded-xl bg-light-forest-green px-5 py-3.5 text-sm text-near-black/80">
            We couldn&apos;t check live availability just now, so here&apos;s every stay — get in touch and
            we&apos;ll confirm dates directly.
          </p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((property) => (
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

        {results.length === 0 && (
          <p className="mt-8 text-near-black/60">
            Nothing available for those dates — try a different range, or check back soon.
          </p>
        )}
      </main>
    </>
  );
}
