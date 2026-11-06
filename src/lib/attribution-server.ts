import { cookies } from "next/headers";
import { ATTRIBUTION_COOKIE, parseAttribution, type Attribution } from "@/lib/attribution";

/** The visitor's first-touch attribution, from the cookie set by AttributionCapture. */
export async function readAttribution(): Promise<Attribution | null> {
  try {
    const jar = await cookies();
    return parseAttribution(jar.get(ATTRIBUTION_COOKIE)?.value);
  } catch {
    // Called outside a request scope (e.g. a webhook) — nothing to read.
    return null;
  }
}
