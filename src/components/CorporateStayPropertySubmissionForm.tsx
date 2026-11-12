"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HOW_HEARD_OPTIONS = [
  "Google search",
  "ChatGPT / Claude",
  "Social media",
  "Referred by a friend",
  "Email",
  "Other",
];

const STEP_IDS = ["basics", "capacity", "details", "pricing", "contact", "review"] as const;
type StepId = (typeof STEP_IDS)[number];
const LAST_STEP = STEP_IDS.length - 1;

type FormState = {
  propertyName: string;
  area: string;
  county: string;
  listingUrl: string;
  maxGuestsStandard: string;
  maxGuestsExtended: string;
  bedrooms: string;
  bedsTotal: string;
  bathrooms: string;
  bedroomBreakdown: string;
  amenities: string;
  description: string;
  photosUrl: string;
  occupancyGuests: string;
  ownerQuoteEur: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  publicListingConsent: "" | "yes" | "no";
  howHeard: string;
  notes: string;
};

const EMPTY_STATE: FormState = {
  propertyName: "",
  area: "",
  county: "",
  listingUrl: "",
  maxGuestsStandard: "",
  maxGuestsExtended: "",
  bedrooms: "",
  bedsTotal: "",
  bathrooms: "",
  bedroomBreakdown: "",
  amenities: "",
  description: "",
  photosUrl: "",
  occupancyGuests: "",
  ownerQuoteEur: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  publicListingConsent: "",
  howHeard: "",
  notes: "",
};

const INPUT_CLASS =
  "rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black";
