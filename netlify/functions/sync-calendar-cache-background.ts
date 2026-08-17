import type { Config } from "@netlify/functions";
import { syncAllProperties } from "../../src/lib/calendar/sync";

// Named "-background" so Netlify runs it as a Background Function (up to
// 15 min execution) instead of the 10s limit on regular functions — a
// full staggered sync across every property can take a few minutes.
async function syncCalendarCache() {
  const results = await syncAllProperties();
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error("calendar sync: some properties failed", failed);
  }
  console.log(`calendar sync: ${results.length - failed.length}/${results.length} properties synced`);
}

export default syncCalendarCache;

export const config: Config = {
  // Every 6 hours. Adjust once you know how often availability actually
  // changes for your listings — this is just a safe starting cadence
  // that stays far under Uplisting's rate limit either way.
  schedule: "0 */6 * * *",
};
