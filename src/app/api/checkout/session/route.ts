import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { PROPERTY_BOOKING_QUERY } from "@/sanity/queries";
import { getStayQuote, resolveUplistingPropertyId } from "@/lib/uplistingApi";
import { validateStayParams, validateGuestDetails } from "@/lib/bookingValidation";
import { stripe, isStripeConfigured } from "@/lib/stripe";

// Creates the embedded Stripe Checkout Session the /book page mounts. The
// amount charged always comes from a fresh Uplisting quote fetched here —
// never from anything the client sent — so a tampered request can't change
// the price.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const stayParams = validateStayParams(body);
  if (!stayParams.ok) {
    return NextResponse.json({ error: stayParams.error }, { status: 400 });
  }
  const guestDetails = validateGuestDetails(body);
  if (!guestDetails.ok) {
    return NextResponse.json({ error: guestDetails.error }, { status: 400 });
  }
  const { slug, checkIn, checkOut, guests, promotionCode } = stayParams.data;
  const { guestName, guestEmail, guestPhone } = guestDetails.data;

  const property = await client.fetch(PROPERTY_BOOKING_QUERY, { slug });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }
  const uplistingPropertyId = resolveUplistingPropertyId(property.uplistingPropertyId);
  if (!uplistingPropertyId) {
    return NextResponse.json(
      { error: "This property isn't set up for on-site checkout yet" },
      { status: 409 }
    );
  }

  let quote;
  try {
    quote = await getStayQuote({
      propertyId: uplistingPropertyId,
      checkIn,
      checkOut,
      numberOfGuests: guests,
      promotionCode,
    });
  } catch (error) {
    console.error("Uplisting quote request failed", error);
    return NextResponse.json({ error: "Could not fetch a price quote" }, { status: 502 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      customer_email: guestEmail,
      // Matches the site's palette/type/radius as closely as embedded
      // Checkout's server-side branding controls allow — there's no
      // client-side Appearance API for ui_mode: embedded_page, neither
      // `logo` nor `icon` are permitted for embedded (hosted-page only —
      // confirmed against the live API), and font_family only accepts a
      // fixed enum (no Poppins), so "montserrat" is the closest
      // geometric-sans match on offer.
      branding_settings: {
        background_color: "#FFFEF2",
        border_style: "rounded",
        button_color: "#4A5D48",
        font_family: "montserrat",
      },
      line_items: [
        {
          price_data: {
            currency: quote.currency.toLowerCase(),
            product_data: {
              name: `${property.name} — ${quote.numberOfNights} night${quote.numberOfNights === 1 ? "" : "s"}`,
              description: `${checkIn} to ${checkOut}, ${guests} guest${guests === 1 ? "" : "s"}`,
            },
            unit_amount: Math.round(quote.total * 100),
          },
          quantity: 1,
        },
      ],
      return_url: `${request.nextUrl.origin}/stays/${slug}/book/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        propertySlug: slug,
        uplistingPropertyId: String(uplistingPropertyId),
        checkIn,
        checkOut,
        guests: String(guests),
        guestName,
        guestEmail,
        guestPhone: guestPhone ?? "",
      },
    });
  } catch (error) {
    console.error("Stripe session creation failed", error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }

  return NextResponse.json({ clientSecret: session.client_secret });
}
