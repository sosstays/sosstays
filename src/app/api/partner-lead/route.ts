import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, subscribeToMailerLite } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { businessName, contactName, email, phone, website, category, about, location, referral } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof businessName !== "string" || !businessName.trim()) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }
  if (typeof contactName !== "string" || !contactName.trim()) {
    return NextResponse.json({ error: "Contact name is required" }, { status: 400 });
  }

  return subscribeToMailerLite({
    email,
    fields: {
      business_name: businessName,
      name: contactName,
      phone,
      website,
      category,
      about_business: about,
      location,
      referral,
    },
    groupId: process.env.MAILERLITE_PARTNER_GROUP_ID,
  });
}
