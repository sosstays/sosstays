import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Where Supabase redirects after a guest clicks their magic link. Exchanges
// the one-time code for a session (setting the auth cookies via the server
// client) and sends them on to wherever they were headed.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account/login?error=auth`);
}
