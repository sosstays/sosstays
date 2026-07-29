/**
 * Builds a link to the Uplisting hosted booking/payment page for a given
 * property. Per Uplisting's docs, the URL pattern is:
 *   {bookingSubdomain}/payment/new?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
 *     &number_of_guests=N&property_slug=XXXXXX
 *
 * check_in/check_out/number_of_guests are optional — if omitted, the
 * guest lands on Uplisting's own search/date-picker for that property.
 * bookingSubdomain comes from Site Settings (bookingSubdomainUrl),
 * e.g. https://book.sosstays.com
 */
export function buildUplistingBookingUrl({
  bookingSubdomain,
  propertySlug,
  checkIn,
  checkOut,
  guests,
}: {
  bookingSubdomain: string;
  propertySlug: string;
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  guests?: number;
}) {
  const url = new URL("/payment/new", bookingSubdomain);
  url.searchParams.set("property_slug", propertySlug);
  if (checkIn) url.searchParams.set("check_in", checkIn);
  if (checkOut) url.searchParams.set("check_out", checkOut);
  if (guests) url.searchParams.set("number_of_guests", String(guests));
  return url.toString();
}
