import { client } from "@/sanity/client";
import { LLMS_TXT_QUERY } from "@/sanity/queries";

const SITE_URL = "https://sosstays.com";

// Legal/commercial facts that live in the real world, not the CMS —
// update here if they change, no Sanity field for these.
const CRO_NUMBER = "746631";
const COMMISSION_RANGE = "20–30% of gross booking revenue (nightly rate only, cleaning fees excluded)";
const MAINTENANCE_AUTHORITY_EUR = 250;
const REGISTER_OPEN_DATE = "1 December 2026";
const REGISTER_DEADLINE = "31 December 2026";

type Entry = { _type: string; href: string; title: string; summary: string };

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  youtube: "YouTube",
  tripadvisor: "TripAdvisor",
  whatsapp: "WhatsApp",
};

function linkLine(title: string, href: string, summary?: string) {
  const label = title || href;
  const line = `- [${label}](${SITE_URL}${href})`;
  return summary ? `${line} — ${summary}` : line;
}

export async function GET() {
  const { settings, entries } = await client.fetch(LLMS_TXT_QUERY);

  const siteName = settings?.siteName || "Sos Stays";
  const businessName = settings?.businessName || "Power Rangers Limited";
  const contactEmail = settings?.contactEmail || "info@sosstays.com";
  const socialLinks: { platform: string; url: string }[] = settings?.socialLinks || [];

  const byType = new Map<string, Entry[]>();
  for (const entry of entries as Entry[]) {
    const list = byType.get(entry._type) ?? [];
    list.push(entry);
    byType.set(entry._type, list);
  }

  const stays = byType.get("propertyPage") ?? [];
  const landlordPages = byType.get("landlordPage") ?? [];

  const guestLines = [
    `- [Browse stays](${SITE_URL}/#stays)`,
    ...stays.map((s) => linkLine(s.title, s.href, s.summary)),
    `- [Area guides](${SITE_URL}/areas) — local guides to the regions Sos Stays covers`,
    `- [Blog](${SITE_URL}/blog) — stories and guides for the region`,
  ].join("\n");

  const landlordLines = [
    `- Commission: ${COMMISSION_RANGE}`,
    `- No setup fee, no monthly retainer — commission-only, paid only when the property earns`,
    `- Maintenance authority up to €${MAINTENANCE_AUTHORITY_EUR} per instance without owner approval`,
    `- Owners can block off personal-use dates at any time, with no minimum commitment`,
    ...landlordPages.map((l) => linkLine(l.title, l.href, l.summary)),
    `- [Free revenue estimate](${SITE_URL}/calculator)`,
  ].join("\n");

  const socialLines = socialLinks
    .map((s) => `- ${SOCIAL_LABELS[s.platform] || s.platform}: ${s.url}`)
    .join("\n");

  const body = `# ${siteName}

> Short-term rental property management and direct-booking holiday stays across Ireland.

## Overview
${siteName} (${businessName}, CRO ${CRO_NUMBER}) is a full-service short-term rental property management company operating across the island of Ireland. Sos manages properties end-to-end on behalf of owners — guest communication, pricing, cleaning coordination, and maintenance — for a commission on what the property earns, with no setup fee or monthly retainer. Guests can book directly through ${SITE_URL.replace("https://", "")} or via Airbnb, Booking.com, and Vrbo. "Sós" is the Irish word for a break.

## For Guests
Sos Stays lists real, individually managed properties — not a marketplace of unmanaged listings. Every property is properly looked after, with self check-in, stocked kitchens, and direct guest support.

${guestLines}

## For Property Owners / Landlords
Sos Stays manages properties for self-managing Airbnb and short-term rental hosts across Ireland who want full management without giving up ownership or control.

${landlordLines}

## Coverage Area
Ireland-wide — Sos Stays manages properties across the island of Ireland, with an established base of managed properties in Co. Louth, Co. Meath, and Co. Down.

## Regulatory Context
Ireland's Short-Term Letting Register (Fáilte Ireland) opens for registration ${REGISTER_OPEN_DATE}, with a compliance deadline of ${REGISTER_DEADLINE}.

## Contact
- Website: ${SITE_URL}
- Email: ${contactEmail}
${socialLines}

## Links
- Sitemap: ${SITE_URL}/sitemap.xml
- Privacy policy: ${SITE_URL}/privacy-policy
- Terms & conditions: ${SITE_URL}/terms-and-conditions
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
