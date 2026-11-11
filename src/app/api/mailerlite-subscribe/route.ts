import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead } from "@/lib/leads";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, mobile, situation, propertyDescription, howHeard, consent } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof mobile !== "string" || !mobile.trim()) {
    return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
  }
  if (consent !== true) {
    return NextResponse.json({ error: "You must agree to the Privacy Policy to continue" }, { status: 400 });
  }

  return saveLead({
    table: "landlord_leads",
    email,
    mode: "upsert",
    row: {
      name,
      phone: mobile,
      landlord_situation: situation,
      property_description: propertyDescription,
      how_heard: howHeard,
      consent: true,
      consent_at: new Date().toISOString(),
    },
    onCreate: { source: "sos_form" },
    mailerlite: {
      fields: {
        name,
        phone: mobile,
        landlord_situation: situation,
        property_description: propertyDescription,
        how_heard: howHeard,
      },
      groupId: process.env.MAILERLITE_LANDLORD_GROUP_ID,
    },
  });
}
