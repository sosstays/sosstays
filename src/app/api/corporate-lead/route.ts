import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead } from "@/lib/leads";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, company, email, phone, location, workers, duration, message } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  return saveLead({
    table: "corporate_leads",
    email,
    mode: "upsert",
    row: {
      name,
      company,
      phone,
      location_needed: location,
      number_of_workers: workers,
      duration,
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
        message,
      },
      groupId: process.env.MAILERLITE_CORPORATE_GROUP_ID,
    },
  });
}
