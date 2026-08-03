type FaqItem = { question: string; answer: string };

// Shared FAQ accordion used on the property, area guide, and landlords
// pages. `centered` + `eyebrow` reproduce the landlords page's larger,
// centered heading treatment; everywhere else uses the plainer left-
// aligned heading.
export function FaqSection({
  id,
  eyebrow,
  heading,
  items,
  accent = "forest-green",
  centered = false,
  maxWidth = "720px",
  boldQuestions = true,
}: {
  id?: string;
  eyebrow?: string;
  heading: string;
  items?: FaqItem[] | null;
  accent?: "forest-green" | "maroon";
  centered?: boolean;
  maxWidth?: string;
  boldQuestions?: boolean;
}) {
  if (!items || items.length === 0) return null;

  const accentClass = accent === "maroon" ? "text-maroon" : "text-forest-green";

  return (
    <section id={id} className="mx-auto px-8 pb-24 sm:px-14" style={{ maxWidth }}>
      <div className={centered ? "mb-11 text-center" : "mb-6"}>
        {eyebrow && (
          <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">{eyebrow}</p>
        )}
        <h2
          className={`font-serif font-bold tracking-tight ${accentClass} ${
            centered ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {heading}
        </h2>
      </div>
      <div className="border-t border-sage-grey/40">
        {items.map((faq, i) => (
          <details key={i} className="group border-b border-sage-grey/40 py-4.5">
            <summary
              className={`flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] text-near-black marker:content-none [&::-webkit-details-marker]:hidden ${
                boldQuestions ? "font-semibold" : "font-normal"
              }`}
            >
              {faq.question}
              <svg
                width="16"
                height="16"
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
            <p className="mt-3 text-sm leading-relaxed text-near-black/70">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
