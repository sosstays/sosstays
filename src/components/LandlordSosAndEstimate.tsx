"use client";

import { useState } from "react";
import { LandlordLeadForm } from "@/components/LandlordLeadForm";
import { RevenueCalculator } from "@/components/RevenueCalculator";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import type { LandlordContact } from "@/lib/landlordHandoff";

const PROCESS_STEPS = [
  {
    number: "01",
    title: "A call",
    description:
      "Fifteen minutes. We ask about the property, you ask about us.",
  },
  {
    number: "02",
    title: "A walkthrough",
    description: "We come see the place in person and work out what it needs.",
  },
  {
    number: "03",
    title: "An agreement",
    description:
      "Plain terms, commission rate confirmed, nothing buried in small print.",
  },
  {
    number: "04",
    title: "Handover",
    description:
      "Listing goes live, calendar's ours to run, you go back to just owning the place.",
  },
];

// Both sections live in one client component so the estimate calculator can
// pick up the name/email straight from the lead form's state once it's
// submitted, instead of asking the visitor for them a second time. Process
// sits between them (see PROCESS_STEPS above) so it reads as "here's what
// happens next" right after sending the SOS and before running the estimate.
export function LandlordSosAndEstimate() {
  const [contact, setContact] = useState<LandlordContact | null>(null);
  const [showResults, setShowResults] = useState(false);

  return (
    <>
      {/* SEND YOUR SOS */}
      <section id="send-sos" className="bg-cream px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-[640px]">
          <div className="mb-12 text-center">
            <Eyebrow className="mb-2.5" delay={0}>Send your SOS</Eyebrow>
            <Reveal as="h2" delay={100} className="mb-4 font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              Tell us about your place
            </Reveal>
            <Reveal as="p" delay={180} className="mx-auto max-w-[480px] text-sm text-near-black/60">
              Three quick steps — we&apos;ll be in touch within a day or two.
              Right after, you can run a free revenue estimate for your
              property.
            </Reveal>
          </div>
          <Reveal delay={240}>
            <LandlordLeadForm onSubmitted={setContact} />
          </Reveal>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-maroon px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Eyebrow className="mb-2.5" tone="sage" delay={0}>Process</Eyebrow>
            <Reveal as="h2" delay={100} className="font-serif text-3xl font-bold tracking-tight text-cream sm:text-4xl">
              What happens after you send your SOS
            </Reveal>
          </div>
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 100}>
                <div
                  className="mb-3.5 text-3xl font-extrabold text-cream/40"
                >
                  {step.number}
                </div>
                <h3 className="mb-2 text-base font-semibold text-cream">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-cream/70">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GET YOUR ESTIMATE */}
      <section id="calculator" className="bg-cream px-8 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto max-w-6xl">
          {/* Kept mounted (just hidden) rather than conditionally removed, so
              hiding it on results doesn't shift the calculator to a new
              sibling position and force React to remount it mid-flow. */}
          <div className={showResults ? "hidden" : "mx-auto mb-12 max-w-[640px] text-center"}>
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
          <RevenueCalculator
            // Remounts once the lead form hands over a name/email, so the
            // calculator's contact gate re-evaluates with the new props
            // instead of keeping whatever it decided on first mount.
            key={contact ? `${contact.name}|${contact.email}` : "anon"}
            initialName={contact?.name}
            initialEmail={contact?.email}
            onResultsShown={() => setShowResults(true)}
          />
        </div>
      </section>
    </>
  );
}
