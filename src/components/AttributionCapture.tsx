"use client";

import { useEffect } from "react";
import { MARKET } from "@/lib/market";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_DAYS,
  deriveAttribution,
  hasCampaignSignal,
  parseAttribution,
  serializeAttribution,
} from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

/**
 * Records where the visitor came from the first time they arrive (UTMs, ad
 * click ids, or the external referrer) in a 90-day first-party cookie, so lead
 * forms and checkouts can attach it server-side. A later visit that carries
 * its own campaign parameters (a fresh ad click, say) replaces it — last paid
 * touch wins over an old organic one. Pushes one `attribution_captured` event
 * to the dataLayer per browser session so GTM can copy source/medium into GA4
 * custom dimensions. No UI, no PII.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const existing = parseAttribution(readCookie(ATTRIBUTION_COOKIE));
      const fresh = hasCampaignSignal(url);

      let current = existing;
      if (!existing || fresh) {
        current = deriveAttribution(url, document.referrer, window.location.hostname);
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie =
          `${ATTRIBUTION_COOKIE}=${serializeAttribution(current)}; Path=/; ` +
          `Max-Age=${ATTRIBUTION_MAX_AGE_DAYS * 86400}; SameSite=Lax${secure}`;
      }

      const flag = "sos_attr_pushed";
      if (current && !window.sessionStorage.getItem(flag)) {
        window.sessionStorage.setItem(flag, "1");
        trackEvent("attribution_captured", {
          site_market: MARKET,
          first_touch_source: current.source,
          first_touch_medium: current.medium,
          first_touch_campaign: current.campaign,
          first_touch_landing_page: current.landing_page,
        });
      }
    } catch {
      // Storage/cookies blocked — attribution is best-effort.
    }
  }, []);

  return null;
}
