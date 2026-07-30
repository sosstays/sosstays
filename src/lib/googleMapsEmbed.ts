// Turns a Google Maps link (e.g. pasted from the "Share" button) into a URL
// that can be used as an iframe src. Google only allows embedding via its
// `output=embed` query-string flag — a plain share/place link is blocked by
// X-Frame-Options — so we re-derive an embeddable URL from whatever was
// pasted, falling back to searching a plain-text query (e.g. the property's
// address) when no link is available.
export function toGoogleMapsEmbedSrc(link: string | null | undefined, fallbackQuery: string): string {
  if (link) {
    try {
      const url = new URL(link);
      const isGoogleMapsHost = url.hostname.includes("google.") || url.hostname.includes("goo.gl");
      if (isGoogleMapsHost && url.pathname.includes("/maps/embed")) {
        return url.toString();
      }
      if (isGoogleMapsHost) {
        url.searchParams.set("output", "embed");
        return url.toString();
      }
    } catch {
      // Not a valid absolute URL — fall through to the text-search embed below.
    }
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
}
