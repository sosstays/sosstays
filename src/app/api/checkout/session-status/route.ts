import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      status: session.status,
      customerEmail: session.customer_details?.email ?? null,
    });
  } catch (error) {
    console.error("Failed to retrieve Checkout Session", error);
    return NextResponse.json({ error: "Could not retrieve session" }, { status: 502 });
  }
}
