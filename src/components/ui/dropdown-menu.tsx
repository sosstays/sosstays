"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";

// Radix DropdownMenu — for menus whose items *navigate* (real <Link>s via
// asChild), unlike ui/select.tsx which is for picking a form value. Gets
// click-outside dismissal, focus trapping, and keyboard nav for free
// instead of the site's old hand-rolled open-state + click-outside
// useEffect (see CitySelectDropdown), while keeping real anchors so
// ctrl/cmd-click, middle-click, and right-click-copy-link all still work.

function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 12,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-30 w-[calc(100vw-2rem)] max-w-[320px] overflow-hidden rounded-[14px] border border-sage-grey/40 bg-cream text-left shadow-[0_16px_36px_rgba(23,25,23,0.25)] outline-none sm:max-w-[380px]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
