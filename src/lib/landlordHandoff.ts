// Carries the name/email a landlord already gave us in the contact form
// across the redirect to /landlords-whats-next, so the revenue calculator
// there doesn't have to ask for them again. sessionStorage keeps it out of
// the URL/history and clears itself once the tab closes.

const STORAGE_KEY = "sosstays:landlord-contact";

export type LandlordContact = { name: string; email: string };

export function saveLandlordContact(contact: LandlordContact) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
  } catch {
    // sessionStorage can throw in private-browsing edge cases — the
    // calculator just falls back to asking for name/email itself.
  }
}

export function readLandlordContact(): LandlordContact | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name === "string" && typeof parsed?.email === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
