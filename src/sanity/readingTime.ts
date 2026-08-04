type PortableTextBlock = {
  _type: string;
  children?: { text?: string }[];
};

const WORDS_PER_MINUTE = 200;

// Estimated read time from portable text word count — the schema has no
// dedicated field for this, so it's derived rather than authored.
export function estimateReadingTime(blocks: PortableTextBlock[] | undefined): number {
  const wordCount = (blocks ?? [])
    .filter((b) => b._type === "block")
    .flatMap((b) => b.children ?? [])
    .reduce((count, child) => count + (child.text?.trim().split(/\s+/).filter(Boolean).length ?? 0), 0);

  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
