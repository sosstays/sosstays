"use client";

import { useState, type CSSProperties } from "react";

type AudienceTab = {
  label: string;
  heading: string;
  body: string;
  checklist: string[];
  markers: number[];
  lines: number[];
  ring: boolean;
  scale: string;
  mapTitle: string;
  mapNote: string;
};

// Marker positions on the 460x420 map SVG — index 0 is the central hub,
// 1-4 sit at the corners the connector lines fan out to.
const MARKER_POS: [number, number][] = [
  [230, 230],
  [150, 150],
  [328, 178],
  [302, 312],
  [128, 292],
];

const TABS: AudienceTab[] = [
  {
    label: "Homeowners",
    heading:
      "Let your place earn properly, without doing the work yourself",
    body: "Heading off, moving, or just done answering guest messages at 11pm — we take it over. Local pricing that moves with real demand, a cleaner who knows the property, and a real guest-facing team who make people want to book direct and come back. You still see everything and decide anything that matters.",
    checklist: [
      "Full-service Airbnb and short-term let management, start to finish",
      "A genuine guest-facing brand around your property, not just a listing",
      "Dynamic pricing that responds to local demand, not a fixed rate",
      "A real local team, not a call centre, whenever a guest needs something",
    ],
    markers: [0],
    lines: [],
    ring: false,
    scale: "1 property",
    mapTitle: "One home, one local team",
    mapNote:
      "Your property, with people twenty minutes away rather than a call centre in another country.",
  },
  {
    label: "Landlords",
    heading: "Get more from a rental property that's sitting under its worth",
    body: "If a long-term tenancy isn't giving you the return it should, converting to a short or mid-term let usually performs better — you just need someone to run it properly. Where we go further than most management companies: we actively promote Ireland and the local area to every guest, so they book direct, stay longer and come back — not just fill dates through an OTA algorithm. We take on the guest side and the day-to-day, price the property to the local market as it moves, and keep you posted on what's coming in.",
    checklist: [
      "Typically stronger rental income than a standard long-term tenancy",
      "A guest-facing brand that actively promotes your property and area, not just a listing",
      "Guests screened and the property looked after by a local team",
      "Local, dynamic pricing that moves with demand instead of sitting still",
    ],
    markers: [0],
    lines: [],
    ring: true,
    scale: "1 property · local demand",
    mapTitle: "One property, priced to its own town",
    mapNote:
      "We read the demand around the property — events, seasons, midweek gaps — instead of holding one flat rate all year.",
  },
  {
    label: "Multi-property owners",
    heading: "More short-term rental properties shouldn't mean more headaches",
    body: "Running one Airbnb or holiday let well is one thing — running four or five across different towns without losing your evenings is another. We give you one local team across the whole portfolio, so cleaning, pricing and guest messages don't turn into a full-time job you never signed up for. With multiple properties, we can also cross-sell guests between them and into local experiences — turning one booking into a returning guest, or a longer stay, across your whole portfolio.",
    checklist: [
      "One local team across every property, no juggling logins or platforms",
      "Clear monthly statements per property, so you always know where you stand",
      "Pricing set property by property, not one blanket rate across the portfolio",
      "The same reliable local cleaning and maintenance team across every property",
    ],
    markers: [0, 1, 2, 3, 4],
    lines: [0, 1, 2, 3],
    ring: false,
    scale: "4+ properties · several towns",
    mapTitle: "A portfolio across towns, run as one",
    mapNote:
      "Guests move between your properties and into local experiences — one booking becomes a returning guest across the portfolio.",
  },
  {
    label: "Property investors",
    heading:
      "Turn the investment property into a properly performing short-term let",
    body: "You've done the numbers on the investment — the harder part is the day-to-day running of it as a short-term rental. We bring local market knowledge, a genuine guest-facing brand that promotes Ireland and the area around the property, and full management from the first listing to the last checkout, so the property performs the way the numbers said it would.",
    checklist: [
      "Local market knowledge of what actually rents, and for how much",
      "A destination brand around the property, not just a listing on an OTA",
      "Full-service management, listing through to maintenance",
      "Clear, honest monthly statements to inform what you do next",
    ],
    markers: [0, 2],
    lines: [1],
    ring: true,
    scale: "Investment · market view",
    mapTitle: "Bought on the numbers, run on the ground",
    mapNote:
      "We know what rents in the area and for how much — and we run the property so it performs to that.",
  },
];