const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[100px] resize-y`;
const LABEL_CLASS = "flex flex-col gap-1.5 text-sm text-near-black";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={LABEL_CLASS}>
      <span>
        {label} {required && <span className="text-error-red">*</span>}
      </span>
      {children}
    </label>
  );
}

export function CorporateStayPropertySubmissionForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [consent, setConsent] = useState(false);
  const [wantsManagementInfo, setWantsManagementInfo] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function goBack() {
    setFieldError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function advanceFrom(stepId: StepId) {
    setFieldError(null);
    if (stepId === "basics" && !form.propertyName.trim()) {
      setFieldError("Tell us the property's name.");
      return;
    }
    if (stepId === "capacity" && (!form.maxGuestsStandard.trim() || !form.bedrooms.trim() || !form.bathrooms.trim())) {
      setFieldError("Max guests, bedrooms and bathrooms are needed.");
      return;
    }
    if (stepId === "contact") {
      if (!form.ownerName.trim() || !form.ownerPhone.trim() || !form.ownerEmail.trim()) {
        setFieldError("Your name, phone and email are needed.");
        return;
      }
      if (!EMAIL_PATTERN.test(form.ownerEmail.trim())) {
        setFieldError("Enter a valid email address.");
        return;
      }
      if (!form.publicListingConsent) {
        setFieldError("Let us know if this property can be shown publicly.");
        return;
      }
      if (!consent) {
        setFieldError("Please agree to the Privacy Policy to continue.");
        return;
      }
    }
    setStep((s) => Math.min(LAST_STEP, s + 1));
  }

  async function submit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/corporate-stay-property-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyName: form.propertyName.trim(),
          area: form.area.trim(),
          county: form.county.trim(),
          listingUrl: form.listingUrl.trim(),
          maxGuestsStandard: form.maxGuestsStandard,
          maxGuestsExtended: form.maxGuestsExtended,
          bedrooms: form.bedrooms,
          bedsTotal: form.bedsTotal,
          bathrooms: form.bathrooms,
          bedroomBreakdown: form.bedroomBreakdown.trim(),
          amenities: form.amenities.trim(),
          description: form.description.trim(),
          photosUrl: form.photosUrl.trim(),
          occupancyGuests: form.occupancyGuests.trim(),
          ownerQuoteEur: form.ownerQuoteEur,
          ownerName: form.ownerName.trim(),
          ownerPhone: form.ownerPhone.trim(),
          ownerEmail: form.ownerEmail.trim(),
          publicListingConsent: form.publicListingConsent,
          howHeard: form.howHeard,
          notes: form.notes.trim(),
          wantsManagementInfo,
          consent: true,
        }),
      });
      if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
      setDone(true);
    } catch {
      setSubmitError("That didn't go through — please try again, or email hello@sosstays.com directly.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[18px] border border-sage-grey/40 bg-warm-cream p-8 text-center sm:p-11">
        <h3 className="font-serif mb-2 text-xl font-bold text-maroon">Thanks — we&apos;ve got it.</h3>
        <p className="mx-auto max-w-[42ch] text-[14px] leading-relaxed text-near-black/65">
          Our team will review {form.propertyName || "your property"} and be in touch about next steps.
          If you gave us a price estimate, we&apos;ll confirm it against a real client before anything is agreed.
          {wantsManagementInfo && " Keena will also be in touch about property management."}
        </p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => router.push("/corporate-stays")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
            Back to Corporate Stays
          </Button>
        </div>
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

      {stepId === "basics" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">About the property</h3>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <Field label="Property name" required>
              <input
                autoFocus
                value={form.propertyName}
                onChange={(e) => set("propertyName", e.target.value)}
                placeholder="e.g. Rathescar Grove"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Area / town">
              <input value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Ardee" className={INPUT_CLASS} />
            </Field>
            <Field label="County">
              <input value={form.county} onChange={(e) => set("county", e.target.value)} placeholder="e.g. Louth" className={INPUT_CLASS} />
            </Field>
            <Field label="Airbnb or Booking.com link (optional)">
              <input
                value={form.listingUrl}
                onChange={(e) => set("listingUrl", e.target.value)}
                placeholder="https://airbnb.com/rooms/..."
                className={INPUT_CLASS}
              />
            </Field>
          </div>
          <p className="text-[13px] leading-relaxed text-near-black/55">
            We can&apos;t pull details from a listing link automatically yet — it&apos;s just handy for
            our team to see the live listing. Fill in the rest by hand below.
          </p>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-end">
            <Button onClick={() => advanceFrom("basics")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "capacity" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Guests &amp; layout</h3>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <Field label="Max guests (standard)" required>
              <input inputMode="numeric" value={form.maxGuestsStandard} onChange={(e) => set("maxGuestsStandard", e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Max guests (by arrangement, extra fee)">
              <input inputMode="numeric" value={form.maxGuestsExtended} onChange={(e) => set("maxGuestsExtended", e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Bedrooms" required>
              <input inputMode="numeric" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Beds (total)">
              <input inputMode="numeric" value={form.bedsTotal} onChange={(e) => set("bedsTotal", e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Bathrooms" required>
              <input inputMode="numeric" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} className={INPUT_CLASS} />
            </Field>
          </div>
          <Field label="Bedroom-by-bedroom layout (optional)">
            <textarea
              value={form.bedroomBreakdown}
              onChange={(e) => set("bedroomBreakdown", e.target.value)}
              placeholder="Bedroom 1: Queen bed. Bedroom 2: Two singles..."
              className={TEXTAREA_CLASS}
            />
          </Field>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("capacity")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "details" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Amenities &amp; photos</h3>
          <Field label="Amenities">
            <textarea
              value={form.amenities}
              onChange={(e) => set("amenities", e.target.value)}
              placeholder="WiFi, washing machine, parking, EV charger..."
              className={TEXTAREA_CLASS}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="A short description of the property"
              className={TEXTAREA_CLASS}
            />
          </Field>
          <Field label="Link to photos (optional)">
            <input
              value={form.photosUrl}
              onChange={(e) => set("photosUrl", e.target.value)}
              placeholder="A Google Drive/Dropbox folder, or the listing page"
              className={INPUT_CLASS}
            />
          </Field>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("details")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "pricing" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Estimated corporate pricing</h3>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <Field label="Max guests this price is based on">
              <input inputMode="numeric" value={form.occupancyGuests} onChange={(e) => set("occupancyGuests", e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Estimated total price, whole property (EUR)">
              <input inputMode="numeric" value={form.ownerQuoteEur} onChange={(e) => set("ownerQuoteEur", e.target.value)} placeholder="e.g. 2200" className={INPUT_CLASS} />
            </Field>
          </div>
          <p className="text-[13px] leading-relaxed text-near-black/55">
            This isn&apos;t your regular Airbnb nightly rate — it&apos;s a discounted corporate rate, since a
            monthly corporate stay is paid in full by direct bank transfer and is assured income for that
            period, lower risk than a platform booking. It&apos;s an estimate only: Sos Stays will come back
            to confirm the real price once there&apos;s an actual client and budget to price against, and the
            figure may be adjusted within a reasonable margin from what you submit here. Leave it blank if
            you&apos;d rather we come back with a number — the property still gets listed, shown as &quot;price
            on request&quot;.
          </p>
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("pricing")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {stepId === "contact" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Your details</h3>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <Field label="Name" required>
              <input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Phone" required>
              <input type="tel" value={form.ownerPhone} onChange={(e) => set("ownerPhone", e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Email" required>
              <input type="email" value={form.ownerEmail} onChange={(e) => set("ownerEmail", e.target.value)} className={INPUT_CLASS} />
            </Field>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-near-black">
              Can we show this property publicly on our corporate stays page? <span className="text-error-red">*</span>
            </span>
            <p className="text-[13px] leading-relaxed text-near-black/55">
              Either way your name, phone, email and listing link are never shown publicly — this only
              controls whether the property itself (photos, area, price) appears in our public showcase.
            </p>
            <div className="flex gap-3">
              {(["yes", "no"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("publicListingConsent", value)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold capitalize ${
                    form.publicListingConsent === value
                      ? "border-maroon bg-maroon/10 text-maroon"
                      : "border-sage-grey/50 bg-cream text-near-black"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <Field label="How did you hear about us?">
            <select
              value={form.howHeard}
              onChange={(e) => set("howHeard", e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">— Select one —</option>
              {HOW_HEARD_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>

          <Field label="Anything else to flag (optional)">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className={TEXTAREA_CLASS} />
          </Field>

          <ConsentCheckbox checked={consent} onChange={setConsent} accent="maroon" />
          {fieldError && <p role="alert" className="text-[13px] text-error-red">{fieldError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={() => advanceFrom("contact")} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Review
            </Button>
          </div>
        </div>
      )}

      {stepId === "review" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-maroon sm:text-xl">Review before submitting</h3>
          <p className="text-[13px] leading-relaxed text-near-black/55">
            Check everything below is right — this is exactly what we&apos;ll store. You can go back and
            change anything before submitting.
          </p>
          <dl className="flex flex-col divide-y divide-sage-grey/30 rounded-[12px] border border-sage-grey/40 bg-cream/60 text-sm">
            <ReviewRow label="Property" value={form.propertyName} />
            <ReviewRow label="Area / county" value={[form.area, form.county].filter(Boolean).join(", ")} />
            <ReviewRow label="Listing link" value={form.listingUrl} />
            <ReviewRow
              label="Guests / bedrooms / bathrooms"
              value={[
                form.maxGuestsStandard && `${form.maxGuestsStandard} guests`,
                form.maxGuestsExtended && `(${form.maxGuestsExtended} by arrangement)`,
                form.bedrooms && `${form.bedrooms} bed`,
                form.bathrooms && `${form.bathrooms} bath`,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
            <ReviewRow label="Bedroom layout" value={form.bedroomBreakdown} />
            <ReviewRow label="Amenities" value={form.amenities} />
            <ReviewRow label="Description" value={form.description} />
            <ReviewRow label="Photos" value={form.photosUrl} />
            <ReviewRow
              label="Estimated price"
              value={
                form.ownerQuoteEur
                  ? `€${form.ownerQuoteEur} total, for ${form.occupancyGuests || "?"} guests (estimate only)`
                  : "Not given — will show as price on request"
              }
            />
            <ReviewRow label="Your details" value={[form.ownerName, form.ownerPhone, form.ownerEmail].filter(Boolean).join(" · ")} />
            <ReviewRow label="Public listing" value={form.publicListingConsent === "yes" ? "Can be shown publicly" : "Not shown publicly"} />
            <ReviewRow label="How they heard about us" value={form.howHeard} />
            <ReviewRow label="Notes" value={form.notes} />
          </dl>

          {/* Optional, unticked by default — separate from the corporate-stays
              submission itself, so it sits after the review as the last thing
              before submitting. */}
          <div className="rounded-[12px] border border-sage-grey/40 bg-cream/60 p-5">
            <h4 className="font-serif text-base font-bold text-maroon">One more thing, if it&apos;s useful</h4>
            <p className="mt-1.5 text-[13px] leading-relaxed text-near-black/65">
              Separately from corporate stays, we also manage properties fully — guests, cleaning, changeovers
              and the day-to-day running, off your shoulders. Would you like to know more?
            </p>
            <label className="mt-3.5 flex items-start gap-2.5 text-sm leading-relaxed text-near-black">
              <input
                type="checkbox"
                checked={wantsManagementInfo}
                onChange={(e) => setWantsManagementInfo(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-none"
                style={{ accentColor: "var(--maroon)" }}
              />
              <span>Yes, I&apos;d like to talk to Keena Duffy about property management.</span>
            </label>
          </div>

          {submitError && <p role="alert" className="text-[13px] text-error-red">{submitError}</p>}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={goBack} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black">
              Back
            </button>
            <Button onClick={submit} disabled={submitting} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              {submitting ? "Submitting…" : "Submit property"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="font-medium text-near-black/60">{label}</dt>
      <dd className="text-near-black">{value || "—"}</dd>
    </div>
  );
}
