import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead, toNumber } from "@/lib/leads";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    phone,
    marketingConsent,
    area,
    bedrooms,
    platforms,
    occupancy,
    adr,
    currentRevenue,
    hoursPerWeek,
    biggestChallenge,
    estimatedPotential,
    estimatedUplift,
    upliftPercent,
  } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  return saveLead({
    table: "landlord_leads",
    email,
    mode: "upsert",
    row: {
      name,
      phone,
      area,
      bedrooms,
      platforms,
      occupancy,
      adr,
      current_revenue: toNumber(currentRevenue),
      hours_per_week: toNumber(hoursPerWeek),
      biggest_challenge: biggestChallenge,
      estimated_potential: toNumber(estimatedPotential),
      estimated_uplift: toNumber(estimatedUplift),
      uplift_percent: toNumber(upliftPercent),
      // Latest answer wins; the timestamp records when consent was last given.
      marketing_consent: typeof marketingConsent === "boolean" ? marketingConsent : undefined,
      marketing_consent_at: marketingConsent === true ? new Date().toISOString() : undefined,
    },
    onCreate: { source: "estimate_calculator" },
    mailerlite: {
      fields: {
        name,
        phone,
        marketing_consent: marketingConsent === undefined ? undefined : String(marketingConsent),
        area,
        bedrooms,
        platforms,
        occupancy,
        adr,
        current_revenue: currentRevenue,
        hours_per_week: hoursPerWeek,
        biggest_challenge: biggestChallenge,
        estimated_potential: estimatedPotential,
        estimated_uplift: estimatedUplift,
        uplift_percent: upliftPercent,
      },
      groupId: process.env.MAILERLITE_CALCULATOR_GROUP_ID,
    },
  });
}
