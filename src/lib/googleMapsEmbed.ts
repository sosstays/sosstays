// Turns a Google Maps link (e.g. pasted from the "Share" button) into a URL
// that can be used as an iframe src. Google only allows embedding via its
// `output=embed` query-string flag — a plain share/place link is blocked by
// X-Frame-Options — so we re-derive an embeddable URL from whatever was
// pasted, falling back to searching a plain-text query (e.g. the property's
// address) when no link is available.
//
// Google's "Share" button now defaults to a shortened `maps.app.goo.gl` link.
// Those are redirect-only — appending `output=embed` to the short link does
// nothing, since the browser never sees the real `/maps/place/...` URL to
// embed. We have to follow the redirect server-side first to get the real
// URL before we can turn it into an embed src.
async function resolveShortLink(link: string): Promise<string> {
  try {
    const response = await fetch(link, { redirect: "follow" });
    return response.url || link;
  } catch {
    return link;
  }
}

// `/maps/place/<name>/@lat,lng,zoom/data=...` is what short links resolve
// to. Unlike the plain `/maps?q=` search form, `/maps/place/...` responses
// carry `X-Frame-Options: SAMEORIGIN` even with `output=embed` appended —
// Google blocks it from being framed. The only working embed path is the
// text-search form, so pull the place name back out and search for it
// instead of embedding the place URL directly.
function placeNameFromPath(pathname: string): string | null {
  const match = pathname.match(/\/maps\/place\/([^/]+)/);
  if (!match) return null;
  return decodeURIComponent(match[1].replace(/\+/g, " "));
}

function toEmbedSrc(link: string): string | null {
  try {
    const url = new URL(link);
    const isGoogleMapsHost = url.hostname.includes("google.") || url.hostname.includes("goo.gl");
    if (!isGoogleMapsHost) return null;

    if (url.pathname.includes("/maps/embed")) return url.toString();

    const placeName = placeNameFromPath(url.pathname);
    if (placeName) {
      return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
    }

    url.searchParams.set("output", "embed");
    return url.toString();
  } catch {
    return null;
  }
}

function isShortLink(link: string): boolean {
  try {
    const { hostname } = new URL(link);
    return hostname === "goo.gl" || hostname === "maps.app.goo.gl";
  } catch {
    return false;
  }
}

export async function toGoogleMapsEmbedSrc(
  link: string | null | undefined,
  fallbackQuery: string,
): Promise<string> {
  const fallback = `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
  if (!link) return fallback;

  const resolvedLink = isShortLink(link) ? await resolveShortLink(link) : link;
  return toEmbedSrc(resolvedLink) ?? fallback;
}
