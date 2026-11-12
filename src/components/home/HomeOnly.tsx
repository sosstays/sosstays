"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Renders its children on the homepage only. Lets the root layout place a
// homepage-specific block *after* the shared footer (which the layout
// owns) without every other page getting it too.
export function HomeOnly({ children }: { children: ReactNode }) {
  return usePathname() === "/" ? <>{children}</> : null;
}
