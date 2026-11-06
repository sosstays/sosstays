// Pushes custom events onto the GTM dataLayer. Guarded for SSR so it is safe
// to import anywhere; it only does anything in the browser.
type DataLayerEvent = { event?: string } & Record<string, unknown>;

function dataLayer(): DataLayerEvent[] | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { dataLayer?: DataLayerEvent[] };
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  dataLayer()?.push({ event, ...params });
}

/**
 * GA4 ecommerce events (view_item, begin_checkout, purchase). GTM's built-in
 * ecommerce data layer variable reads them from an `ecommerce` object, and the
 * previous event's object must be cleared first or it leaks into this one —
 * that's what the `{ ecommerce: null }` push is for.
 */
export function trackEcommerce(
  event: "view_item" | "begin_checkout" | "purchase",
  ecommerce: Record<string, unknown>,
  extra: Record<string, unknown> = {},
) {
  const layer = dataLayer();
  if (!layer) return;
  layer.push({ ecommerce: null });
  layer.push({ event, ecommerce, ...extra });
}

/** Where this visitor first came from, read from the sos_attr cookie, for tagging events. */
export function firstTouchParams(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.split("; ").find((c) => c.startsWith("sos_attr="));
  if (!match) return {};
  try {
    const a = JSON.parse(decodeURIComponent(match.slice("sos_attr=".length))) as {
      source?: string;
      medium?: string;
      campaign?: string;
    };
    return {
      ...(a.source ? { first_touch_source: a.source } : {}),
      ...(a.medium ? { first_touch_medium: a.medium } : {}),
      ...(a.campaign ? { first_touch_campaign: a.campaign } : {}),
    };
  } catch {
    return {};
  }
}

/** Fires GA4's recommended `generate_lead` event (no PII), tagged with the visitor's first-touch source. */
export function trackLead(formName: string, extra: Record<string, unknown> = {}) {
  trackEvent("generate_lead", { form_name: formName, ...firstTouchParams(), ...extra });
}
