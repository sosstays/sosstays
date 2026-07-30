import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

// Renders Markdown source with styling matching the site's design tokens.
// Some Sanity documents (e.g. privacyPolicyPage.body) have had raw
// Markdown typed directly into a portable text field rather than authored
// with Studio's rich-text toolbar — see portableTextToMarkdownSource,
// which extracts that source so it can be rendered here instead of via
// PortableText (which would just show literal "**", "##", "|" characters).
export function MarkdownContent({ source }: { source: string }) {
  return (
    <div className="max-w-none text-near-black">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-10 mb-4 font-serif text-3xl font-bold text-forest-green first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 mb-3 font-serif text-2xl font-bold text-forest-green first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-7 mb-2 font-serif text-lg font-bold text-near-black">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-near-black">{children}</p>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ href, children }) => (
            <Link
              href={href ?? "#"}
              className="font-medium text-forest-green underline underline-offset-2"
            >
              {children}
            </Link>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1.5 text-near-black">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-near-black">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          hr: () => <hr className="my-8 border-sage-grey/40" />,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-sage-grey/60 pl-4 text-near-black/70 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-sage-grey/40 bg-light-sage/20 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-sage-grey/40 px-3 py-2 align-top">{children}</td>
          ),
          code: ({ children }) => (
            <code className="rounded bg-light-sage/25 px-1.5 py-0.5 text-[13px]">
              {children}
            </code>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
