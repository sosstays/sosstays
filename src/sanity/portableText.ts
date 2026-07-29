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
