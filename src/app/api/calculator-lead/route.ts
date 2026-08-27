import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, subscribeToMailerLite } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
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

  return subscribeToMailerLite({
    email,
    fields: {
      name,
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
  });
}
