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
