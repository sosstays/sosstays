const STEPS = [
  {
    value: "5",
    unit: "days",
    label: "From enquiry to call",
    description: "We book your onboarding call within 5 days of hearing from you.",
  },
  {
    value: "1",
    unit: "week",
    label: "From call to live",
    description: "Listings, pricing and photography are ready and you're live within a week of that call.",
  },
];

export function OnboardingTimeline() {
  return (
    <section className="mx-auto max-w-5xl px-8 py-16 sm:px-14">
      <div className="mb-10 text-center">
        <p className="mb-2.5 text-xs font-semibold tracking-widest text-maroon uppercase">
          Getting started
        </p>
        <h2 className="font-serif text-3xl font-bold text-near-black sm:text-4xl">
          Live in about a week
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            className="flex flex-col items-center gap-3 rounded-[18px] border border-sage-grey/40 bg-light-forest-green/40 px-8 py-10 text-center"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-6xl leading-[0.9] font-semibold text-maroon sm:text-7xl">
                {step.value}
              </span>
              <span className="text-xl font-semibold text-maroon">{step.unit}</span>
            </div>
            <p className="text-sm font-semibold text-near-black">{step.label}</p>
            <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-near-black/65">
              {step.description}
            </p>
            {i === 0 && (
              <span className="mt-1 h-px w-10 bg-sage-grey/60 sm:hidden" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
