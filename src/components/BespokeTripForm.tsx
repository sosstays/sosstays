"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";
import { trackEvent } from "@/lib/analytics";

const CONTACT_EMAIL = "hello@sosstays.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "form" | "error";

const EVENT_OPTIONS = [
  "Ryder Cup",
  "Wedding",
  "Paddy's Day",
  "Work trip",
  "Other",
  "No event — just a holiday",
];

const GROUP_SIZE_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

const ACCOMMODATION_OPTIONS = ["5-star", "4-star", "Self-catering", "Undecided — please advise"];

const INTEREST_OPTIONS = ["Golf tee times", "Family days out", "Both", "Other"];

const BASE_OR_ROUTE_OPTIONS = ["One base", "Touring route", "Not sure"];

const HOW_HEARD_OPTIONS = [
  "Google search",
  "ChatGPT / Claude",
  "Social media",
  "Referred by a friend",
  "Email",
  "Other",
];

// Ordered one-question-at-a-time steps, Typeform-style — same pattern as
// CorporateLeadForm.tsx (the site's existing precedent for this kind of
// form; there's no shared/generic stepper component to reuse, each lead
// form hand-rolls this same step-array + flat-JSX-blocks structure).
// Email/phone/consent are bundled into one final "contact" step, same as
// CorporateLeadForm's own "contact" step.
const STEP_IDS = [
  "name",
  "idealMonth",
  "eventType",
  "groupSize",
  "accommodationPreference",
  "interests",
  "baseOrRoute",
  "notes",
  "howHeard",
  "contact",
] as const;
type StepId = (typeof STEP_IDS)[number];
const LAST_STEP = STEP_IDS.length - 1;

function RadioOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-[10px] border px-4 py-3.5 text-left text-[15px] transition-colors ${
        selected
          ? "border-maroon bg-maroon/10 text-maroon"
          : "border-sage-grey/50 bg-cream text-near-black hover:border-maroon/40"
      }`}
    >
      <span
        className={`flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full border-2 ${
          selected ? "border-maroon" : "border-sage-grey"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-maroon" />}
      </span>
      {label}
    </button>
  );
}

