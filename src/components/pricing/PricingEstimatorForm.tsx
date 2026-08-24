"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { AddressAutocomplete, type AddressAutocompleteValue } from "@/components/AddressAutocomplete";

const STATUS_OPTIONS = [
  { value: "airbnb", label: "Already an Airbnb host" },
  { value: "long-term", label: "Currently in a long-term let" },
  { value: "neither", label: "Neither yet" },
];

const BEDROOM_OPTIONS = ["Studio / 1 bed", "2 beds", "3 beds", "4 beds", "5+ beds"];

// Not a full RFC 5322 parser — just enough to catch "forgot the @" /
// "forgot the domain" typos without rejecting real addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PricingEstimatorForm({ countyName }: { countyName: string }) {
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function handleAddressSelect(value: AddressAutocompleteValue) {
    if (value.postalCode) setPostcode(value.postalCode);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setError("Add your property address.");
      return;
    }
    if (!bedrooms) {
      setError("Select the number of bedrooms.");
      return;
    }
    if (!currentStatus) {
      setError("Let us know your current situation.");
      return;
    }
    if (!email.trim() || !EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/pricing-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          address: address.trim(),
          postcode: postcode.trim(),
          county: countyName,
          bedrooms,
          currentStatus,
        }),
      });
      if (!res.ok) throw new Error(`Pricing lead submission failed: ${res.status}`);
      setSent(true);
    } catch {
      setError("Something went wrong sending that — email info@sosstays.com instead and we'll follow up.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[18px] bg-maroon p-8 text-center text-cream sm:p-10">
        <h3 className="mb-2 font-serif text-2xl font-bold">Thanks — we&apos;re on it</h3>
        <p className="mx-auto max-w-[440px] text-sm leading-relaxed text-light-sage/90">
          We&apos;ll work out what your {countyName} property could earn and get back to you by
          email within a couple of days.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] bg-maroon p-8 text-cream sm:p-10">
      <h3 className="mb-2 font-serif text-2xl font-bold">See what your {countyName} property could earn</h3>
      <p className="mb-7 max-w-[52ch] text-sm leading-relaxed text-cream/80">
        Tell us a bit about the property and we&apos;ll put together a personal estimate — we
        don&apos;t show a number here on the page, this goes to a real person on our team.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5" noValidate>
        <div className="[&_input]:bg-cream/95 [&_input]:text-near-black [&_label>span]:text-cream/85">
          <AddressAutocomplete
            label="Property address"
            required
            value={address}
            onChange={setAddress}
            onSelect={handleAddressSelect}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-cream/85">
            <span>
              Eircode / postcode <span className="text-error-red">*</span>
            </span>
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="A92 XXXX"
              className="rounded-[10px] border border-cream/30 bg-cream/95 px-4 py-3 font-sans text-[15px] text-near-black"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-cream/85">
            <span>
              Bedrooms <span className="text-error-red">*</span>
            </span>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="rounded-[10px] border border-cream/30 bg-cream/95 px-4 py-3 font-sans text-[15px] text-near-black"
            >
              <option value="">— Select —</option>
              {BEDROOM_OPTIONS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-2 text-sm text-cream/85">
          <span>
            Your situation right now <span className="text-error-red">*</span>
          </span>
          <div className="flex flex-wrap gap-2.5">
            {STATUS_OPTIONS.map((opt) => {
              const active = currentStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCurrentStatus(opt.value)}
                  className="cursor-pointer rounded-full border px-4 py-2 text-[13px] font-medium whitespace-nowrap"
                  style={{
                    background: active ? "var(--cream)" : "transparent",
                    borderColor: active ? "var(--cream)" : "rgba(254,254,227,0.4)",
                    color: active ? "var(--maroon)" : "var(--cream)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-cream/85">
          <span>
            Email <span className="text-error-red">*</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-[10px] border border-cream/30 bg-cream/95 px-4 py-3 font-sans text-[15px] text-near-black"
          />
        </label>

        {error && <p className="text-[13px] text-error-red">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          variant="primary"
          bgColor="cream"
          color="maroon"
          animateColor="maroon"
          size="custom"
          className="mt-1 self-start px-7 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Get My Estimate"}
        </Button>
      </form>
    </div>
  );
}
