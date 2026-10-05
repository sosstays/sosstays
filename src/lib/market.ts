// Which market this build of the site serves. One codebase, two sites:
// sosstays.com builds with SITE_MARKET=ie (the default, so existing builds
// and local dev are unchanged), sosstays.in will build with SITE_MARKET=in.
export type Market = "ie" | "in";

const raw = process.env.SITE_MARKET;
export const MARKET: Market = raw === "in" ? "in" : "ie";
