"use client";

import { useState } from "react";
import Link from "next/link";
import { countiesForRegion, type County, type Region } from "@/lib/pricingCounties";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const REGION_TABS: { value: Region; label: string }[] = [
  { value: "roi", label: "Republic of Ireland" },
  { value: "ni", label: "Northern Ireland" },
];

export function CitySelectDropdown({ counties: allCounties }: { counties: County[] }) {
  const [region, setRegion] = useState<Region>("roi");
  const counties = countiesForRegion(allCounties, region);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2.5 rounded-full border border-cream/30 bg-cream/10 px-6 py-3.5 text-sm font-semibold text-cream transition-colors outline-none hover:bg-cream/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream">
        Select your city
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-3.5 w-3.5 flex-none transition-transform data-[state=open]:rotate-180"
        >
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center">
        <Tabs value={region} onValueChange={(v) => setRegion(v as Region)}>
          <TabsList className="flex border-b border-sage-grey/30">
            {REGION_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                // Stop the trigger's own click handler from bubbling to
                // Radix's DropdownMenu.Content, which treats any click
                // inside it as a selection and closes the whole menu —
                // this row is a sub-picker, not an item to select.
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-3 py-3 text-[13px] font-semibold whitespace-nowrap text-near-black opacity-65 transition-colors data-[state=active]:bg-light-forest-green data-[state=active]:text-maroon data-[state=active]:opacity-100"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ul className="max-h-72 overflow-auto py-1.5">
          {counties.map((county) => (
            <li key={county.slug}>
              <DropdownMenuItem asChild>
                <Link
                  href={`/pricing/${county.slug}`}
                  className="flex items-center justify-between px-4 py-2.5 text-[14.5px] text-near-black transition-colors hover:bg-forest-green/10"
                >
                  <span>{county.name}</span>
                  {county.state === "live" && (
                    <span className="text-[10px] font-semibold tracking-wide text-forest-green uppercase">
                      Live data
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
