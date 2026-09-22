import { Reveal } from "@/components/Reveal";

export type StatCardItem = {
  /** Main figure, e.g. "15–30%" or "20–35". */
  value: string;
  /** Optional trailing symbol rendered smaller/lighter next to `value`, e.g. "%" or "×". */
  unit?: string;
  /** Optional bold subtitle under the figure, e.g. "Commission only". */
  title?: string;
  caption: string;
};

// Shared stat-card grid — used by both the "How it works" and "Market data"
// sections on the landlords page so the two don't drift into separate card
// styles. `cardBg` lets a caller tint specific cards (by index) instead of
// the plain bordered look, e.g. for a checkerboard effect.
export function StatCardGrid({
  items,
  columns = 4,
  cardBg,
  baseDelay = 0,
}: {
  items: StatCardItem[];
  columns?: 2 | 4;
  /** CSS color for each card by index; an omitted index falls back to the plain cream/bordered card. */
  cardBg?: (string | undefined)[];
  baseDelay?: number;
}) {
  const gridCols = columns === 2 ? "grid-cols-2 gap-5" : "grid-cols-2 gap-6 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols}`}>
      {items.map((item, i) => {
        const bg = cardBg?.[i];
        return (
          <Reveal
            key={item.value + item.caption}
            delay={baseDelay + i * 90}
            className={`rounded-[10px] p-5 sm:p-6 ${bg ? "" : "border border-sage-grey/40"}`}
            style={bg ? { background: bg } : undefined}
          >
            <div className="mb-2 text-2xl font-bold text-maroon sm:text-[28px]">
              {item.value}
              {item.unit && (
                <span className="text-lg font-medium text-maroon/55 sm:text-xl">{item.unit}</span>
              )}
            </div>
            {item.title && (
              <h3 className="mb-1.5 text-sm font-semibold text-maroon sm:text-base">{item.title}</h3>
            )}
            <p className="text-[12.5px] leading-relaxed text-near-black/65 sm:text-[13px]">
              {item.caption}
            </p>
          </Reveal>
        );
      })}
    </div>
  );
}
