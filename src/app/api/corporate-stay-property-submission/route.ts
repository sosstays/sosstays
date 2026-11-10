import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { toNumber } from "@/lib/leads";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Owner self-submission into the corporate/monthly-stay sourcing pipeline —
// a separate pool from the regular Sos Stays "list your property with us"
// management onboarding. Writes straight to corporate_stay_properties (no
// MailerLite sync: this isn't a marketing lead, it's a property record the
// team reviews and prices). New rows always land as submission_status
// "pending_review" so nothing self-submitted reaches the public carousel
// unvetted — a team member flips it to "approved" (and logs a price) from
// the admin dashboard.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    propertyName,
    area,
    county,
    listingUrl,
    maxGuestsStandard,
    maxGuestsExtended,
    bedrooms,
    bedsTotal,
    bathrooms,
    bedroomBreakdown,
    amenities,
    description,
    photosUrl,
    ownerName,
    ownerPhone,
    ownerEmail,
    publicListingConsent,
    notes,
    occupancyGuests,
    ownerQuoteEur,
    consent,
  } = body ?? {};

  if (typeof propertyName !== "string" || !propertyName.trim()) {
    return NextResponse.json({ error: "Property name is required" }, { status: 400 });
  }
  if (typeof ownerName !== "string" || !ownerName.trim()) {
    return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  }
  if (typeof ownerPhone !== "string" || !ownerPhone.trim()) {
    return NextResponse.json({ error: "A phone number is required" }, { status: 400 });
  }
  if (!isValidEmail(ownerEmail)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!["yes", "no"].includes(publicListingConsent)) {
    return NextResponse.json(
      { error: "Please say whether this property can be shown publicly" },
      { status: 400 }
    );
  }
  if (consent !== true) {
    return NextResponse.json({ error: "You must agree to the Privacy Policy to continue" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Submissions aren't available right now" }, { status: 500 });
  }

  const { data: property, error: propertyError } = await supabase
    .from("corporate_stay_properties")
    .insert({
      property_name: propertyName.trim(),
      area: typeof area === "string" ? area.trim() || null : null,
      county: typeof county === "string" ? county.trim() || null : null,
      listing_url: typeof listingUrl === "string" ? listingUrl.trim() || null : null,
      max_guests_standard: toNumber(maxGuestsStandard) ?? null,
      max_guests_extended: toNumber(maxGuestsExtended) ?? null,
      bedrooms: toNumber(bedrooms) ?? null,
      beds_total: toNumber(bedsTotal) ?? null,
      bathrooms: toNumber(bathrooms) ?? null,
      // bedroom_breakdown is jsonb; the public form only collects free text
      // for now (no per-bedroom builder yet), stored as a plain JSON string.
      bedroom_breakdown:
        typeof bedroomBreakdown === "string" && bedroomBreakdown.trim()
          ? bedroomBreakdown.trim()
          : null,
      amenities: typeof amenities === "string" ? amenities.trim() || null : null,
      description: typeof description === "string" ? description.trim() || null : null,
      photos_url: typeof photosUrl === "string" ? photosUrl.trim() || null : null,
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.trim(),
      owner_email: ownerEmail.trim(),
      public_listing_consent: publicListingConsent,
      notes: typeof notes === "string" ? notes.trim() || null : null,
      submission_status: "pending_review",
      captured_by: "Form submission",
    })
    .select("id")
    .single();

  if (propertyError || !property) {
    console.error("corporate_stay_properties insert failed", propertyError);
    return NextResponse.json({ error: "That didn't go through — please try again" }, { status: 500 });
  }

  // The owner's own estimate becomes the property's first quote row, so the
  // carousel always has a number to show rather than leaving it blank until
  // someone manually logs one. Optional: a submission with no price still
  // saves fine and the carousel shows "Price on request" instead.
  const quoteAmount = toNumber(ownerQuoteEur);
  if (quoteAmount) {
    const { error: quoteError } = await supabase.from("corporate_stay_quotes").insert({
      property_id: property.id,
      occupancy_guests: typeof occupancyGuests === "string" ? occupancyGuests.trim() || null : null,
      owner_quote_eur: quoteAmount,
      status: "quoted",
      source_contact: "Owner-submitted estimate (public form)",
      notes:
        "Estimate submitted by the owner at listing time, pending team confirmation against a real client and dates.",
      captured_by: "Form submission",
    });
    if (quoteError) {
      // Don't fail the whole submission over the optional price estimate —
      // the property itself is saved either way, and the team can add a
      // quote manually from the admin dashboard.
      console.error("corporate_stay_quotes insert failed", quoteError);
    }
  }

  return NextResponse.json({ ok: true });
}
