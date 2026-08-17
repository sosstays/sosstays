import { client } from "../../sanity/client";
import { SYNCABLE_PROPERTIES_QUERY } from "../../sanity/queries";
import { fetchUplistingProperties } from "../uplisting/client";

export type ResolvedProperty = {
  sanityId: string;
  name: string;
  uplistingPropertyId: string; // numeric ID — what calendar/webhook calls use
};

/**
 * Joins Sanity's property pages (identified by uplistingPropertySlug) with
 * Uplisting's own property list (identified by numeric id + property_slug)
 * to find the numeric ID each Sanity page's calendar should sync under.
 *
 * Sanity pages whose slug has no match in Uplisting are skipped and
 * logged — likely a typo'd slug or a listing removed from Uplisting.
 */
export async function resolveSyncableProperties(): Promise<ResolvedProperty[]> {
  const [sanityProperties, uplistingProperties] = await Promise.all([
    client.fetch(SYNCABLE_PROPERTIES_QUERY),
    fetchUplistingProperties(),
  ]);

  const bySlug = new Map(uplistingProperties.map((p) => [p.slug, p]));
  const resolved: ResolvedProperty[] = [];

  for (const property of sanityProperties) {
    const match = bySlug.get(property.uplistingPropertySlug);
    if (!match) {
      console.warn(
        `No Uplisting property found for slug "${property.uplistingPropertySlug}" (Sanity property "${property.name}")`
      );
      continue;
    }
    resolved.push({ sanityId: property._id, name: property.name, uplistingPropertyId: match.id });
  }

  return resolved;
}
