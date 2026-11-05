// Applies the editor-set display order (siteSettings.propertyOrder, a
// drag-reorderable array of propertyPage references — see
// PROPERTY_ORDER_QUERY) to a fetched list of properties. Anything not
// included in that order keeps appearing, just after the ordered ones,
// alphabetically by name — so a newly added property is never silently
// dropped from a listing just because no one has placed it yet.
export function orderProperties<T extends { slug?: string; name: string }>(
  properties: T[],
  orderedSlugs: string[] | null | undefined
): T[] {
  if (!orderedSlugs || orderedSlugs.length === 0) return properties;

  const rank = new Map(orderedSlugs.map((slug, i) => [slug, i]));
  return [...properties].sort((a, b) => {
    const rankA = a.slug ? rank.get(a.slug) : undefined;
    const rankB = b.slug ? rank.get(b.slug) : undefined;
    if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
    if (rankA !== undefined) return -1;
    if (rankB !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });
}
