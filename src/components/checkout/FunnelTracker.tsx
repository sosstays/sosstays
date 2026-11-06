"use client";

import { useEffect } from "react";
import { trackEcommerce, firstTouchParams } from "@/lib/analytics";
import { MARKET } from "@/lib/market";

/**
 * No-UI GA4 funnel step: view_item (guest looked at a property) or
 * begin_checkout (guest reached the payment form). Together with `purchase`
 * (BookingConfirmedTracker) these let GA4's funnel exploration show where
 * visitors from each channel drop off before paying. Deduped per tab session
 * and per `dedupeKey` so re-renders and back/forward don't double-count.
 */
export function FunnelTracker({
  event,
  dedupeKey,
  itemId,
  itemName,
  value,
  currency,
}: {
  event: "view_item" | "begin_checkout";
  dedupeKey: string;
  itemId: string;
  itemName: string;
  value?: number;
  currency?: string;
}) {
  useEffect(() => {
    const key = `sos_${event}_${dedupeKey}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked — track anyway rather than lose the step.
    }
    trackEcommerce(
      event,
      {
        ...(currency ? { currency } : {}),
        ...(value !== undefined ? { value } : {}),
        items: [{ item_id: itemId, item_name: itemName, quantity: 1, ...(value !== undefined ? { price: value } : {}) }],
      },
      { site_market: MARKET, ...firstTouchParams() },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, dedupeKey]);

  return null;
}
