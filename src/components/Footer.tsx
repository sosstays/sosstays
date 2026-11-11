import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SocialIcons } from "@/components/SocialIcons";
import { MARKET } from "@/lib/market";

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
  seoLinksTitle?: string | null;
  seoLinks?: FooterLink[] | null;
  companyInfo?: string | null;
  legalLinks?: FooterLink[] | null;
  copyrightText?: string | null;
};

// Fallback content, used if the Sanity "footer" singleton hasn't been
// filled in yet, so the site never ships an empty footer.
const DEFAULT_TAGLINE = "Sos is the Irish word for a break.";

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Stay",
    links: [
      { label: "Browse stays", href: "/#stays" },
      { label: "Area guides", href: "/areas" },
      { label: "Bespoke Ireland trip", href: "/bespoke-ireland-trip" },
      { label: "Gift maker", href: "/gift-maker" },
      { label: "Shop", href: "/shop" },
    ],
  },
  {
    title: "For owners",
    links: [
      { label: "Property management", href: "/landlords" },
      { label: "Pricing", href: "/pricing" },
      { label: "List for corporate stays", href: "/corporate-stays/list-your-property" },
    ],
  },
  {
    title: "For business",
    links: [
      { label: "Corporate stays", href: "/corporate-stays" },
      { label: "Partners", href: "/partners" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const DEFAULT_SEO_LINKS: FooterLink[] = [
  { label: "Hotels near Funtasia", href: "/hotels-near-funtasia" },
  { label: "Hotels near Newgrange", href: "/hotels-near-newgrange" },
  { label: "Hotels near Cliffs of Moher", href: "/hotels-near-cliffs-of-moher" },
];

const DEFAULT_LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms & conditions", href: "/terms-and-conditions" },
];

function hasItems<T>(list: T[] | null | undefined): list is T[] {
  return Array.isArray(list) && list.length > 0;
}

// External URLs open in a new tab as a plain <a>; everything else is a
// client-side <Link>.
function FooterAnchor({ link, className }: { link: FooterLink; className?: string }) {
  return /^https?:\/\//.test(link.href) ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

// The one footer used on every page, in two stacked bands:
//
//   Primary (cream)       — page-link columns, then one quiet line of
//                           "popular searches" SEO links.
//   Secondary (deep green) — logo + tagline, socials, then copyright,
//                           company details and legal links.
//
// Content comes from the Sanity "footer" singleton (see
// studio/schemaTypes/documents/footer.ts), falling back to sensible
// defaults when a field hasn't been set yet.
export function Footer({
  socialLinks,
  content,
}: {
  socialLinks?: SocialLink[] | null;
  content?: FooterContent | null;
}) {
  // The hardcoded defaults are Ireland's; other markets show only what their
  // own footer document provides.
  const isDefaultMarket = MARKET === "ie";
  const tagline = content?.tagline || (isDefaultMarket ? DEFAULT_TAGLINE : "");
  const legalLinks = hasItems(content?.legalLinks) ? content.legalLinks : DEFAULT_LEGAL_LINKS;
  const seoLinks = hasItems(content?.seoLinks) ? content.seoLinks : isDefaultMarket ? DEFAULT_SEO_LINKS : [];
  const seoLinksTitle = content?.seoLinksTitle || "Popular searches";

  // Legal and SEO links have their own homes now, so drop them from the
  // columns (older footer documents still list them there) rather than
  // showing the same link twice — and drop any column that leaves empty.
  const elsewhere = new Set([...legalLinks, ...seoLinks].map((link) => link.href));
  const columns = (hasItems(content?.columns) ? content.columns : isDefaultMarket ? DEFAULT_COLUMNS : [])
    .map((column) => ({
      ...column,
      links: (column.links ?? []).filter((link) => !elsewhere.has(link.href)),
    }))
    .filter((column) => column.links.length > 0);

  const copyrightText = (content?.copyrightText || "© {year} Sos Stays. All rights reserved.").replace(
    "{year}",
    String(new Date().getFullYear())
  );
  const companyInfo = content?.companyInfo?.trim();

  return (
    <footer className="font-sans">
      {/* PRIMARY — page links + SEO links */}
      {(columns.length > 0 || seoLinks.length > 0) && (
        <div className="border-t border-sage-grey/40 bg-cream text-near-black">
          <div className="mx-auto max-w-6xl px-8 py-14 sm:px-14">
            {columns.length > 0 && (
              <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
                {columns.map((column) => (
                  <div key={column.title}>
                    <p className="font-serif text-base font-semibold text-forest-green">{column.title}</p>
                    <ul className="mt-4 space-y-2.5 text-sm text-near-black/70">
                      {column.links.map((link) => (
                        <li key={`${link.href}-${link.label}`}>
                          <FooterAnchor link={link} className="transition-colors hover:text-forest-green" />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            )}

            {seoLinks.length > 0 && (
              <nav
                aria-label={seoLinksTitle}
                className={`flex flex-col gap-x-8 gap-y-2 md:flex-row md:items-baseline ${
                  columns.length > 0 ? "mt-12 border-t border-sage-grey/40 pt-7" : ""
                }`}
              >
                <p className="shrink-0 font-serif text-base font-semibold text-forest-green">{seoLinksTitle}</p>
                <ul className="flex flex-col gap-x-2.5 gap-y-2 text-sm text-near-black/65 md:flex-row md:flex-wrap md:gap-y-1.5">
                  {seoLinks.map((link, i) => (
                    <li key={`${link.href}-${link.label}`} className="flex items-center gap-x-2.5">
                      {i > 0 && (
                        <span aria-hidden="true" className="hidden text-sage-grey md:inline">
                          ·
                        </span>
                      )}
                      <FooterAnchor link={link} className="transition-colors hover:text-forest-green" />
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      )}

      {/* SECONDARY — brand, socials, company + legal */}
      <div className="bg-deep-forest text-cream">
        <div className="mx-auto max-w-6xl px-8 py-10 sm:px-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/" aria-label="Sos Stays home" className="inline-flex items-center">
                <Logo className="h-10 w-auto text-cream" />
              </Link>
              {tagline && <p className="mt-3 text-sm text-light-sage">{tagline}</p>}
            </div>
            <SocialIcons
              links={socialLinks}
              className="bg-cream/10 text-cream hover:bg-cream hover:text-deep-forest"
            />
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-cream/15 pt-6 text-xs text-cream/70 md:flex-row md:items-start md:justify-between md:gap-10">
            <div className="max-w-xl">
              <p>{copyrightText}</p>
              {companyInfo && <p className="mt-1.5 whitespace-pre-line">{companyInfo}</p>}
            </div>
            {legalLinks.length > 0 && (
              <ul className="flex shrink-0 flex-wrap gap-x-6 gap-y-2">
                {legalLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <FooterAnchor link={link} className="transition-colors hover:text-cream" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
