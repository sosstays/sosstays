import { NextRequest, NextResponse } from "next/server";

const MAILERLITE_API_URL = "https://connect.mailerlite.com/api/subscribers";

export async function POST(request: NextRequest) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "MailerLite is not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { email } = body ?? {};

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const groupId = process.env.MAILERLITE_NEWSLETTER_GROUP_ID;

  const res = await fetch(MAILERLITE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email,
      groups: groupId ? [groupId] : undefined,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "MailerLite request failed", detail },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true });
}
