import { createClient } from "next-sanity";
import { MARKET } from "@/lib/market";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = "2026-07-25";

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // false: always hit the live API rather than the CDN, so server-rendered
  // pages never show stale content. Fine at our current traffic level;
  // revisit (set true) if request volume grows and a few seconds of
  // staleness becomes an acceptable trade for speed.
  useCdn: false,
});

// Every query is scoped to this build's market via the `$market` GROQ
// parameter (see queries.ts), so it's injected here once rather than
// threaded through every call site. A caller can still pass its own
// `market` param to override.
const rawFetch = sanityClient.fetch.bind(sanityClient);
sanityClient.fetch = ((query: string, params: Record<string, unknown> = {}, options?: unknown) =>
  (rawFetch as (...args: unknown[]) => unknown)(query, { market: MARKET, ...params }, options)) as typeof sanityClient.fetch;

export const client = sanityClient;
