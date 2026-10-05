// Pushes a custom event onto the GTM dataLayer. Guarded for SSR so it is safe
// to import anywhere; it only does anything in the browser.
type DataLayerEvent = { event: string } & Record<string, unknown>;

export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: DataLayerEvent[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}
