"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";

const CONTACT_EMAIL_FALLBACK = "info@sosstays.com";

const TOPIC_OPTIONS = ["Media query", "About a booking", "Hiring", "Partnership", "Other"];

// Not a full RFC 5322 parser — just enough to catch "forgot the @" /
// "forgot the domain" typos without rejecting real addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A native <select>'s open listbox is drawn by the OS/browser, not the
// page — its background, highlight colour and option padding can't be
// themed with CSS. This is a plain button + listbox instead, so it can
// actually match the site (cream background, forest-green highlight,
// real padding).
function TopicDropdown({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-center justify-between border-b border-sage-grey/60 bg-transparent pb-1.5 text-left text-[15px] focus:border-forest-green focus:outline-none ${
          value ? "text-near-black" : "text-near-black/35"
        }`}
      >
        {value || "Select one"}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className={`h-3.5 w-3.5 flex-none text-near-black/50 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-[10px] border border-sage-grey/40 bg-cream py-1.5 shadow-[0_12px_24px_rgba(23,25,23,0.12)]"
        >
          {TOPIC_OPTIONS.map((option) => (
            <li key={option} role="option" aria-selected={value === option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-[15px] transition-colors ${
                  value === option
                    ? "bg-forest-green/10 font-medium text-forest-green"
                    : "text-near-black hover:bg-forest-green/10"
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ContactForm({ contactEmail }: { contactEmail?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toEmail = contactEmail || CONTACT_EMAIL_FALLBACK;

  function openMailtoFallback() {
    const subject = `${topic} — message from ${name.trim()}`;
    const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
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
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Contact form submission failed: ${res.status}`);
      setSent(true);
    } catch {
      // MailerLite is down, misconfigured, or the network request failed —
      // fall back to opening the visitor's own mail client rather than
      // silently losing the message.
      openMailtoFallback();
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
          explicit z-index here, this field's open dropdown panel would
          paint *behind* the later Message/Button fields instead of over
          them. */}
      <label className="relative z-20 flex flex-col gap-1.5">
        <span className="text-sm text-near-black">
          What&apos;s this about? <span className="text-error-red">*</span>
        </span>
        <TopicDropdown value={topic} onChange={setTopic} />
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
        <p className="-mt-2 animate-[sos-highlight-fade-in_0.6s_ease-in-out_both] text-[13px] text-error-red">
          {error}
        </p>
      )}
      {sent && !error && (
        <p className="-mt-2 animate-[sos-highlight-fade-in_0.6s_ease-in-out_both] text-[13px] text-forest-green">
          Thanks — we&apos;ll get back to you shortly.
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
