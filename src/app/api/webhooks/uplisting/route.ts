import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { syncPropertyCalendarRange } from "@/lib/calendar/sync";

/**
 * ASSUMPTION — not yet verified: Uplisting's payload shape and signature
 * scheme below are a best guess. Confirm the actual webhook event name,
 * payload fields, and signing method in Uplisting's dashboard/support
 * before relying on this in production (flagged in the original spec too).
 */
type UplistingWebhookPayload = {
  property_id: string;
  from_date: string; // YYYY-MM-DD
  to_date: string; // YYYY-MM-DD
};

export async function POST(request: NextRequest) {
  const secret = process.env.UPLISTING_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
  }

  const rawBody = await request.text();

  const signature = request.headers.get("x-uplisting-signature");
  if (!signature || !isValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: UplistingWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { property_id, from_date, to_date } = payload ?? {};
  if (!property_id || !from_date || !to_date) {
    return NextResponse.json(
      { error: "property_id, from_date and to_date are required" },
      { status: 400 }
    );
  }

  // Re-fetch just the affected range and overwrite the cache — keeps us
  // current without ever approaching the polling rate limit.
  await syncPropertyCalendarRange(property_id, from_date, to_date);

  return NextResponse.json({ ok: true });
}

function isValidSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");

  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}
