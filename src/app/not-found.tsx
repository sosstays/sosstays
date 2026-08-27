import type { Metadata } from "next";
import Link from "next/link";
import { NotFoundFace } from "@/components/NotFoundFace";

export const metadata: Metadata = {
  title: "Page Not Found | Sos Stays",
  description: "The page you're looking for doesn't exist.",
};

const LINKS = [
  { label: "Browse stays", href: "/#stays" },
  { label: "Read the blog", href: "/blog" },
  { label: "Talk to us about your property", href: "/landlords" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-cream px-6 py-24 text-center">
      <NotFoundFace />
      <h1 className="mt-6 font-serif text-3xl text-forest-green sm:text-4xl">
        You&rsquo;ve wandered off the map.
      </h1>
      <p className="mt-4 max-w-md text-lg text-forest-green/80">
        This page isn&rsquo;t somewhere we know — but we can still point you toward a proper break.
      </p>
      <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-forest-green">
        {LINKS.map((link, i) => (
          <span key={link.href} className="flex items-center gap-x-3">
            {i > 0 && <span aria-hidden className="text-forest-green/40">·</span>}
            <Link href={link.href} className="font-semibold underline underline-offset-4 hover:text-maroon">
              {link.label}
            </Link>
          </span>
        ))}
      </nav>
    </div>
  );
}
