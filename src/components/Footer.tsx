import Image from "next/image";
import Link from "next/link";
import { SocialIcons } from "@/components/SocialIcons";
import { MARKET } from "@/lib/market";

type CountrySite = { label: string; market: string; url: string };

type SocialLink = {
  platform:
    | "instagram"
    | "facebook"
    | "tiktok"
    | "linkedin"
    | "x"
    | "youtube"
    | "tripadvisor"
    | "whatsapp";
  url: string;
};

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[] | null;
};

export type FooterContent = {
  tagline?: string | null;
  columns?: FooterColumn[] | null;
  copyrightText?: string | null;
};

// Fallback content, used if the Sanity "footer" singleton hasn't been
// filled in yet, so the site never ships an empty footer.
const DEFAULT_TAGLINE = "Sos is the Irish word for a break.";

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Guests",
    links: [
      { label: "Browse stays", href: "/#stays" },
      { label: "Explore areas", href: "/areas" },
      { label: "Blog", href: "/blog" },
      { label: "Hotels near Funtasia", href: "/hotels-near-funtasia" },
    ],
  },
  {
    title: "Landlords",
    links: [
      { label: "Partner with us", href: "/landlords" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms & conditions", href: "/terms-and-conditions" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Hotels near Funtasia", href: "/hotels-near-funtasia" },
      { label: "Hotels near Newgrange", href: "/hotels-near-newgrange" },
      { label: "Hotels near Cliffs of Moher", href: "/hotels-near-cliffs-of-moher" },
    ],
  },
];

// The one footer used on every page. Content comes from the Sanity
// "footer" singleton (see studio/schemaTypes/documents/footer.ts),
// falling back to sensible defaults when it hasn't been set yet.
export function Footer({
  socialLinks,
  content,
  countries,
}: {
  socialLinks?: SocialLink[] | null;
  content?: FooterContent | null;
  countries?: CountrySite[] | null;
}) {
  // The hardcoded defaults are Ireland's; other markets show only what their
  // own footer document provides.
  const tagline = content?.tagline || (MARKET === "ie" ? DEFAULT_TAGLINE : "");
  const columns =
    content?.columns && content.columns.length > 0 ? content.columns : MARKET === "ie" ? DEFAULT_COLUMNS : [];
  const copyrightText = (content?.copyrightText || "© {year} Sos Stays. All rights reserved.").replace(
    "{year}",
    String(new Date().getFullYear())
  );

  return (
    <footer className="border-t border-sage-grey/40 bg-cream font-sans text-near-black">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Sos Stays" width={126} height={80} className="h-10 w-auto" />
            </Link>
            {tagline && <p className="mt-3 text-sm text-near-black/70">{tagline}</p>}
            <SocialIcons
              links={socialLinks}
              className="text-near-black/70 hover:bg-forest-green hover:text-cream"
            />
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="font-serif text-xs font-medium tracking-wide text-forest-green uppercase">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-near-black/70">
                {column.links?.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-forest-green">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-sage-grey/40 pt-6 text-xs text-near-black/50">
          <p>{copyrightText}</p>
          {/* Plain, always-rendered text links (no flags, no JS) so crawlers
              can discover the sibling country sites. The header dropdown is
              JS-only, so this is the crawlable path. */}
          {countries && countries.length > 1 && (
            <nav aria-label="Sos Stays country sites">
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {countries.map((c) => (
                  <li key={c.market}>
                    <a
                      href={c.url}
                      hrefLang={c.market === "in" ? "en-IN" : "en-IE"}
                      aria-current={c.market === MARKET ? "true" : undefined}
                      className={c.market === MARKET ? "font-semibold text-near-black/80" : "hover:text-forest-green"}
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
