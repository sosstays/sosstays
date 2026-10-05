import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/mailerlite";
import { saveLead } from "@/lib/leads";

// Must match the CHECK constraint on contact_queries.topic (and the form's dropdown).
const TOPICS = ["Media query", "About a booking", "Hiring", "Partnership", "Other"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, topic, property, message } = body ?? {};

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  return saveLead({
    table: "contact_queries",
    email,
    // Every message is its own query, even from the same email.
    mode: "insert",
    row: {
      name,
      topic: typeof topic === "string" && TOPICS.includes(topic) ? topic : undefined,
      property_name: property,
      message,
    },
    mailerlite: {
      fields: {
        name,
        topic,
        property_listing: property,
        message,
      },
      groupId: process.env.MAILERLITE_CONTACT_GROUP_ID,
    },
  });
}
