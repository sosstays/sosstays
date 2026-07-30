// Routes that render their own transparent overlay nav / minimal footer
// (see HeroNav.tsx, MinimalFooter.tsx) instead of the site-wide
// Header/Footer. Shared so Header.tsx and Footer.tsx stay in sync.
export function usesHeroChrome(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/" ||
    pathname.startsWith("/areas/") ||
    pathname.startsWith("/stays/") ||
    pathname === "/landlords" ||
    pathname.startsWith("/landlords/")
  );
}
