import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { syncPropertyCalendarRange } from "@/lib/calendar/sync";

// How far a delivery's timestamp may drift before we treat it as
// stale/replayed and reject it, per Uplisting's signing docs.
const MAX_TIMESTAMP_SKEW_SECONDS = 5 * 60;

// Registered for the `availability_changed` event via POST /hooks. Body is
// flat with no `event` field — this route only exists for that one event.
type AvailabilityChangedPayload = {
  property_id: number;
  property_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  timestamp: string;
  event_id: string;
};

export async function POST(request: NextRequest) {
  const secret = process.env.UPLISTING_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const timestamp = request.headers.get("x-uplisting-timestamp");
  const signature = request.headers.get("x-uplisting-signature");

  if (!timestamp || !signature || !isValidSignature(rawBody, timestamp, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!isFreshTimestamp(timestamp)) {
    return NextResponse.json({ error: "Stale request" }, { status: 401 });
  }

  let payload: AvailabilityChangedPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { property_id, start_date, end_date } = payload ?? {};
  if (!property_id || !start_date || !end_date) {
    return NextResponse.json(
      { error: "property_id, start_date and end_date are required" },
      { status: 400 }
    );
  }

  // Re-fetch just the affected range and overwrite the cache — keeps us
  // current without ever approaching the polling rate limit. Retried
  // deliveries (same event_id) just re-write the same rows, so this is
  // naturally idempotent without needing to track seen event_ids.
  await syncPropertyCalendarRange(String(property_id), start_date, end_date);

  return NextResponse.json({ ok: true });
}

function isValidSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");

  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}

function isFreshTimestamp(timestamp: string): boolean {
  const requestSeconds = Number(timestamp);
  if (!Number.isFinite(requestSeconds)) return false;
  return Math.abs(Date.now() / 1000 - requestSeconds) <= MAX_TIMESTAMP_SKEW_SECONDS;
}
