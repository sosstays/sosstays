import "server-only";
import type { GoogleReviewsData } from "@/components/GoogleReviews";

// Google reviews for a stay page, from the Places API (New) Place Details
// endpoint. Server-only: the key is read here and sent in a request
// header, so it never reaches the browser.

// How long one property's response is reused before asking Google again.
const REVALIDATE_SECONDS = 60 * 60 * 24;
// A slow Google response must never hold up the page.
const TIMEOUT_MS = 2500;
// Only what the section shows — the field mask is what Google bills on.
const FIELD_MASK = "displayName,rating,userRatingCount,reviews,googleMapsUri";

type PlacesReview = {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  googleMapsUri?: string;
};

type PlaceDetails = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

// Returns null — so the section renders nothing — when the property has
// no Place ID, the key isn't configured, or Google fails, times out or has
// no rating/reviews for the place. Failures are logged, never thrown.
export async function getGoogleReviews(placeId?: string | null): Promise<GoogleReviewsData | null> {
  const id = placeId?.trim();
  if (!id) return null;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Google reviews: GOOGLE_PLACES_API_KEY is not set");
    return null;
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=en`, {
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELD_MASK },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error(`Google reviews: Places API responded ${res.status} for place ${id}`);
      return null;
    }

    const place = (await res.json()) as PlaceDetails;
    if (typeof place.rating !== "number" || !place.googleMapsUri) return null;

    // Kept exactly as Google returns them: same order, nothing filtered
    // out, and each review in the language it was written in.
    const reviews = (place.reviews ?? [])
      .filter((r) => typeof r.rating === "number" && r.authorAttribution?.displayName)
      .map((r) => ({
        authorName: r.authorAttribution!.displayName!,
        authorUrl: r.authorAttribution?.uri ?? null,
        authorPhotoUrl: r.authorAttribution?.photoUri ?? null,
        rating: r.rating!,
        relativeTime: r.relativePublishTimeDescription ?? null,
        text: r.originalText?.text || r.text?.text || null,
        reviewUrl: r.googleMapsUri ?? null,
      }));
    if (reviews.length === 0) return null;

    return {
      rating: place.rating,
      reviewCount: place.userRatingCount ?? reviews.length,
      mapsUrl: place.googleMapsUri,
      reviews,
    };
  } catch (error) {
    console.error(`Google reviews: request failed for place ${id}`, error);
    return null;
  }
}
