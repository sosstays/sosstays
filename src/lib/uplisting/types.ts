export type UplistingCalendarDay = {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  minStay?: number;
};

export type UplistingProperty = {
  id: string; // Uplisting's numeric property ID — used for calendar/webhook lookups
  slug: string; // property_slug — matches Sanity's uplistingPropertySlug field
  name: string;
};
