// Shared by every route's loading.tsx — Next wraps the page in a Suspense
// boundary that renders this while the route's own async Server Component
// (a client.fetch to Sanity) is still in flight, instead of leaving a blank
// page for however long that request takes.
export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-cream">
      <div
        aria-label="Loading"
        role="status"
        className="h-9 w-9 animate-spin rounded-full border-2 border-sage-grey/40 border-t-forest-green"
      />
    </div>
  );
}
