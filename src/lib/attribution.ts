// Marketing attribution: where a visitor first came from. Captured once in
// the browser (AttributionCapture) into a first-party cookie, then read
// server-side so lead forms and Stripe checkouts can record it without every
// form having to pass it along. GA4 does its own session attribution inside
// GTM; this copy exists so the source also lives on the lead/order itself.

export const ATTRIBUTION_COOKIE = "sos_attr";
export const ATTRIBUTION_MAX_AGE_DAYS = 90;

export type Attribution = {
  /** utm_source, or the referring hostname, or "direct". */
  source: string;
  /** utm_medium, or "referral" / "organic" / "none". */
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  /** Google / Meta / Microsoft click ids — mark the visit as paid. */
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  msclkid?: string;
  /** External referrer hostname, if any. */
  referrer?: string;
  /** First page the visitor landed on (path only). */
  landing_page: string;
  /** ISO timestamp of that first visit. */
  first_seen: string;
};

const SEARCH_ENGINES = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|baidu|yandex)\./i;
const SOCIAL = /(^|\.)(facebook|instagram|l\.instagram|t|twitter|x|linkedin|youtube|tiktok|pinterest|lnkd)\./i;

/** Derives attribution from a landing URL + document.referrer. Pure, for testing. */
export function deriveAttribution(
  url: URL,
  referrer: string,
  ownHostname: string,
  now = new Date(),
): Attribution {
  const q = url.searchParams;
  const get = (k: string) => q.get(k)?.trim().slice(0, 200) || undefined;

  let refHost: string | undefined;
  try {
    const h = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
    if (h && h !== ownHostname.replace(/^www\./, "")) refHost = h;
  } catch {
    /* malformed referrer — treat as direct */
  }

  const clickIds = {
    gclid: get("gclid"),
    gbraid: get("gbraid"),
    wbraid: get("wbraid"),
    fbclid: get("fbclid"),
    msclkid: get("msclkid"),
  };
  const paid = Boolean(clickIds.gclid || clickIds.gbraid || clickIds.wbraid || clickIds.msclkid);

  const utmSource = get("utm_source");
  const utmMedium = get("utm_medium");

  let source = utmSource;
  let medium = utmMedium;
  if (!source) {
    if (clickIds.gclid || clickIds.gbraid || clickIds.wbraid) source = "google";
    else if (clickIds.msclkid) source = "bing";
    else if (clickIds.fbclid) source = "facebook";
    else source = refHost ?? "direct";
  }
  if (!medium) {
    if (paid) medium = "cpc";
    else if (clickIds.fbclid) medium = "paid_social";
    else if (refHost) medium = SEARCH_ENGINES.test(refHost) ? "organic" : SOCIAL.test(refHost) ? "social" : "referral";
    else medium = "none";
  }

  return {
    source,
    medium,
    campaign: get("utm_campaign"),
    term: get("utm_term"),
    content: get("utm_content"),
    ...clickIds,
    referrer: refHost,
    landing_page: url.pathname.slice(0, 200),
    first_seen: now.toISOString(),
  };
}

/** A visit that carries its own campaign signal (UTMs or a click id). */
export function hasCampaignSignal(url: URL): boolean {
  const q = url.searchParams;
  return ["utm_source", "utm_medium", "utm_campaign", "gclid", "gbraid", "wbraid", "fbclid", "msclkid"].some((k) =>
    q.has(k),
  );
}

export function serializeAttribution(a: Attribution): string {
  // Drop undefined so the cookie stays small (4KB cap) and the JSON clean.
  return encodeURIComponent(JSON.stringify(a));
}

export function parseAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Attribution>;
    if (!parsed || typeof parsed.source !== "string" || typeof parsed.medium !== "string") return null;
    return parsed as Attribution;
  } catch {
    return null;
  }
}

/**
 * Flat, length-capped key/value form for Stripe metadata (max 50 keys, 500
 * chars per value). Keys are prefixed so they never collide with booking keys.
 */
export function attributionToStripeMetadata(a: Attribution | null): Record<string, string> {
  if (!a) return {};
  const out: Record<string, string> = {};
  const set = (k: string, v?: string) => {
    if (v) out[`attr_${k}`] = v.slice(0, 200);
  };
  set("source", a.source);
  set("medium", a.medium);
  set("campaign", a.campaign);
  set("term", a.term);
  set("content", a.content);
  set("referrer", a.referrer);
  set("landing_page", a.landing_page);
  set("first_seen", a.first_seen);
  set("gclid", a.gclid);
  return out;
}
