"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { PARTNER_CATEGORIES } from "@/lib/partnersData";

const CONTACT_EMAIL = "hello@sosstays.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "form" | "submitted" | "error";

// The partners page's "Become a partner" form — single step, following
// the field set and validation pattern from CorporateLeadForm.
export function PartnerLeadForm() {
  const [stage, setStage] = useState<Stage>("form");

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [referral, setReferral] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !contactName.trim() || !email.trim()) {
      setError("Business name, contact name and email are needed to apply.");
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/partner-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website: website.trim(),
          category,
          about: about.trim(),
          location: location.trim(),
          referral: referral.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Partner lead submission failed: ${res.status}`);
      setStage("submitted");
    } catch {
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Partner application"
  )}&body=${encodeURIComponent(
    `Business name: ${businessName}\nContact name: ${contactName}\nEmail: ${email}\nPhone: ${phone}\nWebsite: ${website}\nCategory: ${category}\nBased in: ${location}\n\n${about}`
  )}`;

  if (stage === "submitted") {
    return (
      <div className="rounded-[18px] border border-sage-grey/40 bg-warm-cream p-8 text-left sm:p-11">
        <p className="mb-2 text-base font-semibold text-near-black">
          Got it — thanks, {contactName.trim() || "there"}.
        </p>
        <p className="text-sm leading-relaxed text-near-black/70">
          We&apos;ll take a look and come back to you either way.
        </p>
      </div>
    );
  }

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

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-sage-grey/40 bg-warm-cream p-8 text-left sm:p-11"
    >
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-near-black">
          <span>
            Business name <span className="text-error-red">*</span>
          </span>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Acme Ltd"
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-near-black">
          <span>
            Contact name <span className="text-error-red">*</span>
          </span>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Jane Doe"
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
        <label className="flex flex-col gap-1.5 text-sm text-near-black">
          <span>Website / social link</span>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://…"
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-near-black">
          <span>What best describes you?</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          >
            <option value="">Select a category</option>
            {PARTNER_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.label}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-near-black">
          <span>Where are you based?</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Louth, Meath, Clare, Wexford…"
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-near-black">
          <span>How did you hear about Sos Stays?</span>
          <input
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            placeholder="Optional"
            className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
          />
        </label>
      </div>
      <label className="mt-4.5 flex flex-col gap-1.5 text-sm text-near-black">
        <span>Tell us about your business</span>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="What you do, and why guests would love it…"
          rows={4}
          className="min-h-[120px] resize-y rounded-[10px] border border-sage-grey/50 bg-cream p-4 font-sans text-[15px] text-near-black"
        />
      </label>
      {error && (
        <p role="alert" className="mt-4 text-[13px] text-error-red">
          {error}
        </p>
      )}
      <div className="mt-5 flex justify-end">
        <Button
          type="submit"
          disabled={submitting}
          variant="primary"
          bgColor="maroon"
          color="cream"
          animateColor="maroon"
          size="custom"
          className="px-7 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Apply to partner with us"}
        </Button>
      </div>
    </form>
  );
}
