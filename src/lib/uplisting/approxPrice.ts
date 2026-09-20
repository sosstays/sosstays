import { getUplistingCalendar } from "@/lib/uplisting/client";

// Local-date arithmetic only — no toISOString(): that converts to UTC,
// which silently rolls the date back a day whenever the server's local
// timezone is ahead of UTC (bit us here: Ireland's BST offset turned
// "2026-09-10" into "2026-09-09").
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nightsInRange(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  const cursor = parseISODate(checkIn);
  const end = parseISODate(checkOut);
  while (cursor < end) {
    nights.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return nights;
}

// Approx "from" price beside each room in a matched property's list —
// the average nightly accommodation rate over the exact nights searched
// (no fees folded in, unlike the room page's booking total: this is a
// ballpark for comparing rooms at a glance, not a checkout figure).
// Best-effort: a failed/empty calendar lookup just omits the price for
// that room rather than fabricating one or failing the whole search.
export async function withApproxPrices(
  propertyId: string | undefined,
  checkIn: string,
  checkOut: string
): Promise<number | undefined> {
  if (!propertyId) return undefined;
  try {
    const days = await getUplistingCalendar(propertyId, checkIn, checkOut);
    const nights = nightsInRange(checkIn, checkOut);
    const rates = nights
      .map((night) => days.find((d) => d.date === night)?.dayRate)
      .filter((rate): rate is number => typeof rate === "number");
    if (rates.length === 0) return undefined;
    return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
  } catch {
    return undefined;
  }
}
