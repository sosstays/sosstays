"use client";

import { useState } from "react";
import { AddOnSelector, type CheckoutAddOn } from "@/components/checkout/AddOnSelector";

const VISIBLE_COUNT = 3;

// Read-only add-on list for property pages: the first few extras, with the
// rest tucked behind a "Show more" link. While collapsed, the bottom of the
// list fades out under a soft shadow + blur so it's clear there's more.
export function AddOnsPreview({ addOns, currency }: { addOns: CheckoutAddOn[]; currency: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = addOns.length > VISIBLE_COUNT;
  const shown = expanded || !hasMore ? addOns : addOns.slice(0, VISIBLE_COUNT);

  return (
    <div>
      <div className="relative">
        <AddOnSelector addOns={shown} currency={currency} readOnly label={null} />
        {hasMore && !expanded && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-[10px] bg-gradient-to-t from-cream via-cream/70 to-transparent shadow-[0_-14px_28px_-8px_rgba(0,0,0,0.12)] backdrop-blur-[1px] [mask-image:linear-gradient(to_top,black,black_45%,transparent)]"
          />
        )}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="relative mt-3 text-[15px] font-semibold text-forest-green underline underline-offset-2"
        >
          {expanded ? "Show less" : `Show more (${addOns.length - VISIBLE_COUNT})`}
        </button>
      )}
    </div>
  );
}
