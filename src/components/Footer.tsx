import Image from "next/image";
import Link from "next/link";
import { SocialIcons } from "@/components/SocialIcons";

type SocialLink = {
  platform: "instagram" | "facebook" | "tiktok" | "linkedin" | "x" | "youtube";
  url: string;
};

// The one footer used on every page.
export function Footer({ socialLinks }: { socialLinks?: SocialLink[] }) {
  return (
    <footer className="mt-24 border-t border-sage-grey/40 bg-cream font-sans text-near-black">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Sos Stays" width={126} height={80} className="h-10 w-auto" />
            </Link>
            <p className="mt-3 text-sm text-near-black/70">
              Sos is the Irish word for a break.
            </p>
            <SocialIcons
              links={socialLinks}
              className="text-near-black/70 hover:bg-forest-green hover:text-cream"
            />
          </div>

          <div>
            <p className="font-serif text-xs font-medium tracking-wide text-forest-green uppercase">
              Guests
            </p>
            <ul className="mt-3 space-y-2 text-sm text-near-black/70">
              <li>
                <Link href="/#stays" className="hover:text-forest-green">
                  Browse stays
                </Link>
              </li>
              <li>
                <Link href="/#areas" className="hover:text-forest-green">
                  Explore areas
                </Link>
              </li>
              {/* <li>
                <Link href="/blog" className="hover:text-forest-green">
                  Blog
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            <p className="font-serif text-xs font-medium tracking-wide text-forest-green uppercase">
              Landlords
            </p>
            <ul className="mt-3 space-y-2 text-sm text-near-black/70">
              <li>
                <Link href="/landlords" className="hover:text-forest-green">
                  Partner with us
                </Link>
              </li>
              <li>
                <a
                  href="https://strrevenue.netlify.app"
                  className="hover:text-forest-green"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Free revenue estimate
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-serif text-xs font-medium tracking-wide text-forest-green uppercase">
              Contact
            </p>
            <ul className="mt-3 space-y-2 text-sm text-near-black/70">
              <li>
                <a href="mailto:hello@sosstays.ie" className="hover:text-forest-green">
                  hello@sosstays.ie
                </a>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-forest-green">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-sage-grey/40 pt-6 text-xs text-near-black/50">
          <p>© {new Date().getFullYear()} Sos Stays. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
