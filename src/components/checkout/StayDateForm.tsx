"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

// Shown on /stays/[slug]/book when the visitor arrived without check-in /
// check-out / guests in the URL (e.g. clicked straight from the property
// page rather than from a date-aware search). Once submitted, the page
// reloads with those as query params and can fetch a real quote.
export function StayDateForm({ slug, maxGuests }: { slug: string; maxGuests?: number | null }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError("Pick a check-in and check-out date.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }
    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setError("Enter a valid number of guests.");
      return;
    }
    setError("");
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guestCount) });
    router.push(`/stays/${slug}/book?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-[18px] border border-border-subtle bg-bright-cream p-7">
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">
            Check-in <span className="text-error-red">*</span>
          </span>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black focus:border-forest-green focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">
            Check-out <span className="text-error-red">*</span>
          </span>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black focus:border-forest-green focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-near-black">
            Guests <span className="text-error-red">*</span>
          </span>
          <input
            type="number"
            min={1}
            max={maxGuests ?? undefined}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black focus:border-forest-green focus:outline-none"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-error-red">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="custom" className="self-start px-8 py-3 text-[15px] font-semibold">
        See price
      </Button>
    </form>
  );
}
