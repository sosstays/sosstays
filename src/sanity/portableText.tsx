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

// Article body renderer for long-form blog content — serif headings and an
// accent-bordered pull-quote style for blockquotes, matching the rest of the
// site's typography rather than the unstyled PortableText defaults.
export const blogBodyComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-14 mb-5 font-serif text-2xl font-semibold tracking-tight text-[#1C1C1C] first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 mb-4 font-serif text-xl font-semibold tracking-tight text-[#1C1C1C]">
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
    image: ({ value }) => (
      <div className="relative my-11 aspect-[16/9] overflow-hidden rounded-lg">
        <Image
          src={urlFor(value).width(1200).height(675).url()}
          alt={value.alt || ""}
          fill
          className="object-cover"
        />
      </div>
    ),
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
  },
};
