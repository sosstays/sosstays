// Uplisting V3 (OAuth) API client — used for live price quotes and booking
// creation on the on-site embedded checkout (/stays/[slug]/book). This is a
// separate auth surface from UPLISTING_API_KEY, which is unrelated legacy
// key-based access.
//
// Endpoints and shapes come from "Uplisting API [Public].postman_collection.json"
// > OAuth API.

const AUTH_BASE_URL = "https://auth.airdna.co";
const API_BASE_URL = "https://connect.uplisting.io";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number; // seconds
  scope?: string;
};

// Cached in-memory per server instance — cold starts just refresh again.
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function fetchAccessToken(): Promise<string> {
  const clientId = process.env.UPLISTING_OAUTH_CLIENT_ID;
  const clientSecret = process.env.UPLISTING_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.UPLISTING_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Uplisting OAuth is not configured (missing client id/secret/refresh token)");
  }

  const res = await fetch(`${AUTH_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting token refresh failed: ${res.status} ${detail}`);
  }

  const data: TokenResponse = await res.json();

  // Uplisting may rotate the refresh token on each use. We only have the
  // original one available via env var (no database to persist a new one
  // to), so surface a loud warning if it changed — otherwise the next cold
  // start silently starts refreshing with a stale token and breaks.
  if (data.refresh_token && data.refresh_token !== refreshToken) {
    console.warn(
      "Uplisting returned a new refresh_token that differs from UPLISTING_OAUTH_REFRESH_TOKEN. " +
        "Update the env var, or subsequent token refreshes may start failing.",
    );
  }

  cachedToken = {
    accessToken: data.access_token,
    // Refresh a minute early to avoid racing expiry mid-request.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.accessToken;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }
  return fetchAccessToken();
}

async function uplistingFetch(path: string, init?: RequestInit): Promise<Response> {
  const accessToken = await getAccessToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

export type Quote = {
  propertyId: number;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  numberOfGuests: number;
  currency: string;
  averagePricePerNight: number;
  cleaningFee: number;
  accommodationTotal: number;
  total: number;
  promotionCodeInvalid: boolean;
};

export class UplistingQuoteError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "UplistingQuoteError";
  }
}

function mockQuote({
  propertyId,
  checkIn,
  checkOut,
  numberOfGuests,
}: {
  propertyId: number;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
}): Quote {
  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)),
  );
  const nightlyRate = 120;
  const cleaningFee = 45;
  const accommodationTotal = nightlyRate * nights;
  return {
    propertyId,
    checkIn,
    checkOut,
    numberOfNights: nights,
    numberOfGuests,
    currency: "GBP",
    averagePricePerNight: nightlyRate,
    cleaningFee,
    accommodationTotal,
    total: accommodationTotal + cleaningFee,
    promotionCodeInvalid: false,
  };
}

export async function getQuote({
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
}): Promise<Quote> {
  if (process.env.UPLISTING_MOCK_QUOTES === "true") {
    return mockQuote({ propertyId, checkIn, checkOut, numberOfGuests });
  }

  const params = new URLSearchParams({
    property_id: String(propertyId),
    check_in: checkIn,
    check_out: checkOut,
    number_of_guests: String(numberOfGuests),
  });
  if (promotionCode) params.set("promotion_code", promotionCode);

  const res = await uplistingFetch(`/quotes?${params.toString()}`);
  if (!res.ok) {
    const detail = await res.text();
    throw new UplistingQuoteError(`Uplisting quote request failed: ${detail}`, res.status);
  }

  const { data } = await res.json();
  const attrs = data.attributes;
  return {
    propertyId: attrs.property_id,
    checkIn: attrs.check_in,
    checkOut: attrs.check_out,
    numberOfNights: attrs.number_of_nights,
    numberOfGuests: attrs.number_of_guests,
    currency: attrs.currency,
    averagePricePerNight: attrs.average_price_per_night,
    cleaningFee: attrs.cleaning_fee,
    accommodationTotal: attrs.accommodation_total,
    total: attrs.total,
    promotionCodeInvalid: attrs.promotion_code_invalid,
  };
}

export type CreateBookingParams = {
  propertyId: number;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
};

export async function createBooking(params: CreateBookingParams): Promise<{ id: string }> {
  const res = await uplistingFetch("/bookings", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          check_in: params.checkIn,
          check_out: params.checkOut,
          guest_name: params.guestName,
          guest_email: params.guestEmail,
          guest_phone: params.guestPhone,
          number_of_guests: params.numberOfGuests,
          status: "confirmed",
        },
        relationships: {
          property: { data: { id: params.propertyId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Uplisting booking creation failed: ${res.status} ${detail}`);
  }

  const { data } = await res.json();
  return { id: data.id };
}
