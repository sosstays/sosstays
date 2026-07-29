import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = "2026-07-25";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // false: always hit the live API rather than the CDN, so server-rendered
  // pages never show stale content. Fine at our current traffic level;
  // revisit (set true) if request volume grows and a few seconds of
  // staleness becomes an acceptable trade for speed.
  useCdn: false,
});
