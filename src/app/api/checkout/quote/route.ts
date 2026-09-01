import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { PROPERTY_BOOKING_QUERY } from "@/sanity/queries";
import { getStayQuote } from "@/lib/uplistingApi";
import { validateStayParams } from "@/lib/bookingValidation";

// Resolves a property slug + stay dates to a real, Uplisting-quoted price.
// This is the only source of truth the /stays/[slug]/book page and the
// checkout-session route are allowed to charge from.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = validateStayParams(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { slug, checkIn, checkOut, guests, promotionCode } = parsed.data;

  const property = await client.fetch(PROPERTY_BOOKING_QUERY, { slug });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }
  if (!property.uplistingPropertyId) {
    return NextResponse.json(
      { error: "This property isn't set up for on-site checkout yet" },
      { status: 409 }
    );
  }

  try {
    const quote = await getStayQuote({
      propertyId: property.uplistingPropertyId,
      checkIn,
      checkOut,
      numberOfGuests: guests,
      promotionCode,
    });

    return NextResponse.json({
      property: { name: property.name, slug: property.slug },
      quote,
    });
  } catch (error) {
    console.error("Uplisting quote request failed", error);
    return NextResponse.json({ error: "Could not fetch a price quote" }, { status: 502 });
  }
}
