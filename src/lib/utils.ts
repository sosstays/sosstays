import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared by the checkout flow (BookingCheckout, BookingSummaryCard) — every
// amount there comes from Uplisting/Stripe in the same { amount, currency }
// shape, so this is the one place that formatting lives.
export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}
