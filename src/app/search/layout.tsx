import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";

// Nav lives here (rather than in page.tsx) so it stays put while
// loading.tsx's fallback swaps in and out during the search fetch —
// only the content below it should flash to the loading state.
export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      {children}
    </>
  );
}
