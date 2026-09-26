const TWILIO_API_URL = "https://api.twilio.com/2010-04-01";
const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/; // E.164, e.g. +353871234567 or +447911123456

export function isValidPhone(phone: unknown): phone is string {
  return typeof phone === "string" && PHONE_PATTERN.test(phone.trim());
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

export const isTwilioConfigured = Boolean(accountSid && authToken && messagingServiceSid);

type SendSmsResult = { ok: true; sid: string } | { ok: false; error: string; detail?: string };

// Sends a one-way SMS via a Twilio Messaging Service (not a bare phone number),
// so the Sender Pool can carry the "SOSStays" alphanumeric sender ID for
// supported destinations (UK/IE) and fall back to a Twilio number automatically
// anywhere alphanumeric senders aren't allowed. Requires TWILIO_MESSAGING_SERVICE_SID
// to be set — see the comment above it in .env.local for how to create one.
export async function sendSms({ to, body }: { to: string; body: string }): Promise<SendSmsResult> {
  if (!isTwilioConfigured) {
    return { ok: false, error: "Twilio is not configured" };
  }
  if (!isValidPhone(to)) {
    return { ok: false, error: "Invalid destination phone number (expected E.164, e.g. +3538712345678)" };
  }

  const params = new URLSearchParams({
    To: to.trim(),
    MessagingServiceSid: messagingServiceSid!,
    Body: body,
  });

  try {
    const res = await fetch(`${TWILIO_API_URL}/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
      body: params,
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: "Twilio request failed", detail: data?.message ?? JSON.stringify(data) };
    }
    return { ok: true, sid: data.sid };
  } catch (error) {
    return { ok: false, error: "Twilio request failed", detail: error instanceof Error ? error.message : String(error) };
  }
}
