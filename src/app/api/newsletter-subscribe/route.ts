import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead } from "@/lib/leads";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  return saveLead({
    table: "newsletter_subscribers",
    email,
    mode: "upsert",
    // Signing up again after unsubscribing flips them back to subscribed.
    row: { status: "subscribed" },
    onCreate: { source: "website" },
    mailerlite: { groupId: process.env.MAILERLITE_NEWSLETTER_GROUP_ID },
  });
}
