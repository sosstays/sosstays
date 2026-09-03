"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DateGuestsFields, toISODate, type DateGuestsValue } from "@/components/DateGuestsFields";
import type { UplistingRoomFees } from "@/lib/uplisting/client";

type CalendarDay = { date: string; available: boolean; dayRate: number };

const CALENDAR_WINDOW_DAYS = 120;

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nightsInRange(checkIn: Date, checkOut: Date): string[] {
  const nights: string[] = [];
  const cursor = new Date(checkIn);
  while (cursor < checkOut) {
    nights.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return nights;
}

async function fetchCalendar(propertyId: string, from: string, to: string): Promise<CalendarDay[]> {
  const res = await fetch(`/api/uplisting/calendar?propertyId=${propertyId}&from=${from}&to=${to}`);
  if (!res.ok) throw new Error("calendar fetch failed");
  const body = (await res.json()) as { days: CalendarDay[] };
  return body.days;
}

function buildBookingUrl(uplistingDomain: string, propertySlug: string, checkIn: Date, checkOut: Date, guests: number) {
  try {
    const url = new URL("/checkout", new URL(uplistingDomain).origin);
    url.searchParams.set("propertySlug", propertySlug);
    url.searchParams.set("checkIn", toISODate(checkIn));
    url.searchParams.set("checkOut", toISODate(checkOut));
    url.searchParams.set("guests", String(guests));
    return url.toString();
  } catch {
    return uplistingDomain;
  }
}

// The room page's sticky booking bar: pinned to the bottom of the
// viewport from first paint (not scroll-triggered — the point is that
// pricing and booking are always one click away), built around
// DateGuestsFields instead of static text so guests can pick dates
// without leaving the page. Pulls Uplisting's calendar on load (blocked
// days + nightly rate, for the picker and the running total) and
// re-checks it right before handing the guest off to Uplisting's deep
// link — the on-load fetch can be minutes stale by the time they click
// "Book now".
export function RoomBookingBar({
  propertyId,
  propertySlug,
  roomName,
  uplistingDomain,
  fees,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  maxGuests,
}: {
  propertyId: string;
  /** Uplisting's property_slug — what StayDirect's own checkout URL keys off, e.g. "2e6b8e". */
  propertySlug: string;
  roomName: string;
  uplistingDomain: string | null;
  fees: UplistingRoomFees;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  maxGuests?: number;
}) {
  const [days, setDays] = useState<Map<string, CalendarDay>>(new Map());
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [selection, setSelection] = useState<DateGuestsValue>({ checkIn: null, checkOut: null, guests: initialGuests ?? 1 });
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get-quote-on-load: pull a window of calendar days up front so the
  // picker can gray out blocked dates and show a live total as soon as
  // the guest opens it, without a round-trip per date click.
  useEffect(() => {
    const today = new Date();
    const from = toISODate(today);
    const to = toISODate(addDays(today, CALENDAR_WINDOW_DAYS));

    fetchCalendar(propertyId, from, to)
      .then((fetched) => setDays(new Map(fetched.map((d) => [d.date, d]))))
      .catch(() => setDays(new Map()))
      .finally(() => setLoadingCalendar(false));
  }, [propertyId]);

  const unavailableDates = useMemo(() => {
    const set = new Set<string>();
    days.forEach((day, date) => {
      if (!day.available) set.add(date);
    });
    return set;
  }, [days]);

  const quote = useMemo(() => {
    if (!selection.checkIn || !selection.checkOut) return null;
    const nights = nightsInRange(selection.checkIn, selection.checkOut);
    if (nights.length === 0) return null;

    let accommodation = 0;
    for (const night of nights) {
      accommodation += days.get(night)?.dayRate ?? 0;
    }

    // Mirrors what Uplisting's own checkout totals up (see StayDirect) —
    // the sticky bar was previously showing accommodation alone, which
    // undercounts the real price by the cleaning fee (and any taxes).
    const extraGuests = Math.max(0, selection.guests - fees.extraGuestThreshold);
    const feesTotal =
      fees.cleaningFee +
      extraGuests * fees.extraGuestFee +
      fees.taxPerBooking +
      accommodation * (fees.taxPerBookingPercent / 100) +
      fees.taxPerNight * nights.length +
      fees.taxPerPersonPerNight * selection.guests * nights.length;

    return { nights: nights.length, total: accommodation + feesTotal };
  }, [selection.checkIn, selection.checkOut, selection.guests, days, fees]);

  // Before any dates are picked, fall back to the cheapest available
  // night in the fetched window — a real rate off the room's own
  // calendar, not a guess — so the bar always shows a price instead of
  // just "pick your dates".
  const fromNightly = useMemo(() => {
    const availableRates = Array.from(days.values())
      .filter((day) => day.available)
      .map((day) => day.dayRate);
    return availableRates.length > 0 ? Math.min(...availableRates) : null;
  }, [days]);

  const handleChange = useCallback((value: DateGuestsValue) => {
    setSelection(value);
    setError(null);
  }, []);

  async function handleBookNow() {
    if (!uplistingDomain || !selection.checkIn || !selection.checkOut || checking) return;

    setChecking(true);
    setError(null);
    try {
      const from = toISODate(selection.checkIn);
      const to = toISODate(selection.checkOut);
      const fresh = await fetchCalendar(propertyId, from, to);
      const freshMap = new Map(fresh.map((d) => [d.date, d]));

      const nights = nightsInRange(selection.checkIn, selection.checkOut);
      const stillAvailable = nights.every((night) => freshMap.get(night)?.available !== false);

      if (!stillAvailable) {
        setDays((prev) => {
          const merged = new Map(prev);
          freshMap.forEach((day, date) => merged.set(date, day));
          return merged;
        });
        setError("Those dates just got booked elsewhere — pick different ones.");
        return;
      }

      window.location.href = buildBookingUrl(
        uplistingDomain,
        propertySlug,
        selection.checkIn,
        selection.checkOut,
        selection.guests
      );
    } catch {
      setError("Couldn't confirm availability — try again in a moment.");
    } finally {
      setChecking(false);
    }
  }

  const canBook = Boolean(uplistingDomain && selection.checkIn && selection.checkOut && !checking);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-cream/10 bg-deep-forest/95 px-8 py-3.5 backdrop-blur-md sm:px-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium tracking-widest text-cream/55 uppercase">{roomName}</span>
          {quote ? (
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-serif text-2xl font-bold text-cream">€{quote.total.toFixed(0)}</span>
              <span className="text-sm text-cream/70">
                total for {quote.nights} night{quote.nights === 1 ? "" : "s"} · incl. fees
              </span>
            </span>
          ) : loadingCalendar ? (
            <span className="text-sm text-cream/70">Checking availability…</span>
          ) : fromNightly !== null ? (
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-serif text-2xl font-bold text-cream">€{fromNightly.toFixed(0)}</span>
              <span className="text-sm text-cream/70">/ night from</span>
            </span>
          ) : (
            <span className="text-sm text-cream/70">Pick your dates</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <DateGuestsFields
            initialCheckIn={initialCheckIn}
            initialCheckOut={initialCheckOut}
            initialGuests={initialGuests}
            maxGuests={maxGuests}
            unavailableDates={unavailableDates}
            theme="dark"
            layout="bar"
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={handleBookNow}
            disabled={!canBook}
            className="inline-flex items-center rounded-full bg-cream px-6.5 py-3 text-sm font-semibold whitespace-nowrap text-deep-forest transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {checking ? "Checking…" : "Book now →"}
          </button>
        </div>
      </div>

      {error && <p className="mx-auto mt-2 max-w-6xl text-sm text-light-sage">{error}</p>}
    </div>
  );
}
