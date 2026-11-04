import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead } from "@/lib/leads";

// Builds a human-readable duration string ("2026-03-01 to 2026-06-01") from
// the two date-picker fields, so the existing "duration" column/MailerLite
// field (previously free text like "about 8 weeks") keeps carrying a useful
// value instead of being dropped now the form collects real dates.
function formatDuration(startDate: unknown, endDate: unknown): string | undefined {
  const start = typeof startDate === "string" ? startDate.trim() : "";
  const end = typeof endDate === "string" ? endDate.trim() : "";
  if (!start && !end) return undefined;
  return `${start || "?"} to ${end || "?"}`;
}

// MailerLite's account only has custom fields for the original field set
// (location_needed, number_of_workers, duration, message) — rather than
// creating five more custom fields sight unseen, every new preference this
// Typeform-style flow collects is folded into a readable block appended to
// the "message" field. Supabase's corporate_leads table gets its own real
// columns for all of it (see migration add_corporate_leads_typeform_fields).
function buildMailerliteNotes({
  locationPreference,
  roomPreference,
  schedulePreference,
  otherRequirements,
  howHeard,
  message,
}: {
  locationPreference?: string;
  roomPreference?: string;
  schedulePreference?: string;
  otherRequirements?: string[];
  howHeard?: string;
  message?: string;
}): string {
  const lines = [
    locationPreference && `Location preference: ${locationPreference}`,
    roomPreference && `Room preference: ${roomPreference}`,
    schedulePreference && `Schedule preference: ${schedulePreference}`,
    otherRequirements?.length ? `Other requirements: ${otherRequirements.join(", ")}` : undefined,
    howHeard && `How they heard about us: ${howHeard}`,
  ].filter((line): line is string => Boolean(line));

  return [...lines, message?.trim() ? `\n${message.trim()}` : undefined].filter(Boolean).join("\n");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    company,
    email,
    phone,
    location,
    locationPreference,
    workers,
    roomPreference,
    startDate,
    endDate,
    schedulePreference,
    otherRequirements,
    message,
    howHeard,
  } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }
  if (typeof company !== "string" || !company.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const cleanOtherRequirements: string[] = Array.isArray(otherRequirements)
    ? otherRequirements.filter((v): v is string => typeof v === "string")
    : [];
  const duration = formatDuration(startDate, endDate);
  const notes = buildMailerliteNotes({
    locationPreference,
    roomPreference,
    schedulePreference,
    otherRequirements: cleanOtherRequirements,
    howHeard,
    message,
  });

  return saveLead({
    table: "corporate_leads",
    email,
    mode: "upsert",
    row: {
      name,
      company,
      phone,
      location_needed: location,
      location_preference: locationPreference,
      number_of_workers: workers,
      room_preference: roomPreference,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      duration,
      schedule_preference: schedulePreference,
      other_requirements: cleanOtherRequirements.join(", "),
      how_heard: howHeard,
      message,
    },
    mailerlite: {
      fields: {
        name,
        company,
        phone,
        location_needed: location,
        number_of_workers: workers,
        duration,
        message: notes,
      },
      groupId: process.env.MAILERLITE_CORPORATE_GROUP_ID,
    },
  });
}
