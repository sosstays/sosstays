"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { trackLead } from "@/lib/analytics";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";

const CONTACT_EMAIL = "info@sosstays.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "form" | "error";

const LOCATION_PREFERENCE_OPTIONS = [
  "Within 10 min walking distance",
  "Within 30 min drive distance",
  "Flexible but within travel limits",
];

const ROOM_PREFERENCE_OPTIONS = [
  "Single rooms for each worker",
  "Sharing rooms acceptable",
  "Give me both options",
];

const SCHEDULE_PREFERENCE_OPTIONS = [
  "5 days / week",
  "7 days / week",
  "Vacate on holidays during the period",
];

const OTHER_REQUIREMENT_OPTIONS = [
  "WiFi",
  "Self-catering kitchen",
  "Parking",
  "Washing machine & dryer",
  "Disabled-friendly",
  "EV charger",
];

const HOW_HEARD_OPTIONS = [
  "Google search",
  "ChatGPT / Claude",
  "Social media",
  "Referred by a friend",
  "Email",
  "Other",
];

// Ordered one-question-at-a-time steps, Typeform-style: each step appears
// only once the one before it is answered, and most steps advance on their
// own as soon as an option is picked rather than waiting for a "Continue"
// click. Only "message" is optional — everything else gates forward
// progress, matching how the brief for this form was specified.
const STEP_IDS = [
  "location",
  "locationPreference",
  "workers",
  "roomPreference",
  "dates",
  "schedulePreference",
  "contact",
  "otherRequirements",
  "message",
  "howHeard",
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

export function CorporateLeadForm() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(0);

  const [location, setLocation] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [workers, setWorkers] = useState("");
  const [roomPreference, setRoomPreference] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedulePreference, setSchedulePreference] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otherRequirements, setOtherRequirements] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [consent, setConsent] = useState(false);

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleOtherRequirement(value: string) {
    setOtherRequirements((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function goBack() {
    setFieldError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function advanceFrom(stepId: StepId) {
    setFieldError(null);
    if (stepId === "contact") {
      if (!name.trim() || !email.trim() || !phone.trim() || !company.trim()) {
        setFieldError("Name, company, email and phone number are needed to send your SOS.");
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
    if (stepId === "location" && !location.trim()) {
      setFieldError("Tell us the location you need.");
      return;
    }
    if (stepId === "workers" && !workers.trim()) {
      setFieldError("Tell us how many workers need housing.");
      return;
    }
    if (stepId === "dates" && (!startDate || !endDate)) {
      setFieldError("Start and end dates are both needed.");
      return;
    }
    if (stepId === "dates" && startDate && endDate && endDate < startDate) {
      setFieldError("End date can't be before the start date.");
      return;
    }

    // Every step reachable via a "Continue" button (location, workers,
    // dates, contact, otherRequirements, message) comes before the final
    // "howHeard" step, which is radio-only and submits through
    // selectAndAdvance instead — so advancing here never needs to submit.
    setStep((s) => Math.min(LAST_STEP, s + 1));
  }

  // Radio/checkbox selections advance immediately (Typeform-style) instead
  // of waiting for a separate Continue click.
  // `howHeardValue` lets the very last selection reach the submit call
  // directly instead of through state: selectAndAdvance's setTimeout
  // closure is captured at click time, before setHowHeard's re-render
  // lands, so reading the `howHeard` state variable there would still see
  // its pre-click value. Every earlier field doesn't have this problem —
  // its own step's "Continue"/select already re-rendered well before the
  // user reaches this last step, so this render's closure has their
  // current values.
  function selectAndAdvance(stepId: StepId, value: string, setValue: (v: string) => void) {
    setValue(value);
    setFieldError(null);
    // Let the selected state paint before moving on.
    setTimeout(() => {
      if (step >= LAST_STEP) {
        submitLeadForm(stepId === "howHeard" ? value : undefined);
        return;
      }
      setStep((s) => s + 1);
    }, 150);
  }

  async function submitLeadForm(howHeardValue?: string) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/corporate-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          location: location.trim(),
          locationPreference,
          workers: workers.trim(),
          roomPreference,
          startDate,
          endDate,
          schedulePreference,
          otherRequirements,
          message: message.trim(),
          howHeard: howHeardValue ?? howHeard,
          consent: true,
        }),
      });
      if (!res.ok) throw new Error(`Corporate lead submission failed: ${res.status}`);
      trackLead("corporate_stays");
      router.push("/thank-you");
      return;
    } catch {
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Corporate accommodation enquiry"
  )}&body=${encodeURIComponent(
    [
      `Name: ${name}`,
      `Company: ${company}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Location needed: ${location}`,
      `Location preference: ${locationPreference}`,
      `Number of workers: ${workers}`,
      `Room preference: ${roomPreference}`,
      `Dates: ${startDate} to ${endDate}`,
      `Schedule preference: ${schedulePreference}`,
      `Other requirements: ${otherRequirements.join(", ")}`,
      `How they heard about us: ${howHeard}`,
      "",
      message,
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
      {/* Slim top progress bar + step count, Typeform-style, instead of the
          old numbered-segment stepper — reads better across 10 steps than
          10 circles would. */}
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

      {stepId === "location" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">
            Where do you need accommodation?
          </h3>
          <input
            autoFocus
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && advanceFrom("location")}
            placeholder="e.g. Ardee, Co. Louth"
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          />
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-end">
            <Button onClick={() => advanceFrom("location")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "locationPreference" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">
            What&apos;s your location preference?
          </h3>
          <div className="flex flex-col gap-2.5">
            {LOCATION_PREFERENCE_OPTIONS.map((option) => (
              <RadioOption
                key={option}
                label={option}
                selected={locationPreference === option}
                onSelect={() => selectAndAdvance("locationPreference", option, setLocationPreference)}
              />
            ))}
          </div>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <button type="button" onClick={goBack} className="mt-1 self-start text-sm font-semibold text-near-black/60 hover:text-near-black">
            Back
          </button>
        </div>
      )}

      {stepId === "workers" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">How many workers need housing?</h3>
          <input
            autoFocus
            inputMode="numeric"
            value={workers}
            onChange={(e) => setWorkers(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && advanceFrom("workers")}
            placeholder="e.g. 6"
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          />
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("workers")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "roomPreference" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">State your room preference</h3>
          <div className="flex flex-col gap-2.5">
            {ROOM_PREFERENCE_OPTIONS.map((option) => (
              <RadioOption
                key={option}
                label={option}
                selected={roomPreference === option}
                onSelect={() => selectAndAdvance("roomPreference", option, setRoomPreference)}
              />
            ))}
          </div>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <button type="button" onClick={goBack} className="mt-1 self-start text-sm font-semibold text-near-black/60 hover:text-near-black">
            Back
          </button>
        </div>
      )}

      {stepId === "dates" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Start and end dates</h3>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
          </div>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("dates")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "schedulePreference" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">What&apos;s your schedule preference?</h3>
          <p className="text-[13px] leading-relaxed text-near-black/60">
            This is important — workers staying 5 days a week in the property vs. 7 days a week makes a
            considerable change to the quote.
          </p>
          <div className="flex flex-col gap-2.5">
            {SCHEDULE_PREFERENCE_OPTIONS.map((option) => (
              <RadioOption
                key={option}
                label={option}
                selected={schedulePreference === option}
                onSelect={() => selectAndAdvance("schedulePreference", option, setSchedulePreference)}
              />
            ))}
          </div>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
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
                Name <span className="text-error-red">*</span>
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>
                Company <span className="text-error-red">*</span>
              </span>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Civils Ltd"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>
                Email <span className="text-error-red">*</span>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>
                Phone <span className="text-error-red">*</span>
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 087 123 4567"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
          </div>
          <ConsentCheckbox checked={consent} onChange={setConsent} accent="maroon" />
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("contact")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "otherRequirements" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Any other requirements?</h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {OTHER_REQUIREMENT_OPTIONS.map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={otherRequirements.includes(option)}
                onToggle={() => toggleOtherRequirement(option)}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("otherRequirements")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "message" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Anything else to note?</h3>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            <span>Anything else to note about the requirement (optional)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Site location, rotation pattern, anything else that would help…"
              rows={4}
              className="min-h-[120px] resize-y rounded-[10px] border border-sage-grey/50 bg-cream p-4 font-sans text-[15px] text-near-black"
            />
          </label>
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("message")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
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
                onSelect={() => selectAndAdvance("howHeard", option, setHowHeard)}
              />
            ))}
          </div>
          {submitError && <p role="alert" className="text-[13px] text-error-red">{submitError}</p>}
          <div className="mt-1 flex items-center justify-between">
            <button type="button" onClick={goBack} className="text-sm font-semibold text-near-black/60 hover:text-near-black">
              Back
            </button>
            {submitting && <span className="text-sm text-near-black/60">Sending…</span>}
          </div>
        </div>
      )}
    </div>
  );
}
