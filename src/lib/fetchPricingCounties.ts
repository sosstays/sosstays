import { client } from "@/sanity/client";
import { COUNTY_PRICING_STATS_QUERY } from "@/sanity/queries";
import { buildCounties, type County, type CountyStats } from "@/lib/pricingCounties";

type SanityCountyStat = { county: string } & CountyStats;

export async function getPricingCounties(): Promise<County[]> {
  const rows: SanityCountyStat[] = await client.fetch(COUNTY_PRICING_STATS_QUERY);
  const liveStatsByCounty = Object.fromEntries(
    rows.map(({ county, ...stats }) => [county, stats])
  );
  return buildCounties(liveStatsByCounty);
}
