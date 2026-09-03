const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type StayParams = {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  promotionCode?: string;
  /**
   * Overrides the property's Sanity-derived uplistingPropertyId — needed
   * when booking a specific room of a multi-room property (see
   * RoomBookingBar), since Sanity's propertyPage.uplistingPropertyId is a
   * single field and can't represent "book room 267358 of property X".
   */
  propertyId?: number;
};

export type StayParamsResult = { ok: true; data: StayParams } | { ok: false; error: string };

// Shared by /api/checkout/quote and /api/checkout/session — both need the
// same slug/dates/guests shape validated before touching Uplisting.
export function validateStayParams(body: unknown): StayParamsResult {
  const { slug, checkIn, checkOut, guests, promotionCode, propertyId } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof slug !== "string" || !slug) {
    return { ok: false, error: "slug is required" };
  }
  if (typeof checkIn !== "string" || !DATE_PATTERN.test(checkIn)) {
    return { ok: false, error: "checkIn must be YYYY-MM-DD" };
  }
  if (typeof checkOut !== "string" || !DATE_PATTERN.test(checkOut)) {
    return { ok: false, error: "checkOut must be YYYY-MM-DD" };
  }
  if (checkOut <= checkIn) {
    return { ok: false, error: "checkOut must be after checkIn" };
  }
  const numberOfGuests = Number(guests);
  if (!Number.isInteger(numberOfGuests) || numberOfGuests < 1) {
    return { ok: false, error: "guests must be a positive integer" };
  }
  let parsedPropertyId: number | undefined;
  if (propertyId !== undefined && propertyId !== null && propertyId !== "") {
    const parsed = Number(propertyId);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return { ok: false, error: "propertyId must be a positive integer" };
    }
    parsedPropertyId = parsed;
  }

  return {
    ok: true,
    data: {
      slug,
      checkIn,
      checkOut,
      guests: numberOfGuests,
      promotionCode: typeof promotionCode === "string" && promotionCode ? promotionCode : undefined,
      propertyId: parsedPropertyId,
    },
  };
}

export type GuestDetails = { guestName: string; guestEmail: string; guestPhone?: string };
export type GuestDetailsResult = { ok: true; data: GuestDetails } | { ok: false; error: string };

export function validateGuestDetails(body: unknown): GuestDetailsResult {
  const { guestName, guestEmail, guestPhone } = (body ?? {}) as Record<string, unknown>;

  if (typeof guestName !== "string" || !guestName.trim()) {
    return { ok: false, error: "guestName is required" };
  }
  if (typeof guestEmail !== "string" || !EMAIL_PATTERN.test(guestEmail.trim())) {
    return { ok: false, error: "A valid guestEmail is required" };
  }

  return {
    ok: true,
    data: {
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: typeof guestPhone === "string" && guestPhone.trim() ? guestPhone.trim() : undefined,
    },
  };
}
