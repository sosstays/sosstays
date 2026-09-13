import { HeroNav } from "@/components/HeroNav";
import { getGuestSiteNavLinks } from "@/lib/navLinks";

// Nav lives here (rather than in page.tsx) so it stays put while
// loading.tsx's fallback swaps in and out during the search fetch —
// only the content below it should flash to the loading state.
export default async function SearchLayout({ children }: { children: React.ReactNode }) {
  const siteNavLinks = await getGuestSiteNavLinks();
  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      {children}
    </>
  );
}
