"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import type { LandlordContact } from "@/lib/landlordHandoff";

const SITUATION_OPTIONS = [
  "I have an existing Airbnb/STR property I'd like help managing",
  "I have a property in long-term rental which I'm considering moving to STR and would want management",
  "I'm exploring setting up an Airbnb in a property/land I own",
  "I'm not sure — I just need to speak to someone",
];

const CONTACT_EMAIL = "info@sosstays.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "form" | "submitted" | "error";

export function LandlordLeadForm({
  onSubmitted,
}: {
  /** Fires once the lead form submits successfully, with the name/email
   *  entered — lets a parent hand them straight to the estimate calculator
   *  further down the page without asking for them again. */
  onSubmitted?: (contact: LandlordContact) => void;
} = {}) {
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [step0Error, setStep0Error] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }
  function goNext() {
    if (step === 0 && !situation) {
      setStep0Error(true);
      return;
    }
    setStep0Error(false);
    setStep((s) => Math.min(2, s + 1));
  }

  async function submitLeadForm() {
    if (!name.trim() || !email.trim() || !mobile.trim()) {
      setStep2Error("Name, email and mobile number are needed to send your SOS.");
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setStep2Error("Enter a valid email address.");
      return;
    }
    setStep2Error(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/mailerlite-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, situation, propertyDescription }),
      });
      if (!res.ok) throw new Error(`Form submission failed: ${res.status}`);
      onSubmitted?.({ name: name.trim(), email: email.trim() });
      setStage("submitted");
    } catch {
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Landlord enquiry"
  )}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nSituation: ${situation}\n\n${propertyDescription}`
  )}`;

  const progressSegments = [0, 1, 2].map((i) => {
    const reached = stage !== "form" || i <= step;
    return {
      number: i + 1,
      grow: i < 2,
      reached,
      lineReached: stage !== "form" || i < step,
    };
  });

  return (
    <div className="rounded-[18px] border border-sage-grey/40 p-8 text-left sm:p-11">
      {stage === "form" && (
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
      )}

      {stage === "form" && step === 0 && (
        <div className="flex flex-col gap-4.5">
          <h3 id="situation-label" className="font-serif text-lg font-bold text-near-black sm:text-xl">
            Which best describes you? <span className="text-error-red">*</span>
          </h3>
          <div role="radiogroup" aria-labelledby="situation-label" className="flex flex-col gap-2.5">
            {SITUATION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={situation === option}
                onClick={() => setSituation(option)}
                className="cursor-pointer rounded-[10px] border px-4.5 py-4 text-left text-sm leading-snug font-medium"
                style={{
                  background: situation === option ? "var(--maroon)" : "var(--cream)",
                  color: situation === option ? "var(--cream)" : "var(--near-black)",
                  borderColor: situation === option ? "var(--maroon)" : "var(--sage-grey)",
                }}
              >
                {option}
              </button>
            ))}
          </div>
          {step0Error && (
            <p role="alert" className="text-[13px] text-error-red">
              Pick an option to continue.
            </p>
          )}
          <div className="mt-1 flex justify-end">
            <Button
              onClick={goNext}
              variant="primary"
              bgColor="maroon"
              color="cream"
              animateColor="maroon"
              size="sm"
            >
              Continue →
            </Button>
          </div>
        </div>
      )}

      {stage === "form" && step === 1 && (
        <div className="flex flex-col gap-3.5">
          <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">
            Where is it, and what makes it special?
          </h3>
          <p className="text-[13px] text-near-black/60">
            Tell us the location, and anything that makes the place stand out — the views, the
            setup, what guests would love about it.
          </p>
          <textarea
            value={propertyDescription}
            onChange={(e) => setPropertyDescription(e.target.value)}
            placeholder="A couple of sentences is plenty…"
            className="min-h-[140px] w-full resize-y rounded-[10px] border border-sage-grey/50 bg-cream p-4 font-sans text-[15px] text-near-black"
          />
          <div className="mt-1 flex justify-between">
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black"
            >
              ← Back
            </button>
            <Button
              onClick={goNext}
              variant="primary"
              bgColor="maroon"
              color="cream"
              animateColor="maroon"
              size="sm"
            >
              Continue →
            </Button>
          </div>
        </div>
      )}

      {stage === "form" && step === 2 && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">
            Almost there
          </h3>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            <span>
              Name <span className="text-error-red">*</span>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
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
              Mobile number <span className="text-error-red">*</span>
            </span>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 087 123 4567"
              className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
            />
          </label>
          {step2Error && (
            <p role="alert" className="text-[13px] text-error-red">
              {step2Error}
            </p>
          )}
          <div className="mt-1 flex justify-between">
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black"
            >
              ← Back
            </button>
            <Button
              disabled={submitting}
              onClick={submitLeadForm}
              variant="primary"
              bgColor="maroon"
              color="cream"
              animateColor="maroon"
              size="custom"
              className="px-7 py-3.5 text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send your SOS"}
            </Button>
          </div>
        </div>
      )}

      {stage === "submitted" && (
        <div>
          <p className="mb-2 text-base font-semibold text-near-black">
            Got it — thanks, {name.trim() || "there"}.
          </p>
          <p className="mb-5 text-sm leading-relaxed text-near-black/70">
            One of the team will be in touch within a day or two. In the meantime, get a free
            revenue estimate for your property — no need to enter your details again.
          </p>
          <Button
            onClick={() =>
              document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })
            }
            variant="primary"
            bgColor="maroon"
            color="cream"
            animateColor="maroon"
            size="sm"
          >
            See your estimate ↓
          </Button>
        </div>
      )}

      {stage === "error" && (
        <div>
          <p className="mb-2 text-base font-semibold text-near-black">
            That didn&apos;t go through.
          </p>
          <p className="mb-4 text-sm leading-relaxed text-near-black/70">
            Sorry about that — send it to us directly instead and we&apos;ll pick it up from
            there.
          </p>
          <Button
            link={mailtoHref}
            external
            variant="primary"
            bgColor="maroon"
            color="cream"
            animateColor="maroon"
            size="sm"
          >
            Email us instead
          </Button>
        </div>
      )}
    </div>
  );
}
