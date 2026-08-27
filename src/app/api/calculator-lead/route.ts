import { NextRequest, NextResponse } from "next/server";

const MAILERLITE_API_URL = "https://connect.mailerlite.com/api/subscribers";

export async function POST(request: NextRequest) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "MailerLite is not configured" }, { status: 500 });
  }

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

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const groupId = process.env.MAILERLITE_CALCULATOR_GROUP_ID;

  const res = await fetch(MAILERLITE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email,
      fields: {
        name: name || undefined,
        area: area || undefined,
        bedrooms: bedrooms || undefined,
        platforms: platforms || undefined,
        occupancy: occupancy || undefined,
        adr: adr || undefined,
        current_revenue: currentRevenue || undefined,
        hours_per_week: hoursPerWeek || undefined,
        biggest_challenge: biggestChallenge || undefined,
        estimated_potential: estimatedPotential ?? undefined,
        estimated_uplift: estimatedUplift ?? undefined,
        uplift_percent: upliftPercent ?? undefined,
      },
      groups: groupId ? [groupId] : undefined,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "MailerLite request failed", detail },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true });
}