function CheckboxOption({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-[10px] border px-4 py-3.5 text-left text-[15px] transition-colors ${
        checked
          ? "border-maroon bg-maroon/10 text-maroon"
          : "border-sage-grey/50 bg-cream text-near-black hover:border-maroon/40"
      }`}
    >
      <span
        className={`flex h-4.5 w-4.5 flex-none items-center justify-center rounded-[5px] border-2 ${
          checked ? "border-maroon bg-maroon" : "border-sage-grey"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

export function BespokeTripForm() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [idealMonth, setIdealMonth] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [groupSize, setGroupSize] = useState("");
  const [accommodationPreference, setAccommodationPreference] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [baseOrRoute, setBaseOrRoute] = useState("");
  const [notes, setNotes] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleEventType(value: string) {
    setEventTypes((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }
  function toggleInterest(value: string) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function goBack() {
    setFieldError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function advanceFrom(stepId: StepId) {
    setFieldError(null);
    if (stepId === "name" && !name.trim()) {
      setFieldError("Let us know your name.");
      return;
    }
    if (stepId === "idealMonth" && !idealMonth.trim()) {
      setFieldError("Tell us your ideal month (or \"Flexible\").");
      return;
    }
    if (stepId === "eventType" && eventTypes.length === 0) {
      setFieldError("Pick at least one option.");
      return;
    }
    if (stepId === "contact") {
      if (!email.trim()) {
        setFieldError("An email address is needed so we can come back to you.");
        return;
      }
      if (!EMAIL_PATTERN.test(email.trim())) {
        setFieldError("Enter a valid email address.");
        return;
      }
      if (!consent) {
        setFieldError("Please agree to the Privacy Policy to continue.");
        return;
      }
    }
    if (step >= LAST_STEP) {
      submitLeadForm();
      return;
    }
    setStep((s) => Math.min(LAST_STEP, s + 1));
  }

  // Single-select steps advance immediately (Typeform-style) instead of
  // waiting for a separate Continue click — same pattern as every other
  // lead form's radio steps.
  function selectAndAdvance(value: string, setValue: (v: string) => void) {
    setValue(value);
    setFieldError(null);
    setTimeout(() => {
      setStep((s) => Math.min(LAST_STEP, s + 1));
    }, 150);
  }

  function skip() {
    setFieldError(null);
    setStep((s) => Math.min(LAST_STEP, s + 1));
  }

  async function submitLeadForm() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bespoke-trip-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          idealMonth: idealMonth.trim(),
          eventType: eventTypes,
          groupSize,
          accommodationPreference,
          interests,
          baseOrRoute,
          notes: notes.trim(),
          howHeard,
          consent: true,
        }),
      });
      if (!res.ok) throw new Error(`Bespoke trip lead submission failed: ${res.status}`);
      // GTM listens for this event and forwards it to GA4. No PII in params.
      trackEvent("generate_lead", { form: "bespoke_ireland_trip", currency: "EUR" });
      router.push("/thank-you");
      return;
    } catch {
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Bespoke Ireland trip enquiry"
  )}&body=${encodeURIComponent(
    [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Ideal month: ${idealMonth}`,
      `Coming for an event: ${eventTypes.join(", ")}`,
      `Group size: ${groupSize}`,
      `Accommodation preference: ${accommodationPreference}`,
      `Interests: ${interests.join(", ")}`,
      `One base or touring route: ${baseOrRoute}`,
      `How they heard about us: ${howHeard}`,
      "",
      notes,
    ].join("\n")
  )}`;

  if (stage === "error") {
    return (
      <div className="rounded-[18px] border border-sage-grey/40 bg-warm-cream p-8 text-left sm:p-11">
        <p className="mb-2 text-base font-semibold text-near-black">That didn&apos;t go through.</p>
        <p className="mb-4 text-sm leading-relaxed text-near-black/70">
          Sorry about that — send it to us directly instead and we&apos;ll pick it up from there.
        </p>
        <Button link={mailtoHref} external variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
          Email us instead
        </Button>
      </div>
    );
  }

  const stepId = STEP_IDS[step];

  return (
    <div className="rounded-[18px] border border-sage-grey/40 bg-warm-cream p-8 text-left sm:p-11">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-near-black/50">
          <span>
            Step {step + 1} of {STEP_IDS.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-sage-grey/30">
          <div
            className="h-full rounded-full bg-maroon transition-all duration-300"
            style={{ width: `${((step + 1) / STEP_IDS.length) * 100}%` }}
          />
        </div>
      </div>

      {stepId === "name" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">
            What&apos;s your name? <span className="text-error-red">*</span>
          </h3>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && advanceFrom("name")}
            placeholder="Jane Doe"
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          />
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-end">
            <Button onClick={() => advanceFrom("name")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "idealMonth" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">
            Your ideal month? <span className="text-error-red">*</span>
          </h3>
          <input
            autoFocus
            value={idealMonth}
            onChange={(e) => setIdealMonth(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && advanceFrom("idealMonth")}
            placeholder="e.g. June 2026, or &quot;Flexible&quot;"
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          />
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("idealMonth")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "eventType" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">
            Are you coming to attend an event? <span className="text-error-red">*</span>
          </h3>
          <p className="text-[13px] leading-relaxed text-near-black/60">Tick all that apply.</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {EVENT_OPTIONS.map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={eventTypes.includes(option)}
                onToggle={() => toggleEventType(option)}
              />
            ))}
          </div>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("eventType")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "groupSize" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">
            Group size? <span className="text-error-red">*</span>
          </h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {GROUP_SIZE_OPTIONS.map((option) => (
              <RadioOption
                key={option}
                label={option}
                selected={groupSize === option}
                onSelect={() => selectAndAdvance(option, setGroupSize)}
              />
            ))}
          </div>
          <button type="button" onClick={goBack} className="mt-1 self-start text-sm font-semibold text-near-black/60 hover:text-near-black">
            Back
          </button>
        </div>
      )}

      {stepId === "accommodationPreference" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">
            Accommodation preference? <span className="text-error-red">*</span>
          </h3>
          <div className="flex flex-col gap-2.5">
            {ACCOMMODATION_OPTIONS.map((option) => (
              <RadioOption
                key={option}
                label={option}
                selected={accommodationPreference === option}
                onSelect={() => selectAndAdvance(option, setAccommodationPreference)}
              />
            ))}
          </div>
          <button type="button" onClick={goBack} className="mt-1 self-start text-sm font-semibold text-near-black/60 hover:text-near-black">
            Back
          </button>
        </div>
      )}

      {stepId === "interests" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">What are you interested in?</h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {INTEREST_OPTIONS.map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={interests.includes(option)}
                onToggle={() => toggleInterest(option)}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("interests")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "baseOrRoute" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">One base, or a touring route?</h3>
          <div className="flex flex-col gap-2.5">
            {BASE_OR_ROUTE_OPTIONS.map((option) => (
              <RadioOption
                key={option}
                label={option}
                selected={baseOrRoute === option}
                onSelect={() => selectAndAdvance(option, setBaseOrRoute)}
              />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <button type="button" onClick={goBack} className="text-sm font-semibold text-near-black/60 hover:text-near-black">
              Back
            </button>
            <button type="button" onClick={skip} className="text-sm font-semibold text-near-black/60 hover:text-near-black">
              Skip
            </button>
          </div>
        </div>
      )}

      {stepId === "notes" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Anything else?</h3>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            <span>e.g. ages of children, accessibility needs, anything we should know</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional…"
              rows={4}
              className="min-h-[120px] resize-y rounded-[10px] border border-sage-grey/50 bg-cream p-4 font-sans text-[15px] text-near-black"
            />
          </label>
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("notes")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "howHeard" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">How did you hear about us?</h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {HOW_HEARD_OPTIONS.map((option) => (
              <RadioOption
                key={option}
                label={option}
                selected={howHeard === option}
                onSelect={() => selectAndAdvance(option, setHowHeard)}
              />
            ))}
          </div>
          <button type="button" onClick={goBack} className="mt-1 self-start text-sm font-semibold text-near-black/60 hover:text-near-black">
            Back
          </button>
        </div>
      )}

      {stepId === "contact" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Let&apos;s get your details</h3>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>
                Email <span className="text-error-red">*</span>
              </span>
              <input
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>Mobile number</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 087 123 4567 (optional)"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
          </div>
          <ConsentCheckbox checked={consent} onChange={setConsent} accent="maroon" />
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          {submitError && <p role="alert" className="text-[13px] text-error-red">{submitError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button
              disabled={submitting}
              onClick={() => advanceFrom("contact")}
              variant="primary"
              bgColor="maroon"
              color="cream"
              animateColor="maroon"
              size="custom"
              className="px-7 py-3.5 text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Get my plan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
