// Server-only client for Uplisting's OAuth API (quotes + bookings). This is
// a *different* auth surface from the Basic-auth UPLISTING_API_KEY used
// elsewhere (calendar/properties): quotes and booking creation only exist
// under the OAuth API, which requires a refresh token obtained once via the
// interactive Authorization Code + PKCE flow (see the Postman collection at
// the repo root, "OAuth API > Authentication"). There is no way to mint that
// refresh token from a client id/secret alone — an account admin has to
// complete the browser authorize step and hand over the resulting
// UPLISTING_OAUTH_REFRESH_TOKEN.

const AUTH_BASE_URL = process.env.UPLISTING_AUTH_BASE_URL || "https://auth.airdna.co";
const API_BASE_URL = process.env.UPLISTING_API_BASE_URL || "https://connect.uplisting.io";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

// Module-scope cache: reused across warm invocations of the same server
// instance, refetched on cold start. Good enough for a low-volume checkout
// flow — no shared/persistent token store yet.
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function oauthCredentials() {
  const clientId = process.env.UPLISTING_OAUTH_CLIENT_ID;
  const clientSecret = process.env.UPLISTING_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.UPLISTING_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

async function fetchAccessToken(): Promise<string> {
  const credentials = oauthCredentials();
  if (!credentials) {
    throw new Error(
      "Uplisting OAuth is not configured (UPLISTING_OAUTH_CLIENT_ID / _CLIENT_SECRET / _REFRESH_TOKEN)"
    );
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  const res = await fetch(`${AUTH_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: credentials.refreshToken,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting token refresh failed (${res.status}): ${detail}`);
  }

  const body = (await res.json()) as TokenResponse;
  // expires_in is seconds; refresh a minute early to avoid edge-of-expiry failures.
  cachedAccessToken = { token: body.access_token, expiresAt: Date.now() + (body.expires_in - 60) * 1000 };

  if (body.refresh_token && body.refresh_token !== credentials.refreshToken) {
    console.warn(
      "Uplisting returned a rotated refresh_token — update UPLISTING_OAUTH_REFRESH_TOKEN, the old one may stop working."
    );
  }

  return cachedAccessToken.token;
}

async function uplistingOAuthGet(path: string, params: Record<string, string>): Promise<unknown> {
  const token = await fetchAccessToken();
  const url = new URL(path, API_BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting request to ${path} failed (${res.status}): ${detail}`);
  }

  return res.json();
}

async function uplistingOAuthPost(path: string, body: unknown): Promise<unknown> {
  const token = await fetchAccessToken();
  const res = await fetch(new URL(path, API_BASE_URL).toString(), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting request to ${path} failed (${res.status}): ${detail}`);
  }

  return res.json();
}

export type StayQuote = {
  currency: string;
  numberOfNights: number;
  accommodationTotal: number;
  cleaningFee: number;
  total: number;
  hasPromotions: boolean;
  promotionCodeInvalid: boolean;
};

// Test-only stand-in for a real property_id, used only when
// UPLISTING_MOCK_QUOTES is on and a property hasn't had its real Uplisting
// property ID set in Sanity yet — lets the /book page and checkout-session
// route be exercised without CMS changes.
const MOCK_PROPERTY_ID = -1;

export function resolveUplistingPropertyId(propertyId: number | null | undefined): number | null {
  if (propertyId) return propertyId;
  return process.env.UPLISTING_MOCK_QUOTES === "true" ? MOCK_PROPERTY_ID : null;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

// Stand-in for /quotes while Uplisting OAuth isn't set up yet, so the Stripe
// embedded-checkout UI can be exercised end to end with test card numbers.
// Opt-in only (UPLISTING_MOCK_QUOTES=true) so a misconfigured OAuth setup
// never silently starts charging made-up amounts — this must never be true
// outside local dev.
function mockStayQuote(checkIn: string, checkOut: string): StayQuote {
  const nights = nightsBetween(checkIn, checkOut);
  const nightlyRate = 120;
  const cleaningFee = 45;
  console.warn(
    `[uplistingApi] UPLISTING_MOCK_QUOTES is on — returning a fake £${nightlyRate}/night quote instead of calling Uplisting. Do not enable this outside local dev.`
  );
  return {
    currency: "GBP",
    numberOfNights: nights,
    accommodationTotal: nights * nightlyRate,
    cleaningFee,
    total: nights * nightlyRate + cleaningFee,
    hasPromotions: false,
    promotionCodeInvalid: false,
  };
}

// GET /quotes — the only Uplisting endpoint that returns a real, date-aware
// price (nightly rate * length of stay, plus fees). Everything the embedded
// checkout charges must come from here, never from a client-supplied amount.
export async function getStayQuote({
  propertyId,
  checkIn,
  checkOut,
  numberOfGuests,
  promotionCode,
}: {
  propertyId: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  numberOfGuests: number;
  promotionCode?: string;
}): Promise<StayQuote> {
  if (process.env.UPLISTING_MOCK_QUOTES === "true") {
    return mockStayQuote(checkIn, checkOut);
  }

  const params: Record<string, string> = {
    property_id: String(propertyId),
    check_in: checkIn,
    check_out: checkOut,
    number_of_guests: String(numberOfGuests),
  };
  if (promotionCode) params.promotion_code = promotionCode;

  const body = (await uplistingOAuthGet("/quotes", params)) as {
    data?: {
      attributes?: {
        currency?: string;
        number_of_nights?: number;
        accommodation_total?: number;
        cleaning_fee?: number;
        total?: number;
        has_promotions?: boolean;
        promotion_code_invalid?: boolean;
      };
    };
  };

  const attrs = body.data?.attributes;
  if (!attrs || typeof attrs.total !== "number") {
    throw new Error("Uplisting quote response was missing pricing attributes");
  }

  return {
    currency: attrs.currency ?? "GBP",
    numberOfNights: attrs.number_of_nights ?? 0,
    accommodationTotal: attrs.accommodation_total ?? 0,
    cleaningFee: attrs.cleaning_fee ?? 0,
    total: attrs.total,
    hasPromotions: attrs.has_promotions ?? false,
    promotionCodeInvalid: attrs.promotion_code_invalid ?? false,
  };
}

// POST /bookings — called from the Stripe webhook once payment succeeds, to
// turn a paid Checkout Session into a confirmed reservation in Uplisting.
export async function createUplistingBooking({
  propertyId,
  checkIn,
  checkOut,
  numberOfGuests,
  guestName,
  guestEmail,
  guestPhone,
}: {
  propertyId: number;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}): Promise<{ bookingId: string }> {
  const body = (await uplistingOAuthPost("/bookings", {
    data: {
      attributes: {
        check_in: checkIn,
        check_out: checkOut,
        number_of_guests: numberOfGuests,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
      },
      relationships: {
        property: { data: { type: "properties", id: String(propertyId) } },
      },
    },
  })) as { data?: { id?: string } };

  if (!body.data?.id) {
    throw new Error("Uplisting booking response was missing an id");
  }

  return { bookingId: body.data.id };
}
