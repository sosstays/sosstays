import type { ReactNode } from "react";

// Generic collapsed-by-default disclosure panel — native <details>, same
// interaction pattern as FaqSection's accordion but takes arbitrary JSX
// (links, lists) rather than a plain string answer. Used on the About
// page for the "Who owns us" / "How to reach us" panels.
export function AccordionPanel({
  title,
  children,
  accent = "forest-green",
}: {
  title: string;
  children: ReactNode;
  accent?: "forest-green" | "maroon";
}) {
  const accentClass = accent === "maroon" ? "text-maroon" : "text-forest-green";

  return (
    <details className="group border-b border-sage-grey/40 py-5">
      <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl font-bold tracking-tight ${accentClass} marker:content-none [&::-webkit-details-marker]:hidden`}>
        {title}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="flex-none text-near-black/45 transition-transform duration-200 group-open:rotate-45"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </summary>
      <div className="mt-4 text-[15px] leading-relaxed text-near-black/75">{children}</div>
    </details>
  );
}
