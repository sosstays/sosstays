import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, subscribeToMailerLite } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, company, email, phone, location, workers, duration, message } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  return subscribeToMailerLite({
    email,
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
  });
}
