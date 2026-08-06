"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { RevenueCalculator } from "@/components/RevenueCalculator";
import { readLandlordContact, type LandlordContact } from "@/lib/landlordHandoff";

function Icon({ paths }: { paths: string[] }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="var(--maroon)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

function SmallIcon({ paths }: { paths: string[] }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="var(--maroon)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

const PLAN_STEPS: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "Fill in the calculator",
    description: "Takes two minutes, gives you a first look at the numbers.",
    icon: <Icon paths={["M9 11l3 3L22 4M2 12a10 10 0 1 0 5-8.66"]} />,
  },
  {
    title: "We'll call you",
    description: "Usually within 1–2 working days, to talk through your property properly.",
    icon: (
      <Icon
        paths={[
          "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .34 1.99.62 2.94a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.14-1.14a2 2 0 0 1 2.11-.45c.95.28 1.94.49 2.94.62A2 2 0 0 1 22 16.92z",
        ]}
      />
    ),
  },
  {
    title: "We build your proposal",
    description: "Real projected figures, not a generic estimate.",
    icon: <Icon paths={["M3 3v18h18M7 15l4-4 3 3 5-6"]} />,
  },
  {
    title: "You decide",
    description: "No pressure, no contracts to sign on the spot.",
    icon: (
      <Icon
        paths={[
          "M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7z",
        ]}
      />
    ),
  },
];

const WHAT_YOU_GET: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "We handle everything",
    description: "Listings, pricing, guest messages, cleaning coordination, maintenance. You don't lift a finger.",
    icon: (
      <SmallIcon
        paths={[
          "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
        ]}
      />
    ),
  },
  {
    title: "Commission-only",
    description: "20–30% of your nightly rate, only when you get paid. No booking, no fee.",
    icon: <SmallIcon paths={["M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]} />,
  },
  {
    title: "You stay in control",
    description: "Block off dates for personal use whenever you like. No minimum commitment.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="var(--maroon)" strokeWidth="1.8" />
        <path d="M3 10h18M8 2v4M16 2v4" stroke="var(--maroon)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Dynamic pricing built in",
    description: "We adjust your rates to market demand so you're never leaving money on the table.",
    icon: (
      <SmallIcon
        paths={["M3 17l6-6 4 4 8-8", "M17 7h4v4"]}
      />
    ),
  },
  {
    title: "Real people, real oversight",
    description: "Guest messages and escalations go through Sos Stays, not an anonymous inbox.",
    icon: (
      <SmallIcon
        paths={[
          "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        ]}
      />
    ),
  },
  {
    title: "Work with your existing cleaner",
    description: "Or we find and manage one for you.",
    icon: (
      <SmallIcon
        paths={[
          "M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.24",
        ]}
      />
    ),
  },
];

export function LandlordsWhatsNext() {
  const [contact, setContact] = useState<LandlordContact | null>(null);
  const [checked, setChecked] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
      <section className="bg-maroon/8 px-8 py-16 sm:px-14 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
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

          <div
            className={showResults ? "" : "grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16"}
          >
            {/* Kept mounted (just hidden) rather than conditionally removed, so
                hiding it on results doesn't shift the calculator to a new
                sibling position and force React to remount it mid-flow. */}
            <div className={showResults ? "hidden" : "lg:pt-2"}>
              <h2 className="mb-5 font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
                Get your estimate
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

            <div>
              {checked && (
                <RevenueCalculator
                  initialName={contact?.name}
                  initialEmail={contact?.email}
                  onResultsShown={() => setShowResults(true)}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-20 sm:px-14 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
              What happens next
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              Here&apos;s the plan
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_STEPS.map((step, i) => (
              <div key={step.title}>
                <div className="mb-4.5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-maroon/12">
                  {step.icon}
                </div>
                <div className="mb-2.5 font-serif text-xl font-bold text-maroon/70">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-2 text-base font-semibold text-maroon">{step.title}</h3>
                <p className="text-sm leading-relaxed text-near-black/65">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-maroon/8 px-8 py-20 sm:px-14 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2.5 text-xs tracking-widest text-near-black/55 uppercase">
              Why owners work with us
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-maroon sm:text-4xl">
              What you actually get
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_YOU_GET.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-[18px] border border-sage-grey/40 bg-white p-6 shadow-sm"
              >
                {item.icon}
                <h3 className="text-base font-semibold text-maroon">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-near-black/65">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
