"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const CONTACT_EMAIL_FALLBACK = "info@sosstays.com";

const TOPIC_OPTIONS = ["Media query", "About a booking", "Hiring", "Partnership", "Other"];

// Not a full RFC 5322 parser — just enough to catch "forgot the @" /
// "forgot the domain" typos without rejecting real addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ contactEmail }: { contactEmail?: string | null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [property, setProperty] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [usedMailtoFallback, setUsedMailtoFallback] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toEmail = contactEmail || CONTACT_EMAIL_FALLBACK;

  function openMailtoFallback() {
    const subject = `${topic} — message from ${name.trim()}`;
    const propertyLine = property.trim() ? `Property: ${property.trim()}\n` : "";
    const body = `${propertyLine}${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
    const mailtoHref = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoHref;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Let us know your name.");
      return;
    }
    if (!email.trim() || !EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!topic) {
      setError("Pick what this is about.");
      return;
    }
    if (!message.trim()) {
      setError("Add a message so we know how to help.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          property: property.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Contact form submission failed: ${res.status}`);
      setSent(true);
    } catch {
      // MailerLite is down, misconfigured, or the network request failed —
      // fall back to opening the visitor's own mail client rather than
      // silently losing the message. Flag it so we don't claim the message
      // reached us when it actually didn't.
      openMailtoFallback();
      setUsedMailtoFallback(true);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sos-form-stagger flex flex-col gap-7" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-near-black">
          Full Name <span className="text-error-red">*</span>
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-near-black">
          Email <span className="text-error-red">*</span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
        />
      </label>

      {/* relative z-20: the stagger animation puts a `transform` on every
          field, which makes each one its own stacking context — without an
          explicit z-index here, this dropdown's open panel would paint
          *behind* the later fields instead of over them. */}
      <label className="relative z-20 flex flex-col gap-1.5">
        <span className="text-sm text-near-black">
          What&apos;s this about? <span className="text-error-red">*</span>
        </span>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger>
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent>
            {TOPIC_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-near-black">Have a property you&apos;d like us to manage?</span>
        <input
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          placeholder="Property name"
          className="border-b border-sage-grey/60 bg-transparent pb-1.5 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-near-black">
          Message <span className="text-error-red">*</span>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          rows={2}
          className="min-h-[64px] resize-y rounded-[10px] border border-sage-grey/50 bg-transparent p-3 text-[15px] text-near-black placeholder:text-near-black/35 focus:border-forest-green focus:outline-none"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="-mt-2 animate-[sos-highlight-fade-in_0.6s_ease-in-out_both] text-[13px] text-error-red"
        >
          {error}
        </p>
      )}
      {sent && !error && !usedMailtoFallback && (
        <p className="-mt-2 animate-[sos-highlight-fade-in_0.6s_ease-in-out_both] text-[13px] text-forest-green">
          Thanks — we&apos;ll get back to you shortly.
        </p>
      )}
      {sent && !error && usedMailtoFallback && (
        <p
          role="alert"
          className="-mt-2 animate-[sos-highlight-fade-in_0.6s_ease-in-out_both] text-[13px] text-error-red"
        >
          We couldn&apos;t reach our server, so we&apos;ve opened your email client instead — please hit
          send there to get your message to us.
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        variant="primary"
        size="custom"
        className="self-start px-8 py-3 text-[15px] font-semibold transition-transform active:scale-95 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Contact Us"}
      </Button>
    </form>
  );
}
