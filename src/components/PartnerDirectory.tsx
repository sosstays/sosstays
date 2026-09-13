"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Partner, PartnerCategory } from "@/lib/partnersData";

// Search + multi-select tag filter over the partner list. Featured
// partners always sort to the top of the results regardless of which
// filters are active (see the build note on the source draft).
export function PartnerDirectory({
  partners,
  categories,
  emptyCategories,
}: {
  partners: Partner[];
  categories: PartnerCategory[];
  emptyCategories: PartnerCategory[];
}) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  function toggleTag(slug: string) {
    setActiveTags((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]));
  }

  const filteredPartners = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partners
      .filter((p) => (activeTags.length === 0 ? true : activeTags.includes(p.category)))
      .filter((p) => (q ? p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) : true))
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [partners, query, activeTags]);

  const filteredEmptyCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return emptyCategories
      .filter((cat) => (activeTags.length === 0 ? true : activeTags.includes(cat.slug)))
      .filter((cat) => (q ? cat.label.toLowerCase().includes(q) : true));
  }, [emptyCategories, query, activeTags]);

  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search partners by name or keyword…"
          aria-label="Search partners"
          className="w-full max-w-[420px] rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = activeTags.includes(cat.slug);
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => toggleTag(cat.slug)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                  active
                    ? "border-maroon bg-maroon text-cream"
                    : "border-sage-grey/50 bg-cream text-near-black/70 hover:border-maroon/50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredPartners.length === 0 && filteredEmptyCategories.length === 0 ? (
        <p className="text-base text-near-black/60">No partners match that search — try a different keyword or tag.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => (
            <div
              key={partner.slug}
              className="flex h-full flex-col rounded-[18px] border border-sage-grey/25 bg-cream p-7"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold tracking-widest text-muted-maroon uppercase">
                  {categoryLabel(partner.category)}
                </span>
                {partner.featured && (
                  <span className="rounded-full bg-maroon px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-cream uppercase">
                    Featured Partner
                  </span>
                )}
              </div>
              <h3 className="font-serif mb-1.5 text-xl font-bold text-near-black">{partner.name}</h3>
              <p className="mb-3 text-sm font-medium text-near-black/55">{partner.tagline}</p>
              <p className="flex-1 text-[15px] leading-loose text-near-black/70">{partner.description}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-maroon">
                {partner.featured && (
                  <Link href={`/partners/${partner.slug}`} className="underline underline-offset-2">
                    Read more →
                  </Link>
                )}
                <a href={partner.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  Visit {partner.name} →
                </a>
              </div>
            </div>
          ))}

          {filteredEmptyCategories.map((cat) => (
            <div
              key={cat.slug}
              className="flex h-full flex-col rounded-[18px] border border-dashed border-sage-grey/40 bg-warm-cream p-7"
            >
              <span className="mb-3 text-[11px] font-semibold tracking-widest text-muted-maroon uppercase">
                {cat.label}
              </span>
              <h3 className="font-serif mb-2.5 text-lg font-bold text-near-black">Still building this out</h3>
              <p className="flex-1 text-[15px] leading-loose text-near-black/70">
                {`We haven't signed a ${cat.label.toLowerCase()} partner yet — if that's your business, apply below and be the first.`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
