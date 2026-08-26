"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { countiesForRegion, type County, type Region } from "@/lib/pricingCounties";

const REGION_TABS: { value: Region; label: string }[] = [
  { value: "roi", label: "Republic of Ireland" },
  { value: "ni", label: "Northern Ireland" },
];

export function CitySelectDropdown({ counties: allCounties }: { counties: County[] }) {
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState<Region>("roi");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const counties = countiesForRegion(allCounties, region);

  return (
    <div ref={rootRef} className="relative mx-auto inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2.5 rounded-full border border-cream/30 bg-cream/10 px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/15"
      >
        Select your city
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className={`h-3.5 w-3.5 flex-none transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 z-30 mt-3 w-[calc(100vw-2rem)] max-w-[320px] -translate-x-1/2 overflow-hidden rounded-[14px] border border-sage-grey/40 bg-cream text-left shadow-[0_16px_36px_rgba(23,25,23,0.25)] sm:max-w-[380px]">
          <div className="flex border-b border-sage-grey/30">
            {REGION_TABS.map((tab) => {
              const active = region === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setRegion(tab.value)}
                  className="flex-1 cursor-pointer px-3 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors"
                  style={{
                    color: active ? "var(--maroon)" : "var(--near-black)",
                    background: active ? "var(--light-forest-green)" : "transparent",
                    opacity: active ? 1 : 0.65,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <ul className="max-h-72 overflow-auto py-1.5">
            {counties.map((county) => (
              <li key={county.slug}>
                <Link
                  href={`/pricing/${county.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-[14.5px] text-near-black transition-colors hover:bg-forest-green/10"
                >
                  <span>{county.name}</span>
                  {county.state === "live" && (
                    <span className="text-[10px] font-semibold tracking-wide text-forest-green uppercase">
                      Live data
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
