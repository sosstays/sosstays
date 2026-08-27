import { NextResponse } from "next/server";

const MAILERLITE_API_URL = "https://connect.mailerlite.com/api/subscribers";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 2000;

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.trim().length <= MAX_FIELD_LENGTH && EMAIL_PATTERN.test(email.trim());
}

function cleanFieldValue(value: unknown): string | undefined {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_FIELD_LENGTH) : undefined;
}

// Shared by the four /api/*-subscribe and /api/calculator-lead routes —
// each just forwards a form's fields to a MailerLite group.
export async function subscribeToMailerLite({
  email,
  fields,
  groupId,
}: {
  email: string;
  fields?: Record<string, unknown>;
  groupId?: string;
}): Promise<NextResponse> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "MailerLite is not configured" }, { status: 500 });
  }

  const cleanedFields: Record<string, string> = {};
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      const clean = cleanFieldValue(value);
      if (clean !== undefined) cleanedFields[key] = clean;
    }
  }

  try {
    const res = await fetch(MAILERLITE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: email.trim(),
        fields: Object.keys(cleanedFields).length ? cleanedFields : undefined,
        groups: groupId ? [groupId] : undefined,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: "MailerLite request failed", detail }, { status: res.status });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "MailerLite request failed" }, { status: 502 });
  }
}
