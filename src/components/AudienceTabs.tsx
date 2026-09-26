"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eyebrow } from "@/components/Eyebrow";

export type AudienceTabContent = {
  label: string;
  heading: string;
  body: string;
  checklist: string[];
  /** Resolved (urlFor'd) at the page level, like every other image on
   *  the site — see the `image` prop below for how it's used. */
  image?: { src: string; alt: string } | null;
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

// Coverage-map animation per tab, keyed by position — which markers light
// up, which connector lines draw, whether the demand ring shows. This is
// visual staging tied to the SVG layout, not editorial content, so it
// isn't a Sanity field (see studio audienceTabs schema). Content itself
// (label/heading/body/checklist) is CMS-driven — see AudienceTabContent.
const TAB_ANIMATIONS: { markers: number[]; lines: number[]; ring: boolean }[] = [
  { markers: [0], lines: [], ring: false },
  { markers: [0], lines: [], ring: true },
  { markers: [0, 1, 2, 3, 4], lines: [0, 1, 2, 3], ring: false },
  { markers: [0, 2], lines: [1], ring: true },
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

// Every color this component uses, keyed by theme, so a new theme is one
// entry here rather than a scatter of inline ternaries. "maroon" is the
// landlord-page look this was built for; "forest" and "cream" match the
// About page's dark and light section backgrounds respectively.
const THEME = {
  maroon: {
    section: "bg-maroon",
    eyebrowTone: "sage",
    heading: "text-cream",
    body: "text-cream/85",
    tab: "border-cream/25 text-cream/75 data-[state=active]:border-cream data-[state=active]:bg-cream data-[state=active]:text-maroon",
    checklistDivider: "border-cream/20",
    checklistRing: "border-cream/40",
    checklistDot: "bg-cream",
    checklistText: "text-cream/90",
  },
  forest: {
    section: "bg-deep-forest",
    eyebrowTone: "sage",
    heading: "text-cream",
    body: "text-cream/85",
    tab: "border-cream/25 text-cream/75 data-[state=active]:border-cream data-[state=active]:bg-cream data-[state=active]:text-deep-forest",
    checklistDivider: "border-cream/20",
    checklistRing: "border-cream/40",
    checklistDot: "bg-cream",
    checklistText: "text-cream/90",
  },
  cream: {
    section: "bg-cream",
    eyebrowTone: "forest",
    heading: "text-forest-green",
    body: "text-near-black/75",
    tab: "border-forest-green/25 text-near-black/60 data-[state=active]:border-forest-green data-[state=active]:bg-forest-green data-[state=active]:text-cream",
    checklistDivider: "border-forest-green/15",
    checklistRing: "border-forest-green/35",
    checklistDot: "bg-forest-green",
    checklistText: "text-near-black/80",
  },
} as const;

export function AudienceTabs({
  eyebrow,
  tabs,
  useImages = false,
  theme = "maroon",
  showChecklist = true,
}: {
  eyebrow: string;
  tabs: AudienceTabContent[];
  /** Swaps the animated coverage-map illustration for each tab's own
   *  `image` (see AudienceTabContent) — used on pages (like /about) that
   *  want this component's copy and tab-switching behaviour without the
   *  landlord-page-specific map. The image changes as the active tab does. */
  useImages?: boolean;
  theme?: keyof typeof THEME;
  /** Set false to drop the checklist under the tab body copy. */
  showChecklist?: boolean;
}) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  const animation = TAB_ANIMATIONS[active];

  const markerStyle = (i: number): CSSProperties => {
    const on = animation.markers.includes(i);
    const delay = on ? 90 + animation.markers.indexOf(i) * 110 : 0;
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
    const on = animation.lines.includes(i);
    const delay = on ? 60 + animation.lines.indexOf(i) * 110 : 0;
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
    opacity: animation.ring ? 0.5 : 0,
    transform: animation.ring ? "scale(1)" : "scale(0.55)",
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

  const colors = THEME[theme];

  return (
    <section
      id="who-we-work-with"
      className={`${colors.section} px-8 py-24 sm:px-14 sm:py-28`}
    >
      <Tabs
        value={String(active)}
        onValueChange={(v) => setActive(Number(v))}
        className="mx-auto max-w-6xl"
      >
        <div className="mb-12 text-center">
          <Eyebrow className="mb-5" tone={colors.eyebrowTone}>{eyebrow}</Eyebrow>
          <TabsList className="mx-auto flex w-fit flex-wrap justify-center gap-2">
            {tabs.map((t, i) => (
              <TabsTrigger
                key={t.label}
                value={String(i)}
                className={`rounded-full border px-[18px] py-2.5 text-[13.5px] font-medium whitespace-nowrap transition-colors duration-200 ${colors.tab}`}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent
          value={String(active)}
          className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-11"
        >
          <div className="flex flex-col gap-5.5 pt-1.5">
            <h2 className={`min-h-[54px] text-balance font-serif text-2xl leading-[1.08] font-bold tracking-tight sm:min-h-[66px] sm:text-3xl lg:min-h-[92px] lg:text-4xl ${colors.heading}`}>
              {tab.heading}
            </h2>
            <p className={`max-w-[56ch] text-base leading-relaxed ${colors.body}`}>
              {tab.body}
            </p>
            {showChecklist && (
              <ul className="mt-1.5 list-none">
                {tab.checklist.map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-start gap-3 py-2.75 ${i === 0 ? "" : `border-t ${colors.checklistDivider}`}`}
                  >
                    <span className="relative mt-0.75 h-4.5 w-4.5 flex-none">
                      <span className={`absolute inset-0 block rounded-full border ${colors.checklistRing}`} />
                      <span className={`absolute inset-[5px] block rounded-full ${colors.checklistDot}`} />
                    </span>
                    <span className={`text-[15px] leading-relaxed ${colors.checklistText}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mx-auto flex w-full flex-col self-center rounded-2xl">
            {useImages && tab.image ? (
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-2xl">
                <Image key={tab.image.src} src={tab.image.src} alt={tab.image.alt} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  viewBox="0 0 460 420"
                  className="block w-full overflow-visible"
                  style={{ height: "auto" }}
                >
              <path
                d="M74 96c34-38 96-52 148-40 44 10 62 40 100 46 44 7 76-6 96 22 22 30 4 78-18 116-24 42-30 84-72 110-44 27-108 24-152 2-46-23-70-64-88-108-18-44-48-108-14-148z"
                fill="var(--cream)"
                stroke="var(--maroon)"
                strokeOpacity={0.25}
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
                stroke="var(--cream)"
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
                  fill="var(--cream)"
                  stroke="var(--maroon)"
                  strokeWidth={1}
                />
                <g
                  fill="none"
                  stroke="var(--maroon)"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                >
                  <circle cx="0" cy="-2.6" r="2.9" />
                  <path d="M-5 5.6c0-3.6 10-3.6 10 0" />
                </g>
              </g>
                </svg>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

