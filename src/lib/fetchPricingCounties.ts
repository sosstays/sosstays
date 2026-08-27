import { client } from "@/sanity/client";
import { COUNTY_PRICING_STATS_QUERY } from "@/sanity/queries";
import { buildCounties, type County } from "@/lib/pricingCounties";

export async function getPricingCounties(): Promise<County[]> {
  const rows = await client.fetch(COUNTY_PRICING_STATS_QUERY);
  const liveStatsByCounty = Object.fromEntries(
    rows.map(({ county, faqs, ...stats }) => [county, { ...stats, faqs: faqs ?? [] }])
  );
  return buildCounties(liveStatsByCounty);
}
