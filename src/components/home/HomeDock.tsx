"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Home, ChevronUp } from "lucide-react";

export type DockLink = { label: string; href: string; note?: string | null };
export type DockMenu = { label: string; links: DockLink[] };

// The homepage's navigation: a pill fixed to the bottom of the screen
// instead of a row of links in the header. Each item opens its links in a
// sheet that rises above the bar. Content comes from the Sanity "homePage"
// singleton (dockMenus), with defaults supplied by the page.
export function HomeDock({ menus }: { menus: DockMenu[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open === null) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (menus.length === 0) return null;
  const current = open === null ? null : menus[open];

  return (
    <nav
      ref={ref}
      aria-label="Main menu"
      className="fixed bottom-4 left-1/2 z-40 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 font-sans"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {current && (
        <div
          id="home-dock-sheet"
          className="absolute right-0 bottom-[calc(100%+10px)] left-0 rounded-[22px] bg-bright-cream p-4 text-near-black shadow-[0_14px_40px_rgba(23,25,23,0.28)]"
        >
          <p className="mb-2 px-2.5 text-[11px] font-semibold tracking-widest text-forest-green uppercase">
            {current.label}
          </p>
          <ul>
            {current.links.map((link) => {
              const className =
                "flex items-center justify-between gap-4 rounded-xl px-2.5 py-2.5 text-[15px] transition-colors hover:bg-pale-sage";
              const inner = (
                <>
                  <span>{link.label}</span>
                  {link.note && <span className="text-xs text-near-black/55">{link.note}</span>}
                </>
              );
              return (
                <li key={`${link.href}-${link.label}`}>
                  {/^https?:\/\//.test(link.href) ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                      {inner}
                    </a>
                  ) : (
                    <Link href={link.href} onClick={() => setOpen(null)} className={className}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-0.5 rounded-full bg-forest-green p-1.5 text-cream shadow-[0_10px_30px_rgba(23,25,23,0.3)]">
        <Link
          href="/"
          aria-label="Home"
          onClick={() => {
            setOpen(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="rounded-full p-2.5 transition-colors hover:bg-cream/15 sm:px-3"
        >
          <Home strokeWidth={1.9} className="h-[18px] w-[18px]" aria-hidden />
        </Link>
        {menus.map((menu, i) => (
          <button
            key={menu.label}
            type="button"
            aria-expanded={open === i}
            aria-controls="home-dock-sheet"
            onClick={() => setOpen(open === i ? null : i)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-cream/15 sm:px-4 sm:text-sm ${
              open === i ? "bg-cream/15" : ""
            }`}
          >
            {menu.label}
            <ChevronUp
              strokeWidth={2}
              aria-hidden
              className={`hidden h-3.5 w-3.5 transition-transform sm:block ${open === i ? "rotate-180" : ""}`}
            />
          </button>
        ))}
      </div>
    </nav>
  );
}
