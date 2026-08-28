"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Stage = "form" | "done" | "error";

// Compact email-capture form for the blog sidebar — posts straight to
// MailerLite via /api/newsletter-subscribe rather than embedding MailerLite's
// own form, so it can match the site's fonts/colors/pill-button styling.
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [validationError, setValidationError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`Subscribe failed: ${res.status}`);
      setStage("done");
    } catch {
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "done") {
    return (
      <div>
        <p className="text-[13px] font-semibold text-forest-green">You&apos;re on the list.</p>
        <p className="mt-1 text-[13px] leading-snug text-near-black/60">
          We&apos;ll only email when there&apos;s something worth reading.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-forest-green/70 uppercase">
        Newsletter
      </p>
      <p className="mt-1 text-[13px] font-semibold text-forest-green">
        Never miss a story <span className="text-error-red">*</span>
      </p>
      <p className="mt-1.5 mb-4 text-[13px] leading-snug text-near-black/60">
        Stories, guides, and inspiration for your next break — straight to your inbox. No spam.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-full border border-sage-grey/50 bg-cream px-4 py-2.5 font-sans text-sm text-near-black"
        />
        {validationError && (
          <p role="alert" className="text-[12px] text-error-red">
            Enter a valid email address.
          </p>
        )}
        {stage === "error" && (
          <p role="alert" className="text-[12px] text-error-red">
            That didn&apos;t go through — try again in a moment.
          </p>
        )}
        <Button
          type="submit"
          disabled={submitting}
          variant="primary"
          size="custom"
          className="px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
    </div>
  );
}
