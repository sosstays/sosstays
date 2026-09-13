// Search bar location options. `label` is what guests see and what ends
// up in the URL/search summary; `city` is the exact value Uplisting's
// /availability endpoint matches against (a case-sensitive exact match on
// the listing's city attribute, confirmed against the live API — so it
// won't match a county name like "Wexford" even though that's the more
// recognisable label for a listing whose PMS city is actually "Ferns").
export const SEARCH_LOCATIONS: { label: string; city: string }[] = [
  { label: "Drogheda", city: "Drogheda" },
  { label: "Wexford", city: "Ferns" },
];

export function resolveSearchCity(location?: string): string | undefined {
  if (!location) return location;
  return SEARCH_LOCATIONS.find((l) => l.label === location)?.city ?? location;
}
