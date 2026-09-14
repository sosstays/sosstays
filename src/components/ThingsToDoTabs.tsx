"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageOverlayCard } from "@/components/ImageOverlayCard";

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

      <TabsContent value={tab} className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
        {activeItems.map((item, i) => (
          <ImageOverlayCard
            key={i}
            title={item.title}
            description={item.description}
            image={item.image}
            tag={item.tag}
            href={item.link}
            external
            heightClassName="h-[300px]"
          />
        ))}
      </TabsContent>
    </Tabs>
  );
}
