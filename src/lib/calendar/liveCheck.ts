import { fetchUplistingCalendar } from "../uplisting/client";

/**
 * The one deliberate exception to "never call Uplisting live from the UI":
 * a direct availability check for the exact selected dates, made right
 * before handing the guest off to Uplisting's checkout. The cache is
 * fast but can be up to one sync cycle stale; this call protects against
 * sending someone to book dates that just got taken.
 *
 * Call this from the "Book Now" action only — not from calendar
 * rendering, search, or anything else that runs on every page view.
 */
export async function isLiveAvailable(
  propertyId: string,
  checkIn: string, // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
): Promise<boolean> {
  const days = await fetchUplistingCalendar(propertyId, checkIn, checkOut);
  if (days.length === 0) return false;

  // checkOut night itself isn't occupied by this stay, so exclude it.
  return days.filter((day) => day.date < checkOut).every((day) => day.isAvailable);
}
