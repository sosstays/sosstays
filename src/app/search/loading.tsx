// Next.js shows this automatically while page.tsx's async work (the
// Sanity + Uplisting fetches) is in flight — no client-side fetch or
// timer needed, since the form submit is a real page navigation.
export default function SearchLoading() {
  return (
    <main className="flex-1 bg-cream">
      <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-8 text-center sm:px-14">
        <p className="mb-6 font-serif text-2xl font-semibold text-forest-green italic sm:text-3xl">
          Finding the best deals for you…
        </p>
        <div className="relative h-2 w-64 overflow-hidden rounded-full bg-light-forest-green sm:w-80">
          <span className="sos-search-loading-bar absolute inset-y-0 w-1/3 rounded-full bg-forest-green" />
        </div>
      </div>
    </main>
  );
}
