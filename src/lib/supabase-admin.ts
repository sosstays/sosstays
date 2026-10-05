import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// Service-role client — server-only (API routes). RLS is on for every table
// with no public policies, so form submissions can only land via this key.
// Returns null when the key isn't configured so a missing env var degrades to
// "MailerLite only" instead of breaking every form.
export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}
