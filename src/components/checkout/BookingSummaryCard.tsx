import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { formatCurrency } from "@/lib/utils";
import type { StayQuote } from "@/lib/uplistingApi";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Sticky order-summary panel next to the checkout form — property photo,
// dates, guests, and the same price breakdown the Stripe session was built
// from. Deliberately doesn't model multi-room bookings (one property = one
// line item throughout this flow, no per-room breakdown).
export function BookingSummaryCard({
  property,
  checkIn,
  checkOut,
  guests,
  quote,
}: {
  property: { name: string; location?: string | null; coverImage?: unknown; sleeps?: number | null };
  checkIn: string;
  checkOut: string;
  guests: number;
  quote: StayQuote;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-bright-cream">
      {property.coverImage ? (
        <div className="relative h-[178px] w-full">
          <Image
            src={urlFor(property.coverImage).width(760).height(356).url()}
            alt={property.name}
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-[18px] px-[26px] py-[22px]">
        <div className="flex flex-col gap-[3px]">
          {property.location && (
            <span className="text-xs font-medium tracking-[0.06em] text-near-black/60 uppercase">
              {property.location}
            </span>
          )}
          <strong className="font-serif text-[1.375rem] leading-[1.15] font-bold text-near-black">
            {property.name}
          </strong>
        </div>

        <div className="flex items-center gap-3.5 rounded-[10px] bg-pale-sage/50 px-4 py-3.5">
          <div className="flex flex-col">
            <span className="text-xs text-near-black/60">In</span>
            <strong className="text-[15px] font-semibold text-near-black">{formatDate(checkIn)}</strong>
          </div>
          <svg
            width="34"
            height="10"
            viewBox="0 0 38 10"
            fill="none"
            stroke="var(--forest-green)"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="flex-none"
          >
            <path d="M1 5c4-4 8 4 12 0s8 4 12 0" />
            <path d="m30 1 4 4-4 4" />
          </svg>
          <div className="flex flex-col">
            <span className="text-xs text-near-black/60">Out</span>
            <strong className="text-[15px] font-semibold text-near-black">{formatDate(checkOut)}</strong>
          </div>
          <span className="ml-auto text-sm text-near-black/60">
            {guests} guest{guests === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-near-black/60">
              {quote.numberOfNights} night{quote.numberOfNights === 1 ? "" : "s"}
            </span>
            <span className="text-near-black">{formatCurrency(quote.accommodationTotal, quote.currency)}</span>
          </div>
          {quote.cleaningFee > 0 && (
            <div className="flex justify-between">
              <span className="text-near-black/60">Cleaning fee</span>
              <span className="text-near-black">{formatCurrency(quote.cleaningFee, quote.currency)}</span>
            </div>
          )}
        </div>

        <div className="h-px bg-border-subtle" />

        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-near-black">Total</span>
          <span className="text-[1.75rem] font-bold tracking-tight text-near-black">
            {formatCurrency(quote.total, quote.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
