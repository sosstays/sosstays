"use client";

import { useState } from "react";
import { BookingCheckout, type AppliedPromo, type CheckoutAddOn } from "@/components/checkout/BookingCheckout";
import { BookingSummaryCard } from "@/components/checkout/BookingSummaryCard";
import type { StayQuote } from "@/lib/uplistingApi";

// Thin client-side parent for BookingCheckout + BookingSummaryCard. The book
// page used to render these as unconnected siblings, so add-ons picked in
// the form never reached the summary card. BookingCheckout stays the owner
// of the selection state (it's the one wiring up AddOnSelector) and lifts
// the resulting list up here via onSummaryChange, rather than the summary
// card re-deriving it independently.
export function CheckoutPanel({
  slug,
  propertyId,
  checkIn,
  checkOut,
  guests,
  quote,
  addOns,
  property,
}: {
  slug: string;
  propertyId?: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  quote: StayQuote;
  addOns: CheckoutAddOn[];
  property: { name: string; location?: string | null; coverImage?: unknown; sleeps?: number | null };
}) {
  const [summary, setSummary] = useState<{ selectedAddOns: CheckoutAddOn[]; promo: AppliedPromo | null }>({
    selectedAddOns: [],
    promo: null,
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
      <BookingCheckout
        slug={slug}
        propertyId={propertyId}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        quote={quote}
        addOns={addOns}
        onSummaryChange={setSummary}
      />
      <div className="lg:sticky lg:top-6">
        <BookingSummaryCard
          property={property}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          quote={quote}
          addOns={summary.selectedAddOns}
          promo={summary.promo}
        />
      </div>
    </div>
  );
}
