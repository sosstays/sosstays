"use client";

import { useState } from "react";
import { LandlordLeadForm } from "@/components/LandlordLeadForm";
import { RevenueCalculator } from "@/components/RevenueCalculator";
import type { LandlordContact } from "@/lib/landlordHandoff";

// Both sections live in one client component so the estimate calculator can
// pick up the name/email straight from the lead form's state once it's
// submitted, instead of asking the visitor for them a second time.
export function LandlordSosAndEstimate() {
  const [contact, setContact] = useState<LandlordContact | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Kept mounted (just hidden) rather than conditionally removed, so hiding
  // it on results doesn't shift the calculator to a new sibling position
  // and force React to remount it mid-flow.
  const formIntro = (
    <div className={showResults ? "hidden" : "mx-auto max-w-[640px] text-center"}>
      <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight text-maroon sm:text-3xl">
        Get your estimate
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-near-black/70">
        Pop in your occupancy and current annual revenue and the calculator will give you a quick,
        honest estimate of what your property could be earning.
      </p>
      <p className="text-[15px] leading-relaxed text-near-black/70">
        This is a basic estimation tool to give you a starting point. Once we have your details,
        we&apos;ll come back with a proper custom proposal — projected figures based on your
        actual property, area and season, not just the averages.
      </p>
    </div>
  );

  return (
    <>
      {/* SEND YOUR SOS */}
      <section id="send-sos" className="px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-[640px]">
          <div className="mb-10 text-center">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
              Send your SOS
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              Tell us about your place
            </h2>
            <p className="mx-auto max-w-[480px] text-sm text-near-black/60">
              Three quick steps — we&apos;ll be in touch within a day or two.
              Right after, you can run a free revenue estimate for your
              property.
            </p>
          </div>
          <LandlordLeadForm onSubmitted={setContact} />
        </div>
      </section>

      {/* GET YOUR ESTIMATE */}
      <section id="calculator" className="bg-cream px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <RevenueCalculator
            // Remounts once the lead form hands over a name/email, so the
            // calculator's contact gate re-evaluates with the new props
            // instead of keeping whatever it decided on first mount.
            key={contact ? `${contact.name}|${contact.email}` : "anon"}
            initialName={contact?.name}
            initialEmail={contact?.email}
            onResultsShown={() => setShowResults(true)}
            formIntro={formIntro}
          />
        </div>
      </section>
    </>
  );
}
