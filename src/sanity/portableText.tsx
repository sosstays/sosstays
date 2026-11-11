import Image from "next/image";
import type { PortableTextComponents } from "next-sanity";
import { urlFor } from "./image";

type PortableTextBlock = {
  _type: string;
  children?: { text?: string }[];
};

// Best-effort plain-text snippet from the first text block of a portable
// text array — used where we need a one-line hook (e.g. area spotlight)
// but the schema only offers rich body content.
export function portableTextToPlain(
  blocks: PortableTextBlock[] | undefined,
  maxLength = 200
): string {
  const block = blocks?.find((b) => b._type === "block");
  const text = block?.children?.map((child) => child.text ?? "").join("") ?? "";
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + "…" : text;
}

// Some documents (e.g. privacyPolicyPage.body) have had raw Markdown source
// typed directly into a portable text field rather than authored with
// Studio's rich-text toolbar — so the "block content" is really just one
// long Markdown string sitting in plain-text children. Reconstitute that
// source so it can be rendered with an actual Markdown renderer instead of
// PortableText (which would just show literal "**", "##", "|" characters).
export function portableTextToMarkdownSource(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks) return "";
  return blocks
    .filter((b) => b._type === "block")
    .map((block) => block.children?.map((child) => child.text ?? "").join("") ?? "")
    .join("\n\n");
}

// Slugified from a heading's own text, so it works as a jump-to id without
// any extra authoring step — e.g. "Aggie's Coffee Hut, Tullyallen" becomes
// "aggies-coffee-hut-tullyallen". Matches the slug an editor would guess by
// hand when writing an in-article index ("Jump to: [Aggie's Coffee
// Hut](#aggies-coffee-hut-tullyallen)"). Renames the heading later and the
// id changes too — for a link that must survive a heading rename, use the
// Anchor mark instead (see the `anchor` entry below).
function headingId(value: { children?: unknown[] }): string {
  const text = (value.children ?? [])
    .map((child) => (typeof (child as { text?: unknown }).text === "string" ? (child as { text: string }).text : ""))
    .join("");
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Article body renderer for long-form blog content — serif headings and an
// accent-bordered pull-quote style for blockquotes, matching the rest of the
// site's typography rather than the unstyled PortableText defaults.
export const blogBodyComponents: PortableTextComponents = {
  block: {
    h2: ({ children, value }) => (
      <h2
        id={headingId(value)}
        className="mt-14 mb-5 scroll-mt-28 font-serif text-2xl font-semibold tracking-tight text-forest-green first:mt-0"
      >
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3
        id={headingId(value)}
        className="mt-10 mb-4 scroll-mt-28 font-serif text-xl font-semibold tracking-tight text-forest-green"
      >
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mb-7 text-lg leading-relaxed text-[#1C1C1C]">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-11 border-l-2 border-light-sage py-1 pl-7">
        <p className="font-serif text-xl leading-snug font-medium text-forest-green italic">
          {children}
        </p>
      </blockquote>
    ),
  },
  types: {
    image: ({ value }) =>
      // An image block with no uploaded asset (empty placeholder in Studio)
      // would make urlFor throw and 500 the whole page.
      value?.asset ? (
        <div className="relative my-11 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={urlFor(value).width(1200).height(675).url()}
            alt={value.alt || ""}
            fill
            className="object-cover"
          />
        </div>
      ) : null,
    table: ({ value }) => {
      const rows: { _key: string; cells: string[] }[] = value?.rows ?? [];
      if (rows.length === 0) return null;
      const [headerRow, ...bodyRows] = rows;
      return (
        <div className="my-11 overflow-x-auto">
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr>
                {headerRow.cells.map((cell, i) => (
                  <th
                    key={i}
                    className="border-b-2 border-forest-green/40 px-4 py-2.5 text-left font-semibold text-forest-green"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row) => (
                <tr key={row._key} className="border-b border-sage-grey/30">
                  {row.cells.map((cell, i) => (
                    <td key={i} className="px-4 py-2.5 text-near-black/85">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    // Renders a pasted third-party embed code (YouTube, a form, a booking
    // widget) inside a sandboxed iframe via `srcDoc` instead of injecting it
    // directly into the page — so a pasted <script> runs isolated from this
    // site's own cookies, APIs and DOM rather than with full page access.
    embedBlock: ({ value }) => {
      if (!value?.code) return null;
      const ratioClass =
        {
          "16:9": "aspect-video",
          "4:3": "aspect-[4/3]",
          "1:1": "aspect-square",
        }[value.aspectRatio as string] ?? "";
      return (
        <figure className="my-11">
          <div className={`relative overflow-hidden rounded-lg ${ratioClass || "min-h-[480px]"}`}>
            <iframe
              srcDoc={value.code}
              title={value.caption || "Embedded content"}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              className="h-full w-full border-0"
              style={ratioClass ? { position: "absolute", inset: 0 } : { width: "100%", height: "100%" }}
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2.5 text-sm text-near-black/55">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-forest-green underline underline-offset-2"
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    // A manually-placed jump-to point (Studio's "Anchor" toolbar mark) —
    // for anchoring somewhere that isn't a heading, or an id that needs to
    // survive the surrounding text being edited later.
    anchor: ({ children, value }) =>
      value?.id ? (
        <span id={value.id} className="scroll-mt-28">
          {children}
        </span>
      ) : (
        <>{children}</>
      ),
  },
};
