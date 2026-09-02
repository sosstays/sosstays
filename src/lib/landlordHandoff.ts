// Shared shape for the name/email a landlord gives in the lead form, handed
// straight to the revenue calculator further down the same /landlords page
// (see LandlordSosAndEstimate) so it doesn't have to ask for them again.
export type LandlordContact = { name: string; email: string };
