"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Nav overlaid on a page's hero image/section, with its own solid cream
// background bar so it reads the same regardless of what's behind it
// (hero image, maroon section, etc). Used instead of the site-wide sticky
// Header on pages built with the hero-image treatment (see Header.tsx's
// pathname opt-out).
//
// "home" variant uses in-page anchors (the homepage embeds each section
// on itself); "page" variant links to the real routes, since other pages
// don't have those sections on-page.
export function HeroNav({
  variant = "page",
  accent = "forest-green",
}: {
  variant?: "home" | "page";
  accent?: "forest-green" | "maroon";
}) {
  const [open, setOpen] = useState(false);
  const linkColorClass = accent === "maroon" ? "text-maroon" : "text-forest-green";
  const accentBorder = accent === "maroon" ? "border-maroon/30" : "border-forest-green/30";

  const links =
    variant === "home"
      ? [
          { href: "#stays", label: "Stays" },
          { href: "#areas", label: "Area guides" },
          { href: "/blog", label: "Blog" },
          { href: "#landlords", label: "For landlords" },
        ]
      : [
          { href: "/stays", label: "Stays" },
          { href: "/areas", label: "Area guides" },
          { href: "/blog", label: "Blog" },
          { href: "/landlords", label: "For landlords" },
        ];
  const ctaHref = variant === "home" ? "#stays" : "/stays";

  return (
    <nav className="absolute inset-x-0 top-0 z-20 border-b border-[#E2E2DC] bg-cream/95 px-8 py-5 backdrop-blur sm:px-14">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Sos Stays" width={126} height={80} className="h-10 w-auto" priority />
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
          <Link
            href={ctaHref}
            className={`rounded-full border ${accentBorder} px-4 py-2 text-xs font-medium whitespace-nowrap text-near-black transition-opacity hover:opacity-70 sm:px-5 sm:py-2.5 sm:text-sm`}
          >
            Send your SOS
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-8 w-8 flex-none items-center justify-center text-near-black sm:hidden"
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
        <div className="mt-4 flex flex-col gap-1 rounded-[10px] border border-[#E2E2DC] bg-cream p-3 sm:hidden">
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
