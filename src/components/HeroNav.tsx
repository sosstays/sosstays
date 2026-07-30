"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { NavLink } from "@/lib/navLinks";

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
  const ctaClass = isLandlords
    ? "rounded-full bg-cream px-4 py-2 text-xs font-semibold whitespace-nowrap text-maroon transition-opacity hover:opacity-80 sm:px-5 sm:py-2.5 sm:text-sm"
    : "rounded-full border border-forest-green/30 px-4 py-2 text-xs font-medium whitespace-nowrap text-forest-green transition-opacity hover:opacity-70 sm:px-5 sm:py-2.5 sm:text-sm";
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
                className={`text-sm font-medium transition-opacity hover:opacity-70 ${linkColorClass}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {ctaHref && ctaLabel && (
            <Link href={ctaHref} className={ctaClass}>
              {ctaLabel}
            </Link>
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
              onClick={() => setOpen(false)}
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
