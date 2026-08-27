import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, subscribeToMailerLite } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  return subscribeToMailerLite({
    email,
    groupId: process.env.MAILERLITE_NEWSLETTER_GROUP_ID,
  });
}
