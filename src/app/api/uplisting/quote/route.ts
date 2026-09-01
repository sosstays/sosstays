import { NextRequest, NextResponse } from "next/server";
import { getQuote, UplistingQuoteError } from "@/lib/uplisting";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const propertyId = Number(params.get("property_id"));
  const checkIn = params.get("check_in") ?? "";
  const checkOut = params.get("check_out") ?? "";
  const numberOfGuests = Number(params.get("guests") ?? "1");

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return NextResponse.json({ error: "A valid property_id is required" }, { status: 400 });
  }
  if (!DATE_PATTERN.test(checkIn) || !DATE_PATTERN.test(checkOut)) {
    return NextResponse.json({ error: "check_in and check_out must be YYYY-MM-DD" }, { status: 400 });
  }
  if (checkOut <= checkIn) {
    return NextResponse.json({ error: "check_out must be after check_in" }, { status: 400 });
  }
  if (!Number.isFinite(numberOfGuests) || numberOfGuests <= 0) {
    return NextResponse.json({ error: "guests must be greater than 0" }, { status: 400 });
  }

  try {
    const quote = await getQuote({ propertyId, checkIn, checkOut, numberOfGuests });
    return NextResponse.json(quote);
  } catch (err) {
    if (err instanceof UplistingQuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Uplisting quote error:", err);
    return NextResponse.json({ error: "Failed to fetch a quote" }, { status: 502 });
  }
}
