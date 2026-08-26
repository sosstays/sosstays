type Row = { label: string; str: string; longTerm: string };

// Speaks to both audiences reading this page — hosts already running an
// Airbnb (comparing against what they're leaving on the table) and
// landlords currently in long-term lets (comparing against switching).
const ROWS: Row[] = [
  { label: "Typical monthly income", str: "Higher — priced nightly, adjusted to demand", longTerm: "Fixed rent, set once a year" },
  { label: "Who does the work", str: "Sos Stays — listings, pricing, cleaning, guests", longTerm: "You, or a letting agent on a flat fee" },
  { label: "Flexibility to use the property yourself", str: "Block off any dates you want", longTerm: "None until the tenancy ends" },
  { label: "Vacancy risk", str: "Managed actively — dynamic pricing keeps nights filled", longTerm: "One vacant month can wipe out a month's rent" },
  { label: "Compliance", str: "Fáilte Ireland registration, RPZ rules — we guide you through it", longTerm: "RTB registration, standard landlord obligations" },
  { label: "Getting started", str: "Live in about a week", longTerm: "Weeks of viewings and referencing" },
];

export function StrVsLongTermTable() {
  return (
    <section className="mx-auto max-w-5xl px-8 py-16 sm:px-14">
      <div className="mb-8 text-center">
        <p className="mb-2.5 text-xs font-semibold tracking-widest text-forest-green uppercase">
          Already renting, or already hosting?
        </p>
        <h2 className="font-serif text-3xl font-bold text-near-black sm:text-4xl">
          Short-term management vs. long-term letting
        </h2>
        <p className="mx-auto mt-3 max-w-[56ch] text-sm leading-relaxed text-near-black/65">
          Whether you&apos;re already on Airbnb and want it properly managed, or you&apos;re
          currently in a long-term let and weighing up a switch, here&apos;s how the two compare.
        </p>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-sage-grey/40">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-light-forest-green/50">
              <th className="px-5 py-3.5 font-semibold text-near-black/70">&nbsp;</th>
              <th className="px-5 py-3.5 font-semibold text-forest-green">Short-term with Sos Stays</th>
              <th className="px-5 py-3.5 font-semibold text-near-black/70">Long-term letting</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 1 ? "bg-cream" : "bg-light-forest-green/15"}>
                <td className="border-t border-sage-grey/30 px-5 py-4 font-medium text-near-black/80">
                  {row.label}
                </td>
                <td className="border-t border-sage-grey/30 px-5 py-4 text-near-black">{row.str}</td>
                <td className="border-t border-sage-grey/30 px-5 py-4 text-near-black/70">{row.longTerm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
