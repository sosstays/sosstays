"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { AddressAutocomplete, type AddressAutocompleteValue } from "@/components/AddressAutocomplete";
import { calculateRevenue, formatEuro, type CalculatorResult } from "@/lib/revenueCalculator";

const BEDROOM_OPTIONS = [
  { value: "studio", label: "Studio / 1 bedroom" },
  { value: "2", label: "2 bedrooms" },
  { value: "3", label: "3 bedrooms" },
  { value: "4", label: "4 bedrooms" },
  { value: "5+", label: "5+ bedrooms" },
];

const PLATFORM_OPTIONS = [
  { id: "airbnb", label: "Airbnb" },
  { id: "booking", label: "Booking.com" },
  { id: "vrbo", label: "Vrbo / HomeAway" },
  { id: "direct", label: "Direct bookings" },
  { id: "letsgo", label: "LetsGoSelfCatering" },
  { id: "other", label: "Other / Local sites" },
];

const HOURS_OPTIONS = [
  { value: 2, label: "Under 2 hours" },
  { value: 5, label: "2–5 hours" },
  { value: 10, label: "5–10 hours" },
  { value: 15, label: "10–15 hours" },
  { value: 20, label: "15–20+ hours" },
];

const CHALLENGE_OPTIONS = [
  "Guest communications taking too long",
  "Inconsistent bookings / empty nights",
  "Cleaning and turnover coordination",
  "Pricing — not sure if I'm charging the right rate",
  "Reviews — getting more or recovering from bad ones",
  "Managing across multiple platforms",
  "Just takes too much time overall",
];

const TOTAL_STEPS = 3;

type Stage = "form" | "results" | "error";

