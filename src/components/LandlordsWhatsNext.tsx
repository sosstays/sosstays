"use client";

import { useEffect, useState } from "react";
import { RevenueCalculator } from "@/components/RevenueCalculator";
import { readLandlordContact, type LandlordContact } from "@/lib/landlordHandoff";

const PLAN_STEPS = [
  {
    lead: "Fill in the calculator above",
    rest: "takes two minutes, gives you a first look at the numbers.",
  },
  {
    lead: "We'll call you",
    rest: "usually within 1–2 working days, to talk through your property properly.",
  },
  {
    lead: "We build your custom proposal",
    rest: "real projected figures, not a generic estimate.",
  },
  {
    lead: "You decide",
    rest: "no pressure, no contracts to sign on the spot.",
  },
];

const WHAT_YOU_GET = [
  {
    lead: "We handle everything",
    rest: "listings, pricing, guest messages, cleaning coordination, maintenance. You don't lift a finger.",
  },
  {
    lead: "Commission-only",
    rest: "20–30% of your nightly rate, only when you get paid. No booking, no fee.",
  },
  {
    lead: "You stay in control",
    rest: "block off dates for personal use whenever you like. No minimum commitment.",
  },
  {
    lead: "Dynamic pricing built in",
    rest: "we adjust your rates to market demand so you're never leaving money on the table.",
  },
  {
    lead: "Real people, real oversight",
    rest: "guest messages and escalations go through Sos Stays, not an anonymous inbox.",
  },
  {
    lead: "We work with your existing cleaner",
    rest: "or find and manage one for you.",
  },
];

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

  return (
    <main className="min-h-screen bg-cream font-sans text-near-black">
      <div className="px-8 pt-16 pb-14 text-center sm:px-14 sm:pt-24">
        <p className="mb-2.5 text-xs tracking-widest text-maroon uppercase">
          Thanks for sending your SOS
        </p>
        <h1 className="mx-auto mb-4 max-w-[640px] font-serif text-3xl font-bold tracking-tight text-near-black sm:text-4xl">
          Right, we&apos;ve got your details. Let&apos;s start building your numbers.
        </h1>
        <p className="mx-auto max-w-[520px] text-[15px] leading-relaxed text-near-black/65">
          One of the team will be in touch shortly — but you can get started straightaway.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-8 pb-24 sm:px-14 lg:grid-cols-2 lg:gap-16">
        <div className="lg:pt-4">
          <h2 className="mb-4 font-serif text-2xl font-bold tracking-tight text-maroon sm:text-3xl">
            Start here: get your estimate
          </h2>
          <p className="mb-4 text-[15px] leading-relaxed text-near-black/70">
            Pop in your occupancy and current annual revenue and the calculator will give you a
            quick, honest estimate of what your property could be earning.
          </p>
          <p className="text-[15px] leading-relaxed text-near-black/70">
            This is a basic estimation tool to give you a starting point. Once we have your
            details, we&apos;ll come back with a proper custom proposal — projected figures based
            on your actual property, area and season, not just the averages.
          </p>
        </div>

        <div>{checked && <RevenueCalculator initialName={contact?.name} initialEmail={contact?.email} />}</div>
      </div>

      <section className="bg-light-sage/15 px-8 py-20 sm:px-14 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
            Here&apos;s the plan
          </h2>
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_STEPS.map((step, i) => (
              <div key={step.lead}>
                <div className="mb-3.5 font-serif text-3xl font-extrabold text-maroon">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-sm leading-relaxed text-near-black/70">
                  <strong className="font-semibold text-near-black">{step.lead}</strong> —{" "}
                  {step.rest}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-8 py-20 sm:px-14 sm:py-24">
        <h2 className="mb-12 text-center font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
          What you actually get
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {WHAT_YOU_GET.map((item) => (
            <div
              key={item.lead}
              className="flex items-start gap-3 rounded-[10px] border border-sage-grey/40 bg-white p-5"
            >
              <span className="mt-0.5 text-forest-green">✓</span>
              <p className="text-sm leading-relaxed text-near-black/75">
                <strong className="font-semibold text-near-black">{item.lead}</strong> —{" "}
                {item.rest}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
