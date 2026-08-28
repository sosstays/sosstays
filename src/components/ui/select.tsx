"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

// Radix Select underneath a plain button + listbox — replaces the site's
// hand-rolled dropdown (see ContactForm's old `Dropdown`) with focus
// trapping, typeahead, and screen-reader labeling for free. A native
// <select>'s open listbox is drawn by the OS/browser and can't be themed
// (background, highlight, padding), which is why this exists instead of
// plain <select>. Styled to the site's cream/sage-grey/forest-green look
// by default since — unlike Tabs — every current call site wants the same
// look; override via className if a future one doesn't.

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex w-full cursor-pointer items-center justify-between border-b border-sage-grey/60 bg-transparent pb-1.5 text-left text-[15px] text-near-black outline-none focus:border-forest-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-green disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-near-black/35",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-3.5 w-3.5 flex-none text-near-black/50 transition-transform data-[state=open]:rotate-180"
        >
          <path
            d="m5 7.5 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "z-50 max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[10px] border border-sage-grey/40 bg-cream shadow-[0_12px_24px_rgba(23,25,23,0.12)]",
          position === "popper" && "translate-y-2",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="max-h-60 overflow-auto py-1.5">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "block w-full cursor-pointer px-4 py-2.5 text-left text-[15px] text-near-black outline-none transition-colors hover:bg-forest-green/10 focus:bg-forest-green/10 data-[state=checked]:bg-forest-green/10 data-[state=checked]:font-medium data-[state=checked]:text-forest-green",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
