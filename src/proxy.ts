import { NextResponse, type NextRequest } from "next/server";

// Applies the "Redirect" documents editors manage in Sanity (from path ->
// to path), so a slug can be renamed without breaking its old URL and
// without a code change or redeploy.
//
// Reads Sanity over plain fetch rather than the shared client: Proxy runs
// separately from the app's render code and shouldn't pull in its modules.

type Redirect = { from?: string | null; to?: string | null; permanent?: boolean | null };

const QUERY = '*[_type == "redirect" && defined(from) && defined(to)]{from, to, permanent}';
const CACHE_MS = 60_000;

let cache: { at: number; map: Map<string, Redirect> } | null = null;

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

async function loadRedirects(): Promise<Map<string, Redirect>> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.map;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  try {
    const res = await fetch(
      `https://${projectId}.apicdn.sanity.io/v2026-07-25/data/query/${dataset}?query=${encodeURIComponent(QUERY)}`,
      { signal: AbortSignal.timeout(2000) }
    );
    if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
    const { result } = (await res.json()) as { result?: Redirect[] };
    const map = new Map<string, Redirect>();
    for (const r of result ?? []) {
      if (r.from?.startsWith("/") && r.to?.startsWith("/")) map.set(normalize(r.from), r);
    }
    cache = { at: Date.now(), map };
    return map;
  } catch {
    // Never let a Sanity hiccup take pages down — serve the last known
    // list (or none) and try again on a later request.
    cache = { at: Date.now(), map: cache?.map ?? new Map() };
    return cache.map;
  }
}

export async function proxy(request: NextRequest) {
  const path = normalize(request.nextUrl.pathname);
  const redirect = (await loadRedirects()).get(path);
  if (!redirect?.to || normalize(redirect.to) === path) return NextResponse.next();
  const destination = new URL(redirect.to, request.url);
  if (!destination.search) destination.search = request.nextUrl.search;
  return NextResponse.redirect(destination, redirect.permanent === false ? 307 : 308);
}

export const config = {
  // Pages only — skip API routes, Next internals and anything with a file
  // extension (images, sitemap.xml, robots.txt, llms.txt).
  matcher: ["/((?!api/|_next/|oauth/|.*\\.[^/]+$).*)"],
};
