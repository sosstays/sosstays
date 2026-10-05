"use client";

import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

export type AccountBooking = {
  id: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  revenue: number | null;
  reference: string;
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const cancelled = status === "cancelled";
  return (
    <span
      className={
        cancelled
          ? "self-start rounded-full bg-error-red px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-cream uppercase tracking-[0.04em]"
          : "self-start rounded-full border border-sage-grey/50 bg-cream px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-forest-green capitalize"
      }
    >
      {status}
    </span>
  );
}

// The design mocks a property photo here (its own placeholder — "Photo of
// the property" — since real listing photography isn't wired into the
// bookings table yet). This mirrors that with the brand mark instead of
// pretending we have a photo to show.
function PhotoPlaceholder({ dimmed }: { dimmed?: boolean }) {
  return (
    <div
      className={`relative flex min-h-[132px] flex-none items-center justify-center rounded-[14px] sm:min-h-[152px] sm:w-[180px] ${
        dimmed ? "bg-sage-grey/15 grayscale" : "bg-light-forest-green/50"
      }`}
    >
      <Image src="/booking-flow/mark-green.svg" alt="" width={48} height={49} className="w-12 opacity-30" />
    </div>
  );
}

function BookingCard({ booking }: { booking: AccountBooking }) {
  const cancelled = booking.status === "cancelled";
  return (
    <div
      className={`rounded-[18px] border p-4 sm:p-5 ${
        cancelled ? "border-error-red/25 bg-bright-cream" : "border-border-subtle bg-bright-cream"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <PhotoPlaceholder dimmed={cancelled} />

        <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
          <StatusBadge status={booking.status} />
          <strong
            className={`font-serif text-xl leading-[1.15] font-bold ${
              cancelled ? "text-near-black/60" : "text-near-black"
            }`}
          >
            {booking.propertyName}
          </strong>
          <span className="text-sm text-near-black/60">
            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
          </span>
          <span className="text-xs tracking-[0.04em] text-near-black/45 uppercase">{booking.reference}</span>
        </div>

        <div className="flex flex-row items-center justify-between gap-3 border-t border-border-subtle pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0 sm:text-right">
          {booking.revenue != null && (
            <span className={`text-xl font-bold ${cancelled ? "text-near-black/50 line-through" : "text-near-black"}`}>
              {formatCurrency(booking.revenue, "EUR")}
            </span>
          )}
          {!cancelled && (
            <a
              href={`mailto:info@sosstays.com?subject=${encodeURIComponent(
                `Manage booking ${booking.reference}`
              )}`}
              className="rounded-full border border-sage-grey px-4 py-2 text-sm font-semibold whitespace-nowrap text-forest-green transition-colors hover:border-forest-green"
            >
              Manage
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountBookings({
  upcoming,
  past,
}: {
  upcoming: AccountBooking[];
  past: AccountBooking[];
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "upcoming" | "past")}>
      <TabsList className="inline-flex w-fit gap-1 rounded-full bg-deep-forest p-1">
        <TabsTrigger
          value="upcoming"
          className="rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap text-sage-300 transition-colors duration-200 data-[state=active]:bg-cream data-[state=active]:font-semibold data-[state=active]:text-deep-forest"
        >
          Upcoming
        </TabsTrigger>
        <TabsTrigger
          value="past"
          className="rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap text-sage-300 transition-colors duration-200 data-[state=active]:bg-cream data-[state=active]:font-semibold data-[state=active]:text-deep-forest"
        >
          Past
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="flex flex-col gap-4 pt-6">
        {upcoming.length === 0 ? (
          <EmptyState message="No upcoming breaks yet — when you book a stay, it'll show up here." />
        ) : (
          upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </TabsContent>

      <TabsContent value="past" className="flex flex-col gap-4 pt-6">
        {past.length === 0 ? (
          <EmptyState message="Nothing here yet — your past stays will collect in this tab." />
        ) : (
          past.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-sage-grey/50 px-6 py-10 text-center">
      <p className="text-[15px] text-near-black/60">{message}</p>
    </div>
  );
}
