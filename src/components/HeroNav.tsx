"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import type { NavLink } from "@/lib/navLinks";

// Next.js's <Link> only scrolls on navigation when the resulting URL
// actually changes. If you're already on the target page and its hash
// already matches (e.g. you scrolled away manually, or clicked the same
// nav link twice), the URL doesn't change and clicking does nothing. Catch
// that case and scroll manually instead — every other case (different
// page, different hash) already works via normal Link navigation.
function handleHashNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return;

  // A bare "#foo" (no path prefix) always targets the current page — e.g.
  // LANDLORD_NAV_LINKS' "#faq" means "this page" on /landlords, not "/".
  // Only an explicit path prefix (like SITE_NAV_LINKS' "/#stays") should be
  // compared against a literal path.
  const path = href.slice(0, hashIndex) || window.location.pathname;
  const hash = href.slice(hashIndex);
  if (path !== window.location.pathname || hash !== window.location.hash) return;

  // Match the instant jump a real (changed) hash navigation already gets
  // elsewhere on the site, rather than introducing a different, smooth,
  // animated scroll just for this fallback case.
  e.preventDefault();
  document.getElementById(hash.slice(1))?.scrollIntoView();
}

// The one nav used on every page. On hero pages it's rendered inline inside
// the hero section as an absolutely-positioned overlay bar (pass nothing for
// `sticky` — the default); on plain pages with no hero to sit over, pass
// `sticky` so it renders in normal document flow instead, pinned to the top
// of the viewport on scroll.
//
// Callers own their link list and CTA — see @/lib/navLinks for the shared
// sets, so every page stays in sync instead of re-deriving links locally.
export function HeroNav({
  links,
  ctaHref,
  ctaLabel,
  variant = "default",
  sticky = false,
}: {
  links: NavLink[];
  ctaHref?: string;
  ctaLabel?: string;
  variant?: "default" | "landlords";
  sticky?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isLandlords = variant === "landlords";

  const navBg = isLandlords ? "bg-maroon/95" : "bg-cream/95";
  const navBorder = isLandlords ? "border-maroon" : "border-[#E2E2DC]";
  const linkColorClass = isLandlords ? "text-cream" : "text-forest-green";
  const logoColorClass = isLandlords ? "text-cream" : "text-forest-green";
  const ctaSizeClass = isLandlords
    ? "px-4 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm"
    : "px-4 py-2 text-xs font-medium sm:px-5 sm:py-2.5 sm:text-sm";
  const iconColor = isLandlords ? "text-cream" : "text-near-black";
  const mobilePanelBg = isLandlords ? "bg-maroon" : "bg-cream";
  const mobilePanelBorder = isLandlords ? "border-cream/20" : "border-[#E2E2DC]";
  const positionClass = sticky ? "sticky top-0 z-40" : "absolute inset-x-0 top-0 z-20";

  return (
    <nav className={`${positionClass} border-b ${navBorder} ${navBg} px-8 py-5 backdrop-blur sm:px-14`}>
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center">
          <Logo className={`h-10 w-auto ${logoColorClass}`} />
        </Link>

        <div className="flex items-center gap-4 sm:gap-10">
          <div className="hidden items-center gap-7 sm:flex sm:gap-10">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleHashNavClick(e, link.href)}
                className={`text-sm font-medium transition-opacity hover:opacity-70 ${linkColorClass}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {ctaHref && ctaLabel && (
            <Button
              link={ctaHref}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleHashNavClick(e, ctaHref)}
              variant={isLandlords ? "primary" : "secondary"}
              bgColor={isLandlords ? "cream" : undefined}
              color={isLandlords ? "maroon" : undefined}
              animateColor={isLandlords ? "maroon" : undefined}
              size="custom"
              className={ctaSizeClass}
            >
              {ctaLabel}
            </Button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`flex h-8 w-8 flex-none items-center justify-center ${iconColor} sm:hidden`}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4 4l12 12M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className={`mt-4 flex flex-col gap-1 rounded-[10px] border ${mobilePanelBorder} ${mobilePanelBg} p-3 sm:hidden`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                handleHashNavClick(e, link.href);
                setOpen(false);
              }}
              className={`rounded-[6px] px-3 py-3 text-sm font-medium transition-opacity hover:opacity-70 ${linkColorClass}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
