// Landing page for the one-time interactive Authorization Code + PKCE step
// used to obtain UPLISTING_OAUTH_REFRESH_TOKEN (see src/lib/uplisting.ts).
// Uplisting redirects here with ?code=... after the account owner approves
// access; this just surfaces the code so it can be pasted into the "2.
// Exchange code for token" request in the Postman collection. Not part of
// any user-facing flow — nothing in the app links to this page.

type Props = { searchParams: Promise<{ code?: string; error?: string; error_description?: string }> };

export default async function UplistingOAuthCallbackPage({ searchParams }: Props) {
  const { code, error, error_description } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 bg-cream px-8 text-center font-sans text-near-black">
      <h1 className="font-serif text-2xl font-bold text-forest-green">Uplisting OAuth callback</h1>

      {error && (
        <div className="w-full rounded-[10px] border border-error-red/40 p-6">
          <p className="mb-2 font-semibold text-error-red">{error}</p>
          {error_description && <p className="text-[15px] text-near-black/70">{error_description}</p>}
        </div>
      )}

      {code && (
        <div className="w-full rounded-[10px] border border-sage-grey/40 p-6">
          <p className="mb-3 text-[15px] text-near-black/70">
            Copy this into the &quot;2. Exchange code for token&quot; request&apos;s <code>code</code>{" "}
            field (along with the <code>code_verifier</code> from step 1):
          </p>
          <code className="block overflow-x-auto rounded-[6px] bg-light-sage/25 p-3 text-left text-[13px] break-all">
            {code}
          </code>
        </div>
      )}

      {!code && !error && (
        <p className="text-[15px] text-near-black/60">
          Waiting for a code — this page is only useful when Uplisting redirects here after the
          authorization step.
        </p>
      )}
    </main>
  );
}
