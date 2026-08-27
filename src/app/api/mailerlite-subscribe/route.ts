import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, subscribeToMailerLite } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, mobile, situation, propertyDescription } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  return subscribeToMailerLite({
    email,
    fields: {
      name,
      phone: mobile,
      landlord_situation: situation,
      property_description: propertyDescription,
    },
    groupId: process.env.MAILERLITE_LANDLORD_GROUP_ID,
  });
}
