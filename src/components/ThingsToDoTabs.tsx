"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Activity = {
  title: string;
  category: "Explore" | "Things to Do" | "Food" | "Transport";
  tag?: string;
  description?: string;
  image?: any;
  link?: string;
};

const CATEGORIES: Activity["category"][] = ["Explore", "Things to Do", "Food", "Transport"];

export function ThingsToDoTabs({ items: itemsProp }: { items: Activity[] | null }) {
  // GROQ returns `null` (not `undefined`) for an empty array field.
  const items = useMemo(() => itemsProp ?? [], [itemsProp]);
  const availableCategories = useMemo(
    () => CATEGORIES.filter((category) => items.some((item) => item.category === category)),
    [items]
  );
  const [tab, setTab] = useState(availableCategories[0]);
  const activeItems = items.filter((item) => item.category === tab);

  if (availableCategories.length === 0) return null;

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Activity["category"])}>
      <TabsList className="mb-7 flex flex-wrap gap-x-8 gap-y-1 border-b border-sage-grey/40">
        {availableCategories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className="border-b-[3px] border-transparent bg-transparent px-1 py-3.5 font-sans text-[15px] font-medium text-near-black opacity-60 data-[state=active]:border-forest-green data-[state=active]:text-forest-green data-[state=active]:opacity-100"
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={tab} className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {activeItems.map((item, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-[10px] border border-sage-grey/40 bg-light-sage/10"
          >
            {item.image ? (
              <div className="relative h-[140px]">
                <Image
                  src={urlFor(item.image).width(400).height(280).url()}
                  alt={item.image.alt ?? item.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-[140px] items-center justify-center bg-sage-grey/25 text-sm text-near-black/50">
                {item.title}
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-serif text-[15px] font-bold text-near-black">
                  {item.title}
                </h4>
                {item.tag && (
                  <span className="rounded-full border border-sage-grey/50 bg-cream px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-forest-green">
                    {item.tag}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="flex-1 text-[13px] leading-normal text-near-black/65">
                  {item.description}
                </p>
              )}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 text-[13px] font-semibold text-forest-green"
                >
                  More info →
                </a>
              )}
            </div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}
