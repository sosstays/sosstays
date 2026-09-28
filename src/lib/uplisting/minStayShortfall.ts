import { getUplistingCalendar, resolveUplistingPropertyIds } from "@/lib/uplisting/client";

function nightsInRange(checkIn: string, checkOut: string): number {
  const [y1, m1, d1] = checkIn.split("-").map(Number);
  const [y2, m2, d2] = checkOut.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Checks whether any of the given rooms/whole-houses (Uplisting
 * property_slugs) are available for the searched check-in but need more
 * nights than were searched — i.e. would have matched Uplisting's own
 * /availability search if not for their minimum-length-of-stay rule, which
 * that endpoint already enforces (confirmed against the live API). Without
 * this, a room that disappears from a search for that reason looks
 * identical to one that's simply fully booked.
 *
 * Returns the smallest such requirement across the given rooms (the guest's
 * best shot at making it work), or null if none of them are min-stay-only
 * misses. Best-effort: a failed lookup for any given room just excludes it
 * rather than failing the whole check.
 */
export async function findMinStayShortfall(
  propertySlugs: string[],
  checkIn: string,
  checkOut: string
): Promise<number | null> {
  const nights = nightsInRange(checkIn, checkOut);
  if (nights <= 0 || propertySlugs.length === 0) return null;

  try {
    const idMap = await resolveUplistingPropertyIds(propertySlugs);
    const requirements = await Promise.all(
      Array.from(idMap.values()).map(async (id) => {
        const days = await getUplistingCalendar(id, checkIn, checkOut).catch(() => []);
        const day = days.find((d) => d.date === checkIn);
        if (!day || !day.available) return null;
        return day.minimumLengthOfStay > nights ? day.minimumLengthOfStay : null;
      })
    );
    const shortfalls = requirements.filter((r): r is number => r !== null);
    return shortfalls.length > 0 ? Math.min(...shortfalls) : null;
  } catch {
    return null;
  }
}
