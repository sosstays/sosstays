import { createBrowserClient } from "@supabase/ssr";

// Browser-side client for Client Components (e.g. the login form). Uses the
// anon key — RLS policies in the guests/bookings/properties tables scope
// what a signed-in guest can actually read.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