export function RevenueCalculator({
  initialName,
  initialEmail,
  onResultsShown,
  formIntro,
}: {
  /** Carried in from the contact form (e.g. the post-submit "what's next"
   *  page) so the results can be attributed and saved without asking the
   *  visitor for their details again. When absent (the standalone
   *  /calculator page), results are shown but nothing is saved anywhere. */
  initialName?: string;
  initialEmail?: string;
  /** Fires once the results are computed and shown — lets a page hosting
   *  this inline (e.g. alongside intro copy in a two-column layout) switch
   *  to a full-width layout for the results. */
  onResultsShown?: () => void;
  /** Optional content rendered inside the form card, above the step
   *  progress bar — for callers that want page-specific intro copy to live
   *  inside the card rather than as a separate block above it. */
  formIntro?: ReactNode;
} = {}) {
  const name = initialName?.trim() ?? "";
  const email = initialEmail?.trim() ?? "";
  const hasContact = Boolean(name && email);

  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("2");
  const [platforms, setPlatforms] = useState<string[]>(["Airbnb"]);

  // Step 2
  const [occupancy, setOccupancy] = useState(42);
  const [adr, setAdr] = useState(110);
  const [revenueMode, setRevenueMode] = useState<"known" | "estimate">("known");
  const [currentRevenue, setCurrentRevenue] = useState("");

  // Step 3
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const [consent, setConsent] = useState(false);

  const [step1Error, setStep1Error] = useState(false);
  const [step2Error, setStep2Error] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const [result, setResult] = useState<CalculatorResult | null>(null);

  // Rough monthly revenue from the occupancy/rate sliders above — used when
  // the owner doesn't know their actual figure.
  const estimatedRevenue = Math.round(adr * (occupancy / 100) * 30.4);

  function handleAreaSelect(value: AddressAutocompleteValue) {
    setArea(value.formattedAddress);
  }

  function togglePlatform(label: string) {
    setPlatforms((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    );
  }

  function goStep(n: number) {
    if (n > step) {
      if (step === 1 && !validateStep1()) return;
      if (step === 2 && !validateStep2()) return;
    }
    setStep(n);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateStep1() {
    const valid = Boolean(area.trim());
    setStep1Error(!valid);
    return valid;
  }

  function validateStep2() {
    if (revenueMode === "estimate") {
      setStep2Error(false);
      return true;
    }
    const revenue = parseFloat(currentRevenue);
    const valid = Boolean(currentRevenue) && revenue > 0;
    setStep2Error(!valid);
    return valid;
  }

  async function handleSubmit() {
    if (!validateStep2()) {
      setStep(2);
      return;
    }
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setSubmitting(true);

    const current = revenueMode === "estimate" ? estimatedRevenue : parseFloat(currentRevenue) || 0;
    const calc = calculateRevenue({
      occupancy,
      adr,
      currentRevenue: current,
      platformCount: platforms.length,
      hoursPerWeek,
    });
    setResult(calc);

    // Nothing to attribute this to on the standalone tool — just show the
    // numbers without saving anywhere.
    if (!hasContact) {
      setSubmitting(false);
      setStage("results");
      onResultsShown?.();
      return;
    }

    try {
      const res = await fetch("/api/calculator-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          area,
          bedrooms,
          platforms: platforms.join(", "),
          occupancy: `${occupancy}%`,
          adr: `€${adr}`,
          currentRevenue: current,
          hoursPerWeek,
          biggestChallenge,
          estimatedPotential: Math.round(calc.net),
          estimatedUplift: Math.round(calc.uplift),
          upliftPercent: calc.upliftPercent,
        }),
      });
      if (!res.ok) throw new Error(`Lead submission failed: ${res.status}`);
      setStage("results");
    } catch {
      // Still show results — the estimate isn't dependent on the lead save.
      setStage("results");
    } finally {
      setSubmitting(false);
      onResultsShown?.();
    }
  }

  const progressSegments = [1, 2, 3].map((n) => ({
    number: n,
    grow: n < TOTAL_STEPS,
    reached: n <= step,
    lineReached: n < step,
  }));

  return (
    <div id="calculator" className="w-full">
      {stage === "form" && (
        <div className="rounded-[18px] border border-sage-grey/30 bg-cream p-8 shadow-sm sm:p-11">
          {formIntro && <div className="mb-9">{formIntro}</div>}
          <div className="mb-9 flex items-center gap-2.5">
            {progressSegments.map((seg) => (
              <div key={seg.number} className={`flex items-center gap-2.5 ${seg.grow ? "flex-1" : ""}`}>
                <div
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-full border text-[13px] font-semibold"
                  style={{
                    background: seg.reached ? "var(--maroon)" : "var(--cream)",
                    color: seg.reached ? "var(--cream)" : "var(--near-black)",
                    borderColor: seg.reached ? "var(--maroon)" : "var(--sage-grey)",
                  }}
                >
                  {seg.number}
                </div>
                {seg.grow && (
                  <div
                    className="h-0.5 flex-1"
                    style={{ background: seg.lineReached ? "var(--maroon)" : "var(--sage-grey)" }}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="flex flex-col gap-4.5">
              <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">
                Your property details
              </h3>
              <p className="text-sm text-near-black/60">
                Tell us about what you&apos;re currently managing — be as accurate as you can for
                the most useful results.
              </p>

              <AddressAutocomplete
                label="Where is your property?"
                required
                placeholder="Start typing your address…"
                value={area}
                onChange={setArea}
                onSelect={handleAreaSelect}
              />
              {step1Error && (
                <p className="text-[13px] text-error-red">Please enter your property address.</p>
              )}

              <label className="flex flex-col gap-1.5 text-sm text-near-black">
                Bedrooms per property
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
                >
                  {BEDROOM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2 text-sm text-near-black">
                Currently listed on
                <div className="flex flex-wrap gap-2.5">
                  {PLATFORM_OPTIONS.map((p) => {
                    const active = platforms.includes(p.label);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.label)}
                        className="cursor-pointer rounded-full border px-4 py-2 text-[13px] font-medium whitespace-nowrap"
                        style={{
                          background: active ? "var(--light-forest-green)" : "transparent",
                          borderColor: active ? "var(--forest-green)" : "var(--sage-grey)",
                          color: active ? "var(--forest-green)" : "var(--near-black)",
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-1 flex justify-end">
                <Button
                  onClick={() => goStep(2)}
                  variant="primary"
                  bgColor="maroon"
                  color="cream"
                  animateColor="maroon"
                  size="sm"
                >
                  Next — Current Performance →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4.5">
              <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">
                Your current performance
              </h3>
              <p className="text-sm text-near-black/60">
                Be honest — the more accurate your numbers, the more useful your results will be.
              </p>

              <div>
                <label className="mb-1 block text-sm text-near-black">Current occupancy rate</label>
                <div className="mb-2 text-center font-serif text-3xl text-maroon">{occupancy}%</div>
                <input
                  type="range"
                  min={5}
                  max={95}
                  step={1}
                  value={occupancy}
                  onChange={(e) => setOccupancy(Number(e.target.value))}
                  className="calc-slider"
                />
                <div className="mt-1 flex justify-between text-[11px] text-near-black/60">
                  <span>5% (very low)</span>
                  <span>95% (fully booked)</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-near-black">
                  Average nightly rate (€ or £)
                </label>
                <div className="mb-2 text-center font-serif text-3xl text-maroon">€{adr}</div>
                <input
                  type="range"
                  min={40}
                  max={500}
                  step={5}
                  value={adr}
                  onChange={(e) => setAdr(Number(e.target.value))}
                  className="calc-slider"
                />
                <div className="mt-1 flex justify-between text-[11px] text-near-black/60">
                  <span>€40/night</span>
                  <span>€500/night</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm text-near-black">
                <span>
                  Your current monthly revenue (€ or £) <span className="text-error-red">*</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRevenueMode("known")}
                    className="cursor-pointer rounded-full border px-4 py-2 text-[13px] font-medium whitespace-nowrap"
                    style={{
                      background: revenueMode === "known" ? "var(--light-forest-green)" : "transparent",
                      borderColor: revenueMode === "known" ? "var(--forest-green)" : "var(--sage-grey)",
                      color: revenueMode === "known" ? "var(--forest-green)" : "var(--near-black)",
                    }}
                  >
                    I know the number
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevenueMode("estimate")}
                    className="cursor-pointer rounded-full border px-4 py-2 text-[13px] font-medium whitespace-nowrap"
                    style={{
                      background: revenueMode === "estimate" ? "var(--light-forest-green)" : "transparent",
                      borderColor: revenueMode === "estimate" ? "var(--forest-green)" : "var(--sage-grey)",
                      color: revenueMode === "estimate" ? "var(--forest-green)" : "var(--near-black)",
                    }}
                  >
                    Not sure — estimate it for me
                  </button>
                </div>

                {revenueMode === "known" ? (
                  <>
                    <input
                      type="number"
                      min={0}
                      value={currentRevenue}
                      onChange={(e) => setCurrentRevenue(e.target.value)}
                      placeholder="e.g. 1800"
                      className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
                    />
                    <span className="text-[11px] text-near-black/60">
                      What actually lands in your account each month from your property/properties
                    </span>
                  </>
                ) : (
                  <div className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3">
                    <p className="font-serif text-2xl text-maroon">{formatEuro(estimatedRevenue)}</p>
                    <p className="mt-1 text-[11px] text-near-black/60">
                      Based on the occupancy and nightly rate you set above — we&apos;ll use this as
                      your starting point instead.
                    </p>
                  </div>
                )}
              </div>
              {step2Error && (
                <p className="text-[13px] text-error-red">Please enter your monthly revenue.</p>
              )}

              <div className="mt-1 flex justify-between">
                <button
                  type="button"
                  onClick={() => goStep(1)}
                  className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black"
                >
                  ← Back
                </button>
                <Button
                  onClick={() => goStep(3)}
                  variant="primary"
                  bgColor="maroon"
                  color="cream"
                  animateColor="maroon"
                  size="sm"
                >
                  Calculate My Potential →
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4.5">
              <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">
                One last thing
              </h3>
              <p className="text-sm text-near-black/60">This helps us tailor your results accurately.</p>

              <label className="flex flex-col gap-1.5 text-sm text-near-black">
                Hours per week spent managing your property/properties?
                <select
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
                >
                  {HOURS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-near-black">
                Your biggest management headache right now?
                <select
                  value={biggestChallenge}
                  onChange={(e) => setBiggestChallenge(e.target.value)}
                  className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
                >
                  <option value="">— Select one —</option>
                  {CHALLENGE_OPTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              <div className="flex items-start gap-2.5 rounded-[10px] border border-sage-grey/50 bg-cream p-3.5">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setConsentError(false);
                  }}
                  className="mt-0.5 h-[18px] w-[18px] flex-none cursor-pointer accent-[var(--maroon)]"
                />
                <label htmlFor="consent" className="cursor-pointer text-[13px] text-near-black">
                  I agree that Sos Stays may contact me about my results and property management
                  services. We&apos;ll never share your data with third parties.
                </label>
              </div>
              {consentError && (
                <p className="text-[13px] text-error-red">Please tick the box to continue.</p>
              )}

              <div className="mt-1 flex justify-between">
                <button
                  type="button"
                  onClick={() => goStep(2)}
                  className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black"
                >
                  ← Back
                </button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  variant="primary"
                  bgColor="maroon"
                  color="cream"
                  animateColor="maroon"
                  size="custom"
                  className="px-7 py-3.5 text-sm font-semibold disabled:opacity-60"
                >
                  {submitting ? "Calculating…" : "Show My Revenue Potential →"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {stage === "results" && result && (
        <ResultsPanel
          name={name}
          currentRevenue={revenueMode === "estimate" ? estimatedRevenue : parseFloat(currentRevenue) || 0}
          hoursPerWeek={hoursPerWeek}
          platformCount={platforms.length}
          occupancy={occupancy}
          result={result}
        />
      )}
    </div>
  );
}

function ResultsPanel({
  name,
  currentRevenue,
  hoursPerWeek,
  platformCount,
  occupancy,
  result,
}: {
  name: string;
  currentRevenue: number;
  hoursPerWeek: number;
  platformCount: number;
  occupancy: number;
  result: CalculatorResult;
}) {
  const firstName = name.trim().split(" ")[0];
  const channelLabel =
    platformCount <= 1
      ? "Multi-channel distribution (new channels)"
      : platformCount === 2
        ? "Multi-channel optimisation"
        : "Channel performance optimisation";

  return (
    <div>
      <div className="mb-9 text-center">
        <h2 className="font-serif text-3xl font-bold text-near-black">
          Your Revenue Potential with Sos Stays
        </h2>
        <p className="mt-1.5 text-sm text-near-black/60">
          {firstName
            ? `Here's what we could unlock for ${firstName}'s property`
            : "Here's what we could unlock for your property"}
        </p>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-[10px] border border-sage-grey/40 p-5 text-center">
          <p className="mb-2 text-[11px] font-medium tracking-wide text-near-black/60 uppercase">
            Your current monthly
          </p>
          <p className="font-serif text-3xl text-maroon">{formatEuro(currentRevenue)}</p>
          <p className="mt-1 text-[11px] text-near-black/60">self-managed</p>
        </div>
        <div className="rounded-[10px] border border-maroon bg-light-forest-green/40 p-5 text-center">
          <p className="mb-2 text-[11px] font-medium tracking-wide text-near-black/60 uppercase">
            Estimated with Sos Stays
          </p>
          <p className="font-serif text-4xl text-maroon">{formatEuro(result.net)}</p>
          <p className="mt-1 text-[11px] text-near-black/60">per month</p>
        </div>
        <div className="rounded-[10px] border border-sage-grey/40 p-5 text-center">
          <p className="mb-2 text-[11px] font-medium tracking-wide text-near-black/60 uppercase">
            Extra per month
          </p>
          <p className="font-serif text-3xl text-maroon">
            {result.uplift > 0 ? "+" : ""}
            {formatEuro(result.uplift)}
          </p>
          <p className="mt-1 text-[11px] text-near-black/60">+{result.upliftPercent}% additional income</p>
        </div>
      </div>

      <div className="mb-7 overflow-hidden rounded-[10px] border border-sage-grey/40">
        <div className="border-b border-sage-grey/40 bg-light-forest-green/40 px-5 py-3.5 text-[13px] font-semibold tracking-wide text-maroon uppercase">
          How we get there
        </div>
        <BreakdownRow label="Your current revenue" value={formatEuro(currentRevenue)} />
        <BreakdownRow
          label={`Occupancy uplift (${occupancy}% → ${result.targetOccupancy}%)`}
          value={`+${formatEuro(result.occGain)}`}
          tone="green"
        />
        <BreakdownRow
          label="Dynamic pricing optimisation"
          value={`+${formatEuro(result.rateGain)}`}
          tone="green"
        />
        <BreakdownRow label={channelLabel} value={`+${formatEuro(result.channelGain)}`} tone="green" />
        <BreakdownRow label="Sos Stays commission (20%)" value={`-${formatEuro(result.commission)}`} />
        <BreakdownRow label="Your net monthly income" value={formatEuro(result.net)} tone="green" total />
      </div>

      <div className="mb-7 overflow-hidden rounded-[10px] border border-sage-grey/40">
        <div className="border-b border-sage-grey/40 bg-light-forest-green/40 px-5 py-3.5 text-[13px] font-semibold tracking-wide text-maroon uppercase">
          Your time back
        </div>
        <BreakdownRow label="Hours you currently spend per week" value={`${hoursPerWeek} hrs`} />
        <BreakdownRow label="Hours with Sos Stays managing" value="~1 hour per month" tone="green" />
        <BreakdownRow
          label="Hours saved per week"
          value={`${result.hoursSaved} hrs`}
          tone="green"
          total
        />
      </div>

      <div className="mb-7 rounded-[10px] border border-forest-green/30 bg-light-forest-green/50 p-6">
        <h4 className="mb-2.5 text-[13px] font-bold tracking-wide text-forest-green uppercase">
          What Sos Stays handles for you — at no extra cost
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_WE_DO.map((item) => (
            <div key={item} className="flex items-start gap-2 text-[13px] text-near-black">
              <span className="mt-0.5 text-forest-green">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] bg-maroon p-8 text-center text-cream sm:p-10">
        <h3 className="mb-2 font-serif text-2xl font-bold">Ready to make this happen?</h3>
        <p className="mx-auto mb-5 max-w-[420px] text-sm text-light-sage/90">
          Let&apos;s have a no-obligation 20-minute call to walk through your specific property
          and confirm what we can achieve together.
        </p>
        <Button
          link="mailto:info@sosstays.com?subject=Revenue Calculator — I want to find out more"
          external
          variant="primary"
          bgColor="cream"
          color="maroon"
          animateColor="maroon"
        >
          Book a Free Call with Sos Stays
        </Button>
      </div>

      <p className="mx-auto mt-6 max-w-[640px] text-center text-[11px] leading-relaxed text-near-black/55">
        Projections are estimates based on market data for the Louth–Meath–Newry corridor and
        typical performance uplifts from professional STR management. Actual results will vary by
        property, location, season, and market conditions. This calculator does not constitute a
        contractual commitment.{" "}
        <a href="mailto:info@sosstays.com" className="underline">
          info@sosstays.com
        </a>
      </p>
    </div>
  );
}

const WHAT_WE_DO = [
  "Dynamic pricing updated daily",
  "All guest messages and enquiries",
  "Cleaning and turnover coordination",
  "Airbnb, Booking.com and Vrbo listings",
  "Monthly owner statements and portal",
  "Review management and response",
  "Maintenance coordination",
  "Fáilte Ireland compliance guidance",
];

function BreakdownRow({
  label,
  value,
  tone,
  total = false,
}: {
  label: string;
  value: string;
  tone?: "green";
  total?: boolean;
}) {
  const valueClass = tone === "green" ? "text-forest-green" : "text-near-black";
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3.5 text-sm ${
        total ? "bg-light-forest-green/30 font-semibold" : "border-b border-sage-grey/30"
      }`}
    >
      <span className="text-near-black/70">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
