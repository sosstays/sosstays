"use client";

import { useState } from "react";

const SITUATION_OPTIONS = [
  "I have an existing Airbnb/STR property I'd like help managing",
  "I have a property in long-term rental which I'm considering moving to STR and would want management",
  "I'm not sure — I just need to speak to someone",
  "I'm exploring setting up an Airbnb in a property/land I own",
];

const CONTACT_EMAIL = "hello@sosstays.ie";

function encodeForm(data: Record<string, string>) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k] ?? ""))
    .join("&");
}

type Stage = "form" | "done" | "error";

export function LandlordLeadForm() {
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [step2Error, setStep2Error] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }
  function goNext() {
    setStep((s) => Math.min(2, s + 1));
  }

  async function submitLeadForm() {
    if (!name.trim() || !email.trim() || !mobile.trim()) {
      setStep2Error(true);
      return;
    }
    setStep2Error(false);
    setSubmitting(true);
    try {
      // Netlify Forms AJAX pattern (per Netlify's own docs) — POST to "/"
      // with a body matching the hidden static <form name="landlord-leads">
      // below field-for-field. That hidden form is what lets Netlify's
      // build-time bot register the form; it only needs to appear once,
      // anywhere in the site's static output (see /landlords, which is
      // statically prerendered). If this site isn't deployed on Netlify —
      // or Netlify's forms bot didn't pick this form up — this POST won't
      // actually be captured, and the error branch below offers a mailto
      // fallback so the lead isn't silently lost.
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm({
          "form-name": "landlord-leads",
          name,
          email,
          mobile,
          situation,
          propertyDescription,
          "bot-field": "",
        }),
      });
      if (!res.ok) throw new Error(`Form submission failed: ${res.status}`);
      setStage("done");
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
    <div className="rounded-[18px] bg-white p-8 text-left sm:p-11">
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
          <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">
            Which best describes you?
          </h3>
          <div className="flex flex-col gap-2.5">
            {SITUATION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
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
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-maroon px-6 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-85"
            >
              Continue →
            </button>
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
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-maroon px-6 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-85"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {stage === "form" && step === 2 && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-near-black sm:text-xl">
            Almost there
          </h3>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            Mobile number
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 087 123 4567"
              className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
            />
          </label>
          {step2Error && (
            <p className="text-[13px] text-maroon">
              Name, email, and mobile are all needed to send your SOS.
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
            <button
              type="button"
              disabled={submitting}
              onClick={submitLeadForm}
              className="rounded-full bg-maroon px-7 py-3.5 text-sm font-semibold text-cream transition-opacity hover:opacity-85 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send your SOS"}
            </button>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div>
          <p className="mb-2 text-base font-semibold text-near-black">
            Got it — we&apos;ll be in touch shortly.
          </p>
          <p className="text-sm leading-relaxed text-near-black/70">
            We read every one of these ourselves, {name}.
          </p>
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
          <a
            href={mailtoHref}
            className="inline-block rounded-full bg-maroon px-6 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-85"
          >
            Email us instead
          </a>
        </div>
      )}
    </div>
  );
}
