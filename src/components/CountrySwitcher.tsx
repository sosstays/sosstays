"use client";

import { createContext, useContext } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Country = { label: string; code: string; market: string; url: string };

type CountryContextValue = { countries: Country[]; currentMarket: string };

// Filled once in the root layout (the list comes from Sanity's shared
// "Country Switcher" document), so every page's <HeroNav> can read it
// without each page having to fetch and pass it down.
const CountryContext = createContext<CountryContextValue>({ countries: [], currentMarket: "" });

export function CountryProvider({
  countries,
  currentMarket,
  children,
}: CountryContextValue & { children: React.ReactNode }) {
  return <CountryContext value={{ countries, currentMarket }}>{children}</CountryContext>;
}

// Header dropdown that sends visitors to the other country's own site (a
// full cross-domain navigation — each market is a separate deployment).
// Lands on the other site's homepage: slugs differ per market, so the
// current path rarely exists there.
export function CountrySwitcher({
  colorClass,
  panel = false,
}: {
  colorClass: string;
  // true = rendered as an inline list inside the mobile menu panel
  panel?: boolean;
}) {
  const { countries, currentMarket } = useContext(CountryContext);
  if (countries.length < 2) return null;

  const current = countries.find((c) => c.market === currentMarket) ?? countries[0];

  if (panel) {
    return (
      <div className="mt-1 border-t border-current/15 pt-2">
        <p className={`px-3 pb-1 text-xs font-medium uppercase tracking-wide opacity-60 ${colorClass}`}>
          Country
        </p>
        {countries.map((c) => (
          <a
            key={c.market}
            href={c.url}
            className={`flex items-center justify-between rounded-[6px] px-3 py-3 text-sm font-medium transition-opacity hover:opacity-70 ${colorClass}`}
          >
            {c.label}
            {c.market === current.market && <Check size={16} aria-hidden="true" />}
          </a>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Country: ${current.label}. Change country`}
        className={`hidden items-center gap-1.5 rounded-full text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 sm:flex ${colorClass}`}
      >
        <Globe size={16} strokeWidth={1.6} aria-hidden="true" />
        {current.code}
        <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={16} className="w-48 p-1.5">
        {countries.map((c) => (
          <DropdownMenuItem key={c.market} asChild>
            <a
              href={c.url}
              className="flex cursor-pointer items-center justify-between rounded-[8px] px-3 py-2.5 text-sm font-medium text-forest-green data-[highlighted]:bg-light-forest-green"
            >
              {c.label}
              {c.market === current.market && <Check size={16} aria-hidden="true" />}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
