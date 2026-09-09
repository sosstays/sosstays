"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

const CONTACT_EMAIL = "info@sosstays.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "form" | "submitted" | "error";

// The corporate-stays page's "send your SOS" brief form — a three-step
// wizard using the same progress-segment / step-card pattern as
// LandlordLeadForm, just with this page's field set (name/email required,
// everything else optional) instead of the landlord situation/property
// steps.
export function CorporateLeadForm() {
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [workers, setWorkers] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState("");

  const [step0Error, setStep0Error] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    if (step === 0) {
      if (!name.trim() || !email.trim()) {
        setStep0Error("Name and email are needed to send your SOS.");
        return;
      }
      if (!EMAIL_PATTERN.test(email.trim())) {
        setStep0Error("Enter a valid email address.");
        return;
      }
      setStep0Error(null);
    }
    setStep((s) => Math.min(2, s + 1));
  }

  async function submitLeadForm() {
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
          workers: workers.trim(),
          duration: duration.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Corporate lead submission failed: ${res.status}`);
      setStage("submitted");
    } catch {
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Corporate accommodation enquiry"
  )}&body=${encodeURIComponent(
    `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nPhone: ${phone}\nLocation needed: ${location}\nNumber of workers: ${workers}\nDuration: ${duration}\n\n${message}`
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
    <div className="rounded-[18px] border border-sage-grey/40 bg-warm-cream p-8 text-left sm:p-11">
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
          <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">Let&apos;s start with you</h3>
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
              <span>Company</span>
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
              <span>Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 087 123 4567"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
          </div>
          {step0Error && (
            <p role="alert" className="text-[13px] text-error-red">
              {step0Error}
            </p>
          )}
          <div className="mt-1 flex justify-end">
            <Button onClick={goNext} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue →
            </Button>
          </div>
        </div>
      )}

      {stage === "form" && step === 1 && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">What do you need?</h3>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>Location needed</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Louth, Clare, Wexford, Wicklow…"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>Number of workers</span>
              <input
                value={workers}
                onChange={(e) => setWorkers(e.target.value)}
                placeholder="6"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            <span>Duration (dates or weeks/months)</span>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Mar – Jun, or “about 8 weeks”"
              className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
            />
          </label>
          <div className="mt-1 flex justify-between">
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold whitespace-nowrap text-near-black"
            >
              ← Back
            </button>
            <Button onClick={goNext} variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
              Continue →
            </Button>
          </div>
        </div>
      )}

      {stage === "form" && step === 2 && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">Anything else?</h3>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            <span>Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Site location, parking, rotation pattern…"
              rows={4}
              className="min-h-[120px] resize-y rounded-[10px] border border-sage-grey/50 bg-cream p-4 font-sans text-[15px] text-near-black"
            />
          </label>
          {submitError && (
            <p role="alert" className="text-[13px] text-error-red">
              {submitError}
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
          <p className="text-sm leading-relaxed text-near-black/70">
            We&apos;ll come back with real options — or tell you straight if we can&apos;t cover it yet.
          </p>
        </div>
      )}

      {stage === "error" && (
        <div>
          <p className="mb-2 text-base font-semibold text-near-black">That didn&apos;t go through.</p>
          <p className="mb-4 text-sm leading-relaxed text-near-black/70">
            Sorry about that — send it to us directly instead and we&apos;ll pick it up from there.
          </p>
          <Button link={mailtoHref} external variant="primary" bgColor="maroon" color="cream" animateColor="maroon" size="sm">
            Email us instead
          </Button>
        </div>
      )}
    </div>
  );
}
