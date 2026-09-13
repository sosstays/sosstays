import { NextRequest, NextResponse } from "next/server";
import { getUplistingCalendar } from "@/lib/uplisting/client";

// Backs RoomBookingBar's price display (on load) and its pre-booking
// availability re-check (right before the guest is sent to Uplisting's
// deep link) — both just read a window of this same per-day calendar,
// never anything the API key can't already see, so it's safe to expose
// to the client this thinly.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!propertyId || !from || !to) {
    return NextResponse.json({ error: "propertyId, from, and to are required" }, { status: 400 });
  }

  try {
    const days = await getUplistingCalendar(propertyId, from, to);
    return NextResponse.json({ days });
  } catch (error) {
    console.error("Uplisting calendar lookup failed:", error);
    return NextResponse.json({ error: "Calendar lookup failed" }, { status: 502 });
  }
}
