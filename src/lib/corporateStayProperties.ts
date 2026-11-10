import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PublicCorporateStayProperty = {
  id: string;
  propertyName: string;
  area: string | null;
  county: string | null;
  maxGuestsStandard: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string | null;
  photos: string[];
  /** EUR, per person per night, from the most recent quote — null means "price on request". */
  pricePerPersonPerNight: number | null;
};

const BILLING_PERIOD_NIGHTS = 30;

function parsePhotos(photosUrl: string | null): string[] {
  if (!photosUrl) return [];
  return photosUrl
    .split(/[\s,]+/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url))
    .slice(0, 3);
}

/**
 * Approved, owner-consented corporate stay properties for the public
 * /corporate-stays carousel — never the raw listing_url or owner contact
 * details, and never a quote's internal status/history. A property with no
 * quote yet (or an unparseable occupancy figure) comes back with
 * pricePerPersonPerNight: null, shown on the frontend as "Price on request"
 * rather than an invented number.
 */
export async function getPublicCorporateStayProperties(): Promise<PublicCorporateStayProperty[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: properties, error: propertiesError } = await supabase
    .from("corporate_stay_properties")
    .select(
      "id, property_name, area, county, max_guests_standard, bedrooms, bathrooms, description, photos_url"
    )
    .eq("submission_status", "approved")
    .eq("public_listing_consent", "yes")
    .order("created_at", { ascending: false });

  if (propertiesError || !properties || properties.length === 0) {
    if (propertiesError) console.error("Failed to load corporate stay properties", propertiesError);
    return [];
  }

  const propertyIds = properties.map((p) => p.id as string);
  const { data: quotes, error: quotesError } = await supabase
    .from("corporate_stay_quotes")
    .select("property_id, owner_quote_eur, occupancy_guests, quote_captured_at")
    .in("property_id", propertyIds)
    .order("quote_captured_at", { ascending: false });

  if (quotesError) console.error("Failed to load corporate stay quotes", quotesError);

  // First (most recent, thanks to the order above) quote per property.
  const latestQuoteByProperty = new Map<string, { owner_quote_eur: number | null; occupancy_guests: string | null }>();
  for (const quote of quotes ?? []) {
    const propertyId = quote.property_id as string;
    if (!latestQuoteByProperty.has(propertyId)) {
      latestQuoteByProperty.set(propertyId, {
        owner_quote_eur: quote.owner_quote_eur as number | null,
        occupancy_guests: quote.occupancy_guests as string | null,
      });
    }
  }

  return properties.map((property) => {
    const quote = latestQuoteByProperty.get(property.id as string);
    const occupancy = quote?.occupancy_guests ? Number(quote.occupancy_guests) : NaN;
    const pricePerPersonPerNight =
      quote?.owner_quote_eur && Number.isFinite(occupancy) && occupancy > 0
        ? quote.owner_quote_eur / BILLING_PERIOD_NIGHTS / occupancy
        : null;

    return {
      id: property.id as string,
      propertyName: property.property_name as string,
      area: property.area as string | null,
      county: property.county as string | null,
      maxGuestsStandard: property.max_guests_standard as number | null,
      bedrooms: property.bedrooms as number | null,
      bathrooms: property.bathrooms as number | null,
      description: property.description as string | null,
      photos: parsePhotos(property.photos_url as string | null),
      pricePerPersonPerNight,
    };
  });
}
