import Link from "next/link";

// Minimal footer used on pages built with the hero-image treatment,
// in place of the site-wide Footer (see Footer.tsx's pathname opt-out).
export function MinimalFooter({ variant = "page" }: { variant?: "home" | "page" }) {
  const links =
    variant === "home"
      ? [
          { href: "#stays", label: "Stays" },
          { href: "#areas", label: "Area guides" },
          { href: "/blog", label: "Blog" },
          { href: "#landlords", label: "For landlords" },
        ]
      : [
          { href: "/stays", label: "Stays" },
          { href: "/areas", label: "Area guides" },
          { href: "/blog", label: "Blog" },
          { href: "/landlords", label: "For landlords" },
        ];

  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-sage-grey/40 px-8 py-11 sm:px-14">
      <p className="font-serif text-sm font-semibold tracking-widest text-forest-green uppercase">
        sos stays
      </p>
      <div className="flex gap-7">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-near-black/70 hover:text-forest-green"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-xs text-near-black/50">
        © {new Date().getFullYear()} Power Rangers Ltd, trading as Sos Stays.
      </p>
    </footer>
  );
}
