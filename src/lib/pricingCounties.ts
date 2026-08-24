export type Region = "roi" | "ni";
export type CountyState = "live" | "expanding";

export type CountyStats = {
  adr: number;
  occupancy: number;
  monthlyRevenue: number;
  bestMonth: string;
  uplift: string;
};

export type County = {
  slug: string;
  name: string;
  region: Region;
  state: CountyState;
  stats?: CountyStats;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ROI_COUNTY_NAMES = [
  "Carlow",
  "Cavan",
  "Clare",
  "Cork",
  "Donegal",
  "Dublin",
  "Galway",
  "Kerry",
  "Kildare",
  "Kilkenny",
  "Laois",
  "Leitrim",
  "Limerick",
  "Longford",
  "Louth",
  "Mayo",
  "Meath",
  "Monaghan",
  "Offaly",
  "Roscommon",
  "Sligo",
  "Tipperary",
  "Waterford",
  "Westmeath",
  "Wexford",
  "Wicklow",
];

const NI_COUNTY_NAMES = ["Antrim", "Armagh", "Down", "Fermanagh", "Derry / Londonderry", "Tyrone"];

// Real per-county stats come from the countyPricingStats document type in
// Sanity (query: COUNTY_PRICING_STATS_QUERY) — only counties with a
// `live == true` document there get real numbers and the "live data"
// badge. Everything else falls back to the honest "expanding" state. See
// the honesty-in-projections principle: never hardcode fabricated figures
// here.
export function buildCounties(liveStatsByCounty: Record<string, CountyStats>): County[] {
  const build = (names: string[], region: Region): County[] =>
    names.map((name) => {
      const stats = liveStatsByCounty[name];
      return { slug: slugify(name), name, region, state: stats ? "live" : "expanding", stats };
    });

  return [...build(ROI_COUNTY_NAMES, "roi"), ...build(NI_COUNTY_NAMES, "ni")];
}

export function countiesForRegion(counties: County[], region: Region): County[] {
  return counties.filter((c) => c.region === region);
}
