export type UplistingCalendarDay = {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  minStay?: number;
};

export type UplistingCalendarResponse = {
  propertyId: string;
  days: UplistingCalendarDay[];
};
