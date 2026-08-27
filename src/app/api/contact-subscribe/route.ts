import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, subscribeToMailerLite } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, topic, property, message } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  return subscribeToMailerLite({
    email,
    fields: {
      name,
      topic,
      property_listing: property,
      message,
    },
    groupId: process.env.MAILERLITE_CONTACT_GROUP_ID,
  });
}
