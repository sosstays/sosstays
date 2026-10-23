"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type PurchaseItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

/**
 * Fires the GA4 "purchase" ecommerce event once a Stripe Checkout session has
 * actually completed. Rendered (client-side, as a no-UI effect) from the
 * server-rendered /stays/[slug]/book/return page once it has confirmed
 * session.status === "complete" — never render this before that check.
 *
 * Dedupe: /book/return?session_id=... is a plain shareable/bookmarkable URL.
 * A refresh, back-button visit, or the confirmation link being reopened later
 * would otherwise re-fire "purchase" and double-count revenue in GA4/Ads. A
 * sessionStorage flag keyed by transaction_id stops that for the same
 * browser tab/session; it intentionally does NOT protect against two
 * different browsers opening the same link (a true de-dupe needs a
 * server-side hit keyed on session_id, e.g. from the Stripe webhook —
 * left for a follow-up).
 */
export function BookingConfirmedTracker({
  transactionId,
  value,
  currency,
  items,
}: {
  transactionId: string;
  value: number;
  currency: string;
  items: PurchaseItem[];
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dedupeKey = `sos_purchase_tracked_${transactionId}`;
    try {
      if (window.sessionStorage.getItem(dedupeKey)) return;
      window.sessionStorage.setItem(dedupeKey, "1");
    } catch {
      // Private browsing / storage blocked — fall through and track anyway
      // rather than silently losing the conversion.
    }
    trackEvent("purchase", {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  return null;
}
