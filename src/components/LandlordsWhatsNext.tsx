"use client";

import { useEffect, useState } from "react";
import { RevenueCalculator } from "@/components/RevenueCalculator";
import { readLandlordContact, type LandlordContact } from "@/lib/landlordHandoff";

export function LandlordsWhatsNext() {
  const [contact, setContact] = useState<LandlordContact | null>(null);
  const [checked, setChecked] = useState(false);

  // sessionStorage only exists client-side, so reading it during render
  // would break SSR/hydration — this effect is the one legitimate case for
  // pulling in state from an external browser API on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from sessionStorage, not derivable during render
    setContact(readLandlordContact());
    setChecked(true);
  }, []);

  const firstName = contact?.name.trim().split(" ")[0];

  return (
    <main className="min-h-screen bg-cream px-8 py-16 font-sans text-near-black sm:px-14 sm:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="mb-2.5 text-xs tracking-widest text-maroon uppercase">Send your SOS — sent</p>
        <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-near-black sm:text-4xl">
          {firstName ? `Thanks, ${firstName} — we've got it.` : "Thanks — we've got it."}
        </h1>
        <p className="mx-auto max-w-[520px] text-[15px] leading-relaxed text-near-black/65">
          We&apos;ll be in touch within a day or two. While you wait, want a free estimate of what
          your property could be earning with us? It only takes about a minute.
        </p>
      </div>

      {checked && (
        <div className="mt-14">
          <RevenueCalculator initialName={contact?.name} initialEmail={contact?.email} />
        </div>
      )}
    </main>
  );
}
