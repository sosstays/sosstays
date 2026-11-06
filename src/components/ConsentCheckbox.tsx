"use client";

import Link from "next/link";

// Shared GDPR consent checkbox for every lead-gen form (contact, corporate,
// landlord, partner). Unticked by default — a pre-ticked consent checkbox
// isn't valid consent under GDPR (Recital 32: consent can't be inferred
// from silence, pre-ticked boxes, or inactivity), so every caller must
// require an explicit, affirmative check before submitting.
export function ConsentCheckbox({
  checked,
  onChange,
  error,
  accent = "forest-green",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | null;
  accent?: "forest-green" | "maroon";
}) {
  const accentVar = accent === "maroon" ? "var(--maroon)" : "var(--forest-green)";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-near-black/70">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-none"
          style={{ accentColor: accentVar }}
        />
        <span>
          I agree to the{" "}
          <Link
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
            style={{ color: accentVar }}
          >
            Privacy Policy
          </Link>
          . <span className="text-error-red">*</span>
        </span>
      </label>
      {error && (
        <p role="alert" className="text-[13px] text-error-red">
          {error}
        </p>
      )}
    </div>
  );
}
