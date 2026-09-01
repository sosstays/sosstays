"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button, type ButtonColor } from "@/components/Button";
import type { NavLink } from "@/lib/navLinks";

type Variant = "default" | "landlords";

// One table entry per look, instead of the ternary cascade this used to be
// — a third nav context (a new variant) means one new row here instead of
// another cascade to extend, matching how Button's own BG_CLASS/TEXT_CLASS
// maps work.
const VARIANT_STYLES: Record<
  Variant,
  {
    navBg: string;
    navBorder: string;
    linkColor: string;
    logoColor: string;
    ctaSizeClass: string;
    iconColor: string;
    mobilePanelBg: string;
    mobilePanelBorder: string;
    ctaBgColor?: ButtonColor;
    ctaColor?: ButtonColor;
    ctaAnimateColor?: ButtonColor;
  }
> = {
  default: {
    navBg: "bg-cream/95",
    navBorder: "border-[#E2E2DC]",
    linkColor: "text-forest-green",
    logoColor: "text-forest-green",
    ctaSizeClass: "px-4 py-2 text-xs font-medium sm:px-5 sm:py-2.5 sm:text-sm",
    iconColor: "text-near-black",
    mobilePanelBg: "bg-cream",
    mobilePanelBorder: "border-[#E2E2DC]",
  },
  landlords: {
    navBg: "bg-maroon/95",
    navBorder: "border-maroon",
    linkColor: "text-cream",
    logoColor: "text-cream",
    ctaSizeClass: "px-4 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm",
    iconColor: "text-cream",
    mobilePanelBg: "bg-maroon",
    mobilePanelBorder: "border-cream/20",
    ctaBgColor: "cream",
    ctaColor: "maroon",
    ctaAnimateColor: "maroon",
  },
};

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
  variant?: Variant;
  sticky?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const styles = VARIANT_STYLES[variant];
  const positionClass = sticky ? "sticky top-0 z-40" : "absolute inset-x-0 top-0 z-20";

  return (
    <nav
      className={`${positionClass} border-b ${styles.navBorder} ${styles.navBg} px-8 py-5 backdrop-blur sm:px-14`}
    >
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center">
          <Logo className={`h-10 w-auto ${styles.logoColor}`} />
        </Link>

        <div className="flex items-center gap-4 sm:gap-10">
          <div className="hidden items-center gap-7 sm:flex sm:gap-10">
            {links.map((link) => (
              <Link
                key={`${link.href}::${link.label}`}
                href={link.href}
                onClick={(e) => handleHashNavClick(e, link.href)}
                className={`text-sm font-medium transition-opacity hover:opacity-70 ${styles.linkColor}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {ctaHref && ctaLabel && (
            <Button
              link={ctaHref}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleHashNavClick(e, ctaHref)}
              variant={styles.ctaBgColor ? "primary" : "secondary"}
              bgColor={styles.ctaBgColor}
              color={styles.ctaColor}
              animateColor={styles.ctaAnimateColor}
              size="custom"
              className={styles.ctaSizeClass}
            >
              {ctaLabel}
            </Button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`flex h-8 w-8 flex-none items-center justify-center ${styles.iconColor} sm:hidden`}
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
        <div
          className={`mt-4 flex flex-col gap-1 rounded-[10px] border ${styles.mobilePanelBorder} ${styles.mobilePanelBg} p-3 sm:hidden`}
        >
          {links.map((link) => (
            <Link
              key={`${link.href}::${link.label}`}
              href={link.href}
              onClick={(e) => {
                handleHashNavClick(e, link.href);
                setOpen(false);
              }}
              className={`rounded-[6px] px-3 py-3 text-sm font-medium transition-opacity hover:opacity-70 ${styles.linkColor}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