// Connector lines fan out from the central marker (index 0) to each of the
// four outer markers — line i runs from the hub to marker i + 1.
const LINE_ENDPOINTS: [number, number][] = [
  MARKER_POS[1],
  MARKER_POS[2],
  MARKER_POS[3],
  MARKER_POS[4],
];

function HouseIcon({ style }: { style?: CSSProperties }) {
  return (
    <g
      fill="none"
      stroke="var(--maroon)"
      strokeWidth={1.4}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={style}
    >
      <path d="M-6.5 -0.5 L0 -6 L6.5 -0.5" />
      <path d="M-4.6 -0.5 V5.5 H4.6 V-0.5" />
      <path d="M-1.4 5.5 V2 H1.4 V5.5" />
    </g>
  );
}

function PersonIcon({ style }: { style?: CSSProperties }) {
  return (
    <g
      fill="none"
      stroke="var(--maroon)"
      strokeWidth={1.4}
      strokeLinecap="round"
      style={style}
    >
      <circle cx="0" cy="-2.6" r="2.9" />
      <path d="M-5 5.6c0-3.6 10-3.6 10 0" />
    </g>
  );
}

export function AudienceTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  const tabStyle = (i: number): CSSProperties => {
    const on = active === i;
    return {
      fontSize: 13.5,
      fontWeight: 500,
      border: 0,
      cursor: "pointer",
      borderRadius: 999,
      padding: "10px 18px",
      whiteSpace: "nowrap",
      transition: "background 220ms ease-out, color 220ms ease-out",
      background: on ? "var(--maroon)" : "transparent",
      color: on ? "var(--cream)" : "var(--forest-green)",
    };
  };

  const markerStyle = (i: number): CSSProperties => {
    const on = tab.markers.includes(i);
    const delay = on ? 90 + tab.markers.indexOf(i) * 110 : 0;
    return {
      transformBox: "fill-box",
      transformOrigin: "center",
      transition:
        "opacity 380ms ease-out, transform 520ms cubic-bezier(.22,.61,.36,1)",
      transitionDelay: `${delay}ms`,
      opacity: on ? 1 : 0,
      transform: on ? "scale(1)" : "scale(0.3)",
    };
  };

  // Markers 0 (hub) and 2 swap between a house and a person icon when the
  // active tab wants to represent "our team is here" rather than "a
  // property is here".
  const swapStyle = (asPerson: boolean, showPerson: boolean): CSSProperties => ({
    transition: "opacity 320ms ease-out",
    opacity: asPerson === showPerson ? 1 : 0,
  });

  const lineStyle = (i: number): CSSProperties => {
    const on = tab.lines.includes(i);
    const delay = on ? 60 + tab.lines.indexOf(i) * 110 : 0;
    return {
      transition:
        "stroke-dashoffset 620ms cubic-bezier(.22,.61,.36,1), opacity 300ms ease-out",
      transitionDelay: `${delay}ms`,
      strokeDashoffset: on ? 0 : 1,
      opacity: on ? 0.55 : 0,
    };
  };

  const ringStyle: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "center",
    transition:
      "opacity 420ms ease-out, transform 620ms cubic-bezier(.22,.61,.36,1)",
    opacity: tab.ring ? 0.5 : 0,
    transform: tab.ring ? "scale(1)" : "scale(0.55)",
  };

  const roamingPersonStyle: CSSProperties = {
    transition:
      "transform 680ms cubic-bezier(.22,.61,.36,1), opacity 360ms ease-out",
    ...(active === 0
      ? { opacity: 1, transform: "translate(254px,240px)" }
      : active === 1
        ? { opacity: 1, transform: "translate(287px,190px)" }
        : { opacity: 0, transform: "translate(254px,240px)" }),
  };

  const m0AsPerson = active === 2;
  const m2AsPerson = active === 3;

  return (
    <section
      id="who-we-work-with"
      className="mx-auto max-w-6xl px-8 py-24 sm:px-14 sm:py-28"
    >
      <div className="rounded-[18px] border border-sage-grey/40 bg-cream p-6 sm:p-11">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <span className="block h-px w-6.5 bg-maroon" />
            <span className="text-xs font-semibold tracking-widest text-maroon uppercase">
              Who we work with
            </span>
          </div>
          <div className="flex flex-wrap gap-2 rounded-full border border-sage-grey/40 p-1.5">
            {TABS.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setActive(i)}
                style={tabStyle(i)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-11 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-5.5 pt-1.5">
            <h2 className="min-h-[92px] text-balance font-serif text-4xl leading-[1.08] font-bold tracking-tight text-forest-green">
              {tab.heading}
            </h2>
            <p className="max-w-[56ch] text-base leading-relaxed text-near-black">
              {tab.body}
            </p>
            <ul className="mt-1.5 list-none">
              {tab.checklist.map((item, i) => (
                <li
                  key={item}
                  className={`flex items-start gap-3 py-2.75 ${i === 0 ? "" : "border-t border-sage-grey/40"}`}
                >
                  <span className="relative mt-0.75 h-4.5 w-4.5 flex-none">
                    <span className="absolute inset-0 block rounded-full border border-light-sage" />
                    <span className="absolute inset-[5px] block rounded-full bg-maroon" />
                  </span>
                  <span className="text-[15px] leading-relaxed text-near-black">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4.5 rounded-2xl border border-light-sage bg-light-forest-green p-6.5">
            <div className="flex items-baseline justify-between gap-3.5">
              <span className="text-[11.5px] font-semibold tracking-widest text-forest-green uppercase">
                Coverage
              </span>
              <span className="text-[11.5px] font-medium tracking-wide whitespace-nowrap text-near-black/65">
                {tab.scale}
              </span>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center">
              <svg
                viewBox="0 0 460 420"
                className="block w-full overflow-visible"
                style={{ height: "auto" }}
              >
                <path
                  d="M74 96c34-38 96-52 148-40 44 10 62 40 100 46 44 7 76-6 96 22 22 30 4 78-18 116-24 42-30 84-72 110-44 27-108 24-152 2-46-23-70-64-88-108-18-44-48-108-14-148z"
                  fill="var(--cream)"
                  stroke="var(--light-sage)"
                  strokeWidth={1.5}
                />
                <path
                  d="M96 214c46-16 92 10 138 0s72-44 122-34"
                  fill="none"
                  stroke="var(--sage-grey)"
                  strokeWidth={1}
                  strokeDasharray="4 7"
                />
                <path
                  d="M168 92c14 52-6 100 8 148s52 74 46 128"
                  fill="none"
                  stroke="var(--sage-grey)"
                  strokeWidth={1}
                  strokeDasharray="4 7"
                />
                <path
                  d="M300 84c-10 60 22 96 20 148s-30 78-16 118"
                  fill="none"
                  stroke="var(--sage-grey)"
                  strokeWidth={1}
                  strokeDasharray="4 7"
                />

                <circle
                  cx={230}
                  cy={230}
                  r={70}
                  fill="none"
                  stroke="var(--forest-green)"
                  strokeWidth={1}
                  strokeDasharray="3 8"
                  style={ringStyle}
                />

                {LINE_ENDPOINTS.map(([x, y], i) => (
                  <path
                    key={i}
                    d={`M230 230 L${x} ${y}`}
                    stroke="var(--forest-green)"
                    strokeWidth={1.2}
                    fill="none"
                    pathLength={1}
                    strokeDasharray={1}
                    style={lineStyle(i)}
                  />
                ))}

                {MARKER_POS.map(([cx, cy], i) => {
                  const canSwap = i === 0 || i === 2;
                  const asPerson = i === 0 ? m0AsPerson : i === 2 ? m2AsPerson : false;
                  return (
                    <g key={i} style={markerStyle(i)}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="var(--cream)"
                        stroke="var(--maroon)"
                        strokeWidth={1}
                        opacity={0.9}
                      />
                      <g transform={`translate(${cx},${cy})`}>
                        <HouseIcon
                          style={canSwap ? swapStyle(asPerson, false) : undefined}
                        />
                        {canSwap && (
                          <PersonIcon style={swapStyle(asPerson, true)} />
                        )}
                      </g>
                    </g>
                  );
                })}

                <circle
                  cx={230}
                  cy={230}
                  r={12}
                  fill="none"
                  stroke="var(--maroon)"
                  strokeWidth={1.5}
                  className="sos-audience-pulse"
                />

                <g style={roamingPersonStyle}>
                  <circle
                    r={11}
                    fill="var(--light-forest-green)"
                    stroke="var(--forest-green)"
                    strokeWidth={1}
                  />
                  <g
                    fill="none"
                    stroke="var(--forest-green)"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                  >
                    <circle cx="0" cy="-2.6" r="2.9" />
                    <path d="M-5 5.6c0-3.6 10-3.6 10 0" />
                  </g>
                </g>
              </svg>
            </div>

            <div className="flex flex-col gap-1 border-t border-light-sage pt-4">
              <span className="font-serif text-[19px] leading-tight text-maroon">
                {tab.mapTitle}
              </span>
              <span className="text-[13.5px] leading-relaxed text-near-black/65">
                {tab.mapNote}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
