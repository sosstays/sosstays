"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usesHeroChrome } from "@/lib/heroChromeRoutes";
import { SocialIcons } from "@/components/SocialIcons";

type SocialLink = {
  platform: "instagram" | "facebook" | "tiktok" | "linkedin" | "x" | "youtube";
  url: string;
};

export function Footer({ socialLinks }: { socialLinks?: SocialLink[] }) {
  const pathname = usePathname();
  if (usesHeroChrome(pathname)) return null;

  return (
    <footer className="mt-24 border-t border-[#E2E2DC] bg-[#E8F5F0]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-serif text-xl font-semibold text-[#1C1C1C]">Sos Stays</p>
            <p className="mt-2 text-sm text-[#555550]">
              Sos is the Irish word for a break.
            </p>
            <SocialIcons links={socialLinks} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#0F6E56]">
              Guests
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#555550]">
              <li>
                <Link href="/stays" className="hover:text-[#0F6E56]">
                  Browse stays
                </Link>
              </li>
              <li>
                <Link href="/areas" className="hover:text-[#0F6E56]">
                  Explore areas
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#0F6E56]">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#0F6E56]">
              Landlords
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#555550]">
              <li>
                <Link href="/landlords" className="hover:text-[#0F6E56]">
                  Partner with us
                </Link>
              </li>
              <li>
                <a
                  href="https://strrevenue.netlify.app"
                  className="hover:text-[#0F6E56]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Free revenue estimate
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#0F6E56]">
              Contact
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#555550]">
              <li>
                <a href="mailto:hello@sosstays.ie" className="hover:text-[#0F6E56]">
                  hello@sosstays.ie
                </a>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#0F6E56]">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#5DCAA5]/30 pt-6 text-xs text-[#555550]">
          <p>© {new Date().getFullYear()} Power Rangers Ltd, trading as Sos Stays. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
