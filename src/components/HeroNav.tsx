"use client";

import { useState } from "react";
import Link from "next/link";

// Transparent nav overlaid on a page's hero image. Used instead of the
// site-wide sticky Header on pages built with the hero-image treatment
// (see Header.tsx's pathname opt-out).
//
// "home" variant uses in-page anchors (the homepage embeds each section
// on itself); "page" variant links to the real routes, since other pages
// don't have those sections on-page.
export function HeroNav({ variant = "page" }: { variant?: "home" | "page" }) {
  const [open, setOpen] = useState(false);

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
    <nav className="absolute inset-x-0 top-0 z-20 px-8 py-9 sm:px-14">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-serif text-sm font-semibold tracking-widest text-cream uppercase"
        >
          sos stays
        </Link>

        <div className="flex items-center gap-4 sm:gap-10">
          <div className="hidden items-center gap-7 sm:flex sm:gap-10">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-cream transition-opacity hover:opacity-75"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href={ctaHref}
            className="rounded-full border border-cream px-4 py-2 text-xs font-medium whitespace-nowrap text-cream transition-opacity hover:opacity-80 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Send your SOS
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-8 w-8 flex-none items-center justify-center text-cream sm:hidden"
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
        <div className="mt-4 flex flex-col gap-1 rounded-[10px] bg-forest-green/95 p-3 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[6px] px-3 py-3 text-sm font-medium text-cream transition-opacity hover:opacity-75"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
