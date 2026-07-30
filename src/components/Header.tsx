"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usesHeroChrome } from "@/lib/heroChromeRoutes";

export function Header() {
  const pathname = usePathname();
  if (usesHeroChrome(pathname)) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E2DC] bg-[#FAFAF8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Sos Stays" width={126} height={80} className="h-10 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1C1C1C] sm:flex">
          <Link href="/stays" className="hover:text-[#0F6E56]">
            Stays
          </Link>
          <Link href="/areas" className="hover:text-[#0F6E56]">
            Areas
          </Link>
          <Link href="/blog" className="hover:text-[#0F6E56]">
            Blog
          </Link>
          <Link href="/landlords" className="hover:text-[#0F6E56]">
            For Landlords
          </Link>
        </nav>

        <Link
          href="/stays"
          className="hidden rounded-md bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A5540] sm:inline-block"
        >
          Find your somewhere
        </Link>

        {/* Mobile nav: kept intentionally simple for now — a proper
            slide-out menu can replace this once real traffic patterns
            show it's needed. */}
        <nav className="flex items-center gap-4 text-sm font-medium text-[#1C1C1C] sm:hidden">
          <Link href="/stays">Stays</Link>
          <Link href="/landlords">Landlords</Link>
        </nav>
      </div>
    </header>
  );
}
