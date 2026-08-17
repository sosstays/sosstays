"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LOCATIONS = ["Louth", "Meath", "The Mournes"];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const FIELD_LABEL = "mb-1 block text-[11px] font-semibold tracking-widest text-near-black/50 uppercase";
const POPOVER = "absolute top-[calc(100%+12px)] z-20 rounded-2xl bg-cream shadow-[0_16px_40px_-12px_rgba(23,25,23,0.3)]";

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

function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

function ChevronIcon({ direction = "down" }: { direction?: "down" | "left" | "right" }) {
  const rotation = direction === "down" ? "" : direction === "left" ? "rotate-90" : "-rotate-90";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={`h-4 w-4 shrink-0 ${rotation}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function GuestsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <path d="M16 8.75a2.75 2.75 0 1 0 0-5.5M20.5 20c0-2.8-2-5.1-4.7-5.7" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function SearchBar() {
  const router = useRouter();
  const today = startOfDay(new Date());

  const [location, setLocation] = useState("");
  const [showLocations, setShowLocations] = useState(false);

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMonth, setViewMonth] = useState(startOfMonth(today));

  const [guests, setGuests] = useState(1);
  const [showGuests, setShowGuests] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocations(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setShowGuests(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pickDay(day: Date) {
    if (day < today) return;
    if (!checkIn || checkOut || day < checkIn) {
      setCheckIn(day);
      setCheckOut(null);
    } else if (isSameDay(day, checkIn)) {
      setCheckOut(null);
    } else {
      setCheckOut(day);
      setShowCalendar(false);
    }
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", toISODate(checkIn));
    if (checkOut) params.set("checkOut", toISODate(checkOut));
    params.set("guests", String(guests));
    router.push(`/stays?${params.toString()}`);
  }

  const monthGrid = buildMonthGrid(viewMonth);

  return (
    <div className="flex w-full flex-col gap-4 rounded-[28px] bg-cream p-5 shadow-[0_24px_48px_-16px_rgba(23,25,23,0.28)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-3 sm:pl-7">
      {/* Location */}
      <div ref={locationRef} className="relative flex-1 sm:pr-6">
        <label className={FIELD_LABEL}>Location</label>
        <button
          type="button"
          onClick={() => setShowLocations((v) => !v)}
          className="flex w-full items-center gap-2 text-left text-near-black"
        >
          <PinIcon />
          <span className={location ? "" : "text-near-black/40"}>{location || "Where are you going?"}</span>
          <span className="ml-auto text-near-black/50">
            <ChevronIcon />
          </span>
        </button>

        {showLocations && (
          <ul className={`${POPOVER} left-0 w-64 overflow-hidden py-2`}>
            {LOCATIONS.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    setLocation(option);
                    setShowLocations(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-near-black hover:bg-light-forest-green"
                >
                  <PinIcon />
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hidden h-10 w-px bg-sage-grey/40 sm:block" />

      {/* Dates */}
      <div ref={calendarRef} className="relative flex flex-1">
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left text-near-black sm:px-6"
        >
          <CalendarIcon />
          <span className="flex flex-col">
            <span className={FIELD_LABEL}>Check-in</span>
            <span className={checkIn ? "" : "text-near-black/40"}>{formatShort(checkIn) || "Add date"}</span>
          </span>
        </button>

        <div className="hidden h-10 w-px bg-sage-grey/40 sm:block" />

        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left text-near-black sm:px-6"
        >
          <CalendarIcon />
          <span className="flex flex-col">
            <span className={FIELD_LABEL}>Check-out</span>
            <span className={checkOut ? "" : "text-near-black/40"}>{formatShort(checkOut) || "Add date"}</span>
          </span>
        </button>

        {showCalendar && (
          <div className={`${POPOVER} right-0 w-[320px] p-5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2`}>
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-near-black/60 transition-colors hover:bg-light-forest-green hover:text-forest-green"
              >
                <ChevronIcon direction="left" />
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
                <ChevronIcon direction="right" />
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
                const isPast = day < today;
                const isCheckIn = isSameDay(day, checkIn);
                const isCheckOut = isSameDay(day, checkOut);
                const inRange = checkIn && checkOut && day > checkIn && day < checkOut;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isPast}
                    onClick={() => pickDay(day)}
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                      isPast ? "text-near-black/25" : "text-near-black hover:bg-light-forest-green",
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

      <div className="hidden h-10 w-px bg-sage-grey/40 sm:block" />

      {/* Guests */}
      <div ref={guestsRef} className="relative flex-1 sm:pr-6 sm:pl-6">
        <label className={FIELD_LABEL}>Guests</label>
        <button
          type="button"
          onClick={() => setShowGuests((v) => !v)}
          className="flex w-full items-center gap-2 text-left text-near-black"
        >
          <GuestsIcon />
          {guests}
        </button>

        {showGuests && (
          <div className={`${POPOVER} right-0 w-56 p-4 sm:left-0 sm:right-auto`}>
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
                  onClick={() => setGuests((g) => Math.min(16, g + 1))}
                  aria-label="Increase guests"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-sage-grey/60 text-near-black transition-colors hover:border-forest-green hover:text-forest-green"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSearch}
        className="flex items-center justify-center gap-2 rounded-full bg-forest-green px-8 py-4 text-[15px] font-semibold whitespace-nowrap text-cream transition-colors duration-300 hover:bg-light-sage hover:text-forest-green"
      >
        <SearchIcon />
        Search
      </button>
    </div>
  );
}
