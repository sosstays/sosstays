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

export type MailerLiteResult =
  | { ok: true; subscriberId: string | null }
  | { ok: false; status: number; error: string; detail?: string };

// Forwards a form's fields to a MailerLite group. Doesn't build an HTTP
// response itself — saveLead (lib/leads.ts) decides what the visitor sees
// once it knows whether the Supabase save worked too.
export async function subscribeToMailerLite({
  email,
  fields,
  groupId,
}: {
  email: string;
  fields?: Record<string, unknown>;
  groupId?: string;
}): Promise<MailerLiteResult> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 500, error: "MailerLite is not configured" };
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
      return { ok: false, status: res.status, error: "MailerLite request failed", detail };
    }

    const body = (await res.json().catch(() => null)) as { data?: { id?: string | number } } | null;
    const id = body?.data?.id;
    return { ok: true, subscriberId: id != null ? String(id) : null };
  } catch {
    return { ok: false, status: 502, error: "MailerLite request failed" };
  }
}
