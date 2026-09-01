// Numbered-circle-and-line progress indicator shared by LandlordLeadForm
// and RevenueCalculator's multi-step forms — both hand-rolled a near
// byte-identical version of this before. `current` is 1-indexed (matches
// how both forms already track their step state, aside from
// LandlordLeadForm which is 0-indexed internally and passes `step + 1`).
export function StepProgress({ steps, current }: { steps: number; current: number }) {
  return (
    <div className="mb-9 flex items-center gap-2.5">
      {Array.from({ length: steps }, (_, i) => i + 1).map((n) => {
        const grow = n < steps;
        const reached = n <= current;
        const lineReached = n < current;
        return (
          <div key={n} className={`flex items-center gap-2.5 ${grow ? "flex-1" : ""}`}>
            <div
              className="flex h-7 w-7 flex-none items-center justify-center rounded-full border text-[13px] font-semibold"
              style={{
                background: reached ? "var(--maroon)" : "var(--cream)",
                color: reached ? "var(--cream)" : "var(--near-black)",
                borderColor: reached ? "var(--maroon)" : "var(--sage-grey)",
              }}
            >
              {n}
            </div>
            {grow && (
              <div
                className="h-0.5 flex-1"
                style={{ background: lineReached ? "var(--maroon)" : "var(--sage-grey)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
