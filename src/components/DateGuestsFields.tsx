"use client";

import { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const POPOVER_BASE = "absolute z-20 rounded-2xl bg-cream shadow-[0_16px_40px_-12px_rgba(23,25,23,0.3)]";

// "form" (the big pill SearchBar, near the top of the page) opens
// downward as normal. "bar" (the sticky bottom bar) has to open upward
// instead — the trigger sits right at the bottom edge of the viewport,
// so a downward popover renders off-screen below the fold and is
// effectively unusable (looks like clicking does nothing).
function popoverPosition(layout: "form" | "bar") {
  return layout === "bar" ? "bottom-[calc(100%+12px)] mb-[10px]" : "top-[calc(100%+12px)] mt-[10px]";
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatShort(date: Date | null) {
  return date ? date.toLocaleDateString("en-IE", { day: "numeric", month: "short" }) : null;
}

export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso?: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function buildMonthGrid(month: Date) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const startWeekday = (new Date(year, m, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells: (Date | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));
  return cells;
}

// A range "contains" an unavailable night if any date from checkIn up to
// (but not including) checkOut is blocked — the guest would be booking
// through a night nobody can actually reserve.
function rangeHasUnavailableNight(checkIn: Date, checkOut: Date, unavailableDates?: Set<string>) {
  if (!unavailableDates || unavailableDates.size === 0) return false;
  const cursor = new Date(checkIn);
  while (cursor < checkOut) {
    if (unavailableDates.has(toISODate(cursor))) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

function ChevronIcon({
  direction = "down",
  className = "",
}: {
  direction?: "down" | "left" | "right";
  className?: string;
}) {
  const rotation = direction === "down" ? "" : direction === "left" ? "rotate-90" : "-rotate-90";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={`h-4 w-4 shrink-0 ${rotation} ${className}`}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={`h-5 w-5 shrink-0 ${className}`}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function GuestsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={`h-5 w-5 shrink-0 ${className}`}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <path d="M16 8.75a2.75 2.75 0 1 0 0-5.5M20.5 20c0-2.8-2-5.1-4.7-5.7" strokeLinecap="round" />
    </svg>
  );
}

export type DateGuestsValue = { checkIn: Date | null; checkOut: Date | null; guests: number };

// The date-range + guest-count pickers shared by the big pill SearchBar
// and RoomBookingBar's compact sticky bar. Fully self-contained (owns its
// own popover/month state) — the parent just reads the current selection
// off onChange, fired whenever check-in/check-out/guests changes.
export function DateGuestsFields({
  initialCheckIn,
  initialCheckOut,
  initialGuests = 1,
  maxGuests = 16,
  unavailableDates,
  datesLabel = "Check-in – Check-out",
  theme = "light",
  layout = "form",
  onChange,
}: {
  initialCheckIn?: string; // YYYY-MM-DD
  initialCheckOut?: string; // YYYY-MM-DD
  initialGuests?: number;
  maxGuests?: number;
  /** ISO (YYYY-MM-DD) dates that can't be checked into or booked through. */
  unavailableDates?: Set<string>;
  datesLabel?: string;
  /** "dark" swaps trigger text/icons for use on a dark bar background — popovers stay light either way. */
  theme?: "light" | "dark";
  /** "form" (default): sized/padded/divided for the big pill SearchBar. "bar": compact, no internal divider — the sticky bar handles its own spacing. */
  layout?: "form" | "bar";
  onChange?: (value: DateGuestsValue) => void;
}) {
  const today = startOfDay(new Date());

  const [checkIn, setCheckIn] = useState<Date | null>(() => parseISODate(initialCheckIn));
  const [checkOut, setCheckOut] = useState<Date | null>(() => parseISODate(initialCheckOut));
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(parseISODate(initialCheckIn) ?? today));

  const [guests, setGuests] = useState(initialGuests);
  const [showGuests, setShowGuests] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setShowGuests(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    onChange?.({ checkIn, checkOut, guests });
    // onChange intentionally excluded — parents pass a fresh function each
    // render, and re-firing on that alone (rather than on real value
    // changes) would defeat the point of this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, guests]);

  function isDayBlocked(day: Date) {
    return day < today || Boolean(unavailableDates?.has(toISODate(day)));
  }

  function pickDay(day: Date) {
    if (isDayBlocked(day)) return;
    if (!checkIn || checkOut || day < checkIn) {
      setCheckIn(day);
      setCheckOut(null);
    } else if (isSameDay(day, checkIn)) {
      setCheckOut(null);
    } else if (rangeHasUnavailableNight(checkIn, day, unavailableDates)) {
      // Can't complete a range through a blocked night — restart from
      // this day instead of silently doing nothing.
      setCheckIn(day);
      setCheckOut(null);
    } else {
      setCheckOut(day);
      setShowCalendar(false);
    }
  }

  const monthGrid = buildMonthGrid(viewMonth);
  const isDark = theme === "dark";

  const triggerTextClass = isDark ? "text-cream" : "text-near-black";
  const triggerIconClass = isDark ? "text-cream/80" : "text-forest-green";
  const placeholderClass = isDark ? "text-cream/50" : "text-near-black/40";
  const labelClass = isDark
    ? "mb-1 block truncate text-[11px] font-semibold tracking-widest text-cream/50 uppercase"
    : "mb-1 block truncate text-[11px] font-semibold tracking-widest text-near-black/50 uppercase";

  const datesWrapperClass = layout === "form" ? "relative min-w-0 flex-1 sm:px-6" : "relative min-w-0";
  const guestsWrapperClass = layout === "form" ? "relative sm:px-6" : "relative";

  return (
    <>
      {/* Dates */}
      <div ref={calendarRef} className={datesWrapperClass}>
        <label className={labelClass}>{datesLabel}</label>
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className={`flex w-full items-center gap-2 text-left ${triggerTextClass}`}
        >
          <CalendarIcon className={triggerIconClass} />
          <span className={`min-w-0 truncate ${checkIn ? "" : placeholderClass}`}>
            {checkIn ? `${formatShort(checkIn)} – ${formatShort(checkOut) || "Add date"}` : "Add dates"}
          </span>
        </button>

        {showCalendar && (
          <div className={`${POPOVER_BASE} ${popoverPosition(layout)} left-1/2 w-[320px] -translate-x-1/2 p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-near-black/60 transition-colors hover:bg-light-forest-green hover:text-forest-green"
              >
                <ChevronIcon direction="left" className="text-forest-green" />
              </button>
              <span className="text-sm font-semibold text-near-black">
                {viewMonth.toLocaleDateString("en-IE", { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-near-black/60 transition-colors hover:bg-light-forest-green hover:text-forest-green"
              >
                <ChevronIcon direction="right" className="text-forest-green" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-semibold text-near-black/40">
              {WEEKDAYS.map((wd) => (
                <span key={wd}>{wd}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
              {monthGrid.map((day, i) => {
                if (!day) return <span key={i} />;
                const isBlocked = isDayBlocked(day);
                const isCheckIn = isSameDay(day, checkIn);
                const isCheckOut = isSameDay(day, checkOut);
                const inRange = checkIn && checkOut && day > checkIn && day < checkOut;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => pickDay(day)}
                    title={isBlocked && day >= today ? "Not available" : undefined}
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                      isBlocked ? "text-near-black/25 line-through decoration-near-black/25" : "text-near-black hover:bg-light-forest-green",
                      inRange ? "bg-light-forest-green rounded-none" : "",
                      isCheckIn || isCheckOut ? "bg-forest-green text-cream hover:bg-forest-green" : "",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {layout === "form" && <div className="hidden h-10 w-px bg-sage-grey/40 sm:block" />}

      {/* Guests */}
      <div ref={guestsRef} className={guestsWrapperClass}>
        <label className={labelClass}>Guests</label>
        <button
          type="button"
          onClick={() => setShowGuests((v) => !v)}
          className={`flex w-full items-center gap-2 text-left ${triggerTextClass}`}
        >
          <GuestsIcon className={triggerIconClass} />
          {guests}
        </button>

        {showGuests && (
          <div className={`${POPOVER_BASE} ${popoverPosition(layout)} right-0 w-56 p-4 sm:left-0 sm:right-auto`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-near-black">Guests</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  disabled={guests <= 1}
                  aria-label="Decrease guests"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-sage-grey/60 text-near-black transition-colors hover:border-forest-green hover:text-forest-green disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-4 text-center text-near-black">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                  disabled={guests >= maxGuests}
                  aria-label="Increase guests"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-sage-grey/60 text-near-black transition-colors hover:border-forest-green hover:text-forest-green disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
