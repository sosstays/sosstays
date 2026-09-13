"use client";

import { useEffect, useRef, useState } from "react";
import { DateGuestsFields, toISODate, parseISODate, type DateGuestsValue } from "@/components/DateGuestsFields";

const LOCATIONS = ["Drogheda"];

const FIELD_LABEL = "mb-1 block truncate text-[11px] font-semibold tracking-widest text-near-black/50 uppercase";
const POPOVER = "absolute top-[calc(100%+12px)] z-20 mt-[10px] rounded-2xl bg-cream shadow-[0_16px_40px_-12px_rgba(23,25,23,0.3)]";

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5 shrink-0 text-forest-green"
    >
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
      className={`h-4 w-4 shrink-0 text-forest-green ${rotation}`}
    >
      <path d="m6 9 6 6 6-6" />
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

type SearchBarProps = {
  /** Prefills the bar — used on /search so refining a search keeps what was already picked. */
  initialLocation?: string;
  initialCheckIn?: string; // YYYY-MM-DD
  initialCheckOut?: string; // YYYY-MM-DD
  initialGuests?: number;
};

export function SearchBar({
  initialLocation = "",
  initialCheckIn,
  initialCheckOut,
  initialGuests = 1,
}: SearchBarProps = {}) {
  const [location, setLocation] = useState(initialLocation);
  const [showLocations, setShowLocations] = useState(false);
  const [dateGuests, setDateGuests] = useState<DateGuestsValue>({
    checkIn: parseISODate(initialCheckIn),
    checkOut: parseISODate(initialCheckOut),
    guests: initialGuests,
  });

  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocations(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <form
      action="/search"
      method="GET"
      className="mx-auto flex w-full max-w-6xl flex-col gap-7 rounded-[28px] bg-cream p-5 shadow-[0_24px_48px_-16px_rgba(23,25,23,0.28)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-3 sm:pl-7"
    >
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="check_in" value={dateGuests.checkIn ? toISODate(dateGuests.checkIn) : ""} />
      <input type="hidden" name="check_out" value={dateGuests.checkOut ? toISODate(dateGuests.checkOut) : ""} />
      <input type="hidden" name="guests" value={dateGuests.guests} />

      {/* Location */}
      <div ref={locationRef} className="relative min-w-0 flex-1 sm:pr-6">
        <label className={FIELD_LABEL}>Location</label>
        <button
          type="button"
          onClick={() => setShowLocations((v) => !v)}
          className="flex w-full items-center gap-2 text-left text-near-black"
        >
          <PinIcon />
          <span className={`min-w-0 truncate ${location ? "" : "text-near-black/40"}`}>
            {location || "Where are you going?"}
          </span>
          <span className="ml-auto shrink-0 text-near-black/50">
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

      <DateGuestsFields
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        initialGuests={initialGuests}
        layout="form"
        onChange={setDateGuests}
      />

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bg-forest-green px-8 py-4 text-[15px] font-semibold whitespace-nowrap text-cream transition-colors duration-300 hover:bg-light-sage hover:text-forest-green"
      >
        <SearchIcon />
        Search
      </button>
    </form>
  );
}
