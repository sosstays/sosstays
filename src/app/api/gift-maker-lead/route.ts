import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead } from "@/lib/leads";

const BILLING_TYPES = ["business", "personal"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    phone,
    billingType,
    recipientType,
    quantity,
    budget,
    format,
    delivery,
    packageLabel,
    packageItems,
    packageTotal,
    consent,
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
  if (typeof billingType !== "string" || !BILLING_TYPES.includes(billingType)) {
    return NextResponse.json({ error: "Pick business or personal billing" }, { status: 400 });
  }
  if (consent !== true) {
    return NextResponse.json({ error: "You must agree to the Privacy Policy to continue" }, { status: 400 });
  }

  return saveLead({
    table: "gift_maker_leads",
    email,
    // Every quote request is its own row, even from a returning email —
    // same reasoning as contact_queries (shop/contact-subscribe route).
    mode: "insert",
    row: {
      name,
      phone,
      billing_type: billingType,
      recipient_type: typeof recipientType === "string" ? recipientType : undefined,
      quantity: typeof quantity === "string" || typeof quantity === "number" ? String(quantity) : undefined,
      budget_per_gift: typeof budget === "number" ? budget : undefined,
      format: typeof format === "string" ? format : undefined,
      delivery_method: typeof delivery === "string" ? delivery : undefined,
      package_label: typeof packageLabel === "string" ? packageLabel : undefined,
      package_items: typeof packageItems === "string" ? packageItems : undefined,
      package_total: typeof packageTotal === "number" ? packageTotal : undefined,
      consent: true,
      consent_at: new Date().toISOString(),
    },
    mailerlite: {
      fields: {
        name,
        phone,
        billing_type: billingType,
        recipient_type: recipientType,
        quantity,
        budget_per_gift: budget,
        format,
        delivery_method: delivery,
        package_label: packageLabel,
        package_items: packageItems,
      },
      groupId: process.env.MAILERLITE_GIFT_MAKER_GROUP_ID,
    },
  });
}
