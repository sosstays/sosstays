import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead } from "@/lib/leads";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    phone,
    idealMonth,
    eventType,
    groupSize,
    accommodationPreference,
    interests,
    baseOrRoute,
    notes,
    howHeard,
    consent,
  } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof idealMonth !== "string" || !idealMonth.trim()) {
    return NextResponse.json({ error: "Ideal month is required" }, { status: 400 });
  }
  const cleanEventTypes: string[] = Array.isArray(eventType)
    ? eventType.filter((v): v is string => typeof v === "string")
    : [];
  if (cleanEventTypes.length === 0) {
    return NextResponse.json({ error: "Let us know if you're coming for an event" }, { status: 400 });
  }
  if (typeof groupSize !== "string" || !groupSize.trim()) {
    return NextResponse.json({ error: "Group size is required" }, { status: 400 });
  }
  if (typeof accommodationPreference !== "string" || !accommodationPreference.trim()) {
    return NextResponse.json({ error: "Accommodation preference is required" }, { status: 400 });
  }
  if (consent !== true) {
    return NextResponse.json({ error: "You must agree to the Privacy Policy to continue" }, { status: 400 });
  }

  const cleanInterests: string[] = Array.isArray(interests)
    ? interests.filter((v): v is string => typeof v === "string")
    : [];

  return saveLead({
    table: "bespoke_trip_leads",
    email,
    mode: "upsert",
    row: {
      name,
      phone,
      ideal_month: idealMonth,
      event_type: cleanEventTypes.join(", "),
      group_size: groupSize,
      accommodation_preference: accommodationPreference,
      interests: cleanInterests.join(", "),
      base_or_route: baseOrRoute,
      notes,
      how_heard: howHeard,
      consent: true,
      consent_at: new Date().toISOString(),
    },
    onCreate: { source: "bespoke_ireland_trip_form" },
    mailerlite: {
      fields: {
        name,
        phone,
        ideal_month: idealMonth,
        event_type: cleanEventTypes.join(", "),
        group_size: groupSize,
        accommodation_preference: accommodationPreference,
        interests: cleanInterests.join(", "),
        base_or_route: baseOrRoute,
        message: notes,
        how_heard: howHeard,
      },
      groupId: process.env.MAILERLITE_BESPOKE_TRIP_GROUP_ID,
    },
  });
}
