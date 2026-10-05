import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead } from "@/lib/leads";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, mobile, situation, propertyDescription } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof mobile !== "string" || !mobile.trim()) {
    return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
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
    },
    onCreate: { source: "sos_form" },
    mailerlite: {
      fields: {
        name,
        phone: mobile,
        landlord_situation: situation,
        property_description: propertyDescription,
      },
      groupId: process.env.MAILERLITE_LANDLORD_GROUP_ID,
    },
  });
}
