"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { CountrySwitcher } from "@/components/CountrySwitcher";
import { Eyebrow } from "@/components/Eyebrow";

export type HomeHeroPrompt = {
  /** The line the search bar types out, e.g. "A base for Newgrange and the Boyne Valley". */
  text: string;
  /** Short label for the clickable suggestion under the bar. */
  chip: string;
  /** Location passed to the existing /search page. */
  location: string;
  stay?: {
    name: string;
    place?: string | null;
    /** Small photo for the "best match" card. */
    cardImageUrl?: string | null;
    /** Large photo that fills the hero while this prompt is showing. */
    heroImageUrl?: string | null;
  } | null;
};

// Opens the site's existing search page for a location, with dates and
// guests left for the visitor to pick there — the homepage bar is a prompt
// into that flow, not a second search.
function searchUrl(location: string) {
  return `/search?location=${encodeURIComponent(location)}&check_in=&check_out=&guests=1`;
}

const TYPE_MS = 45;
const ERASE_MS = 14;
const HOLD_MS = 3400;

// Homepage hero: a full-bleed photo, the headline, and a search bar that
// types its own suggestions one after another. Each suggestion is mapped to
// a search location and (optionally) a stay; while it's on screen the hero
// photo crossfades to that stay and a "best match" card shows it.
//
// The header here is deliberately just the logo and one button — the rest
// of the navigation lives in the bottom menu (see HomeDock).
export function HomeHero({
  id,
  eyebrow,
  headingLines,
  supporting,
  subBody,
  imageUrl,
  imageAlt,
  prompts,
  ctaHref,
  ctaLabel,
}: {
  id: string;
  eyebrow?: string | null;
  headingLines: string[];
  supporting: string;
  subBody?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  prompts: HomeHeroPrompt[];
  ctaHref: string;
  ctaLabel: string;
}) {
  // `shown` is the prompt whose stay/photo is on screen; `typed` is the text
  // currently in the bar. They only line up once a prompt finishes typing.
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState(prompts[0]?.text ?? "");

  useEffect(() => {
    if (prompts.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const wait = (ms: number) => new Promise<void>((resolve) => (timer = setTimeout(resolve, ms)));

    (async () => {
      let i = 0;
      await wait(HOLD_MS);
      while (!cancelled) {
        const current = prompts[i].text;
        for (let n = current.length - 1; n >= 0 && !cancelled; n--) {
          setTyped(current.slice(0, n));
          await wait(ERASE_MS);
        }
        i = (i + 1) % prompts.length;
        const next = prompts[i].text;
        for (let n = 1; n <= next.length && !cancelled; n++) {
          setTyped(next.slice(0, n));
          await wait(TYPE_MS + Math.random() * 35);
        }
        if (cancelled) break;
        setShown(i);
        await wait(HOLD_MS);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [prompts]);

  const active = prompts[shown];
  const activeHref = active ? searchUrl(active.location) : "/search";

  return (
    <section id={id} className="relative flex min-h-[94vh] w-full flex-col overflow-hidden bg-deep-forest text-cream">
      {/* Photo layers: the hero's own image, plus one per prompt's stay. */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={imageAlt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      {prompts.map((prompt, i) =>
        prompt.stay?.heroImageUrl ? (
          <Image
            key={`${prompt.location}-${i}`}
            src={prompt.stay.heroImageUrl}
            alt=""
            fill
            sizes="100vw"
            aria-hidden
            className="object-cover transition-opacity duration-1000"
            style={{ opacity: i === shown && (i > 0 || !imageUrl) ? 1 : 0 }}
          />
        ) : null
      )}
      <div className="absolute inset-0 bg-deep-forest/65" />

      {/* Header: logo and one button only. */}
      <div className="relative z-20 flex items-center justify-between gap-3 px-8 pt-6 sm:px-14">
        <Link href="/" aria-label="Sos Stays home" className="flex items-center">
          <Logo className="h-10 w-auto text-cream sm:h-12" />
        </Link>
        <div className="flex items-center gap-4">
          <CountrySwitcher colorClass="text-cream" />
          <Button
            link={ctaHref}
            variant="primary"
            bgColor="cream"
            color="forest-green"
            size="custom"
            className="px-5 py-2.5 text-sm font-medium sm:px-6 sm:py-3"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-8 pt-14 pb-24 text-center sm:px-14">
        {eyebrow && (
          <Eyebrow as="h1" className="mb-5" tone="sage">
            {eyebrow}
          </Eyebrow>
        )}
        <h2 className="font-serif text-5xl leading-[0.98] font-semibold tracking-tight text-cream italic sm:text-7xl lg:text-8xl">
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h2>
        <p className="mx-auto mt-7 max-w-[52ch] text-base text-cream/90 sm:text-lg">{supporting}</p>
        {subBody && <p className="mx-auto mt-2 max-w-[52ch] text-sm text-light-sage/85">{subBody}</p>}

        {/* The search bar that types for you. The whole bar is one link into
            the existing search page for the prompt on screen. */}
        <Link
          href={activeHref}
          aria-label={active ? `Search stays in ${active.location}` : "Search stays"}
          className="group mt-10 flex w-full max-w-[760px] items-center gap-3 rounded-[22px] border border-cream/35 bg-cream/15 py-2.5 pr-2.5 pl-5 text-left backdrop-blur-xl transition-colors hover:bg-cream/20"
        >
          <Search strokeWidth={2} className="h-5 w-5 shrink-0 text-cream" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[15px] text-cream sm:text-lg" aria-hidden>
            {active ? typed : "Search stays"}
            <span className="ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-[3px] animate-pulse bg-light-sage" />
          </span>
          <span className="flex shrink-0 items-center gap-2 rounded-full bg-cream px-4 py-3 text-sm font-medium text-deep-forest sm:px-6">
            <span className="hidden sm:inline">Find stays</span>
            <ArrowRight strokeWidth={2} className="h-4 w-4" aria-hidden />
          </span>
        </Link>

        {prompts.length > 0 && (
          <ul className="mt-4 flex max-w-[760px] flex-wrap justify-center gap-2">
            {prompts.map((prompt, i) => (
              <li key={`${prompt.chip}-${i}`}>
                <Link
                  href={searchUrl(prompt.location)}
                  className={`inline-block rounded-full border px-4 py-1.5 text-[13px] transition-colors hover:bg-cream/20 ${
                    i === shown ? "border-cream/80 bg-cream/15 text-cream" : "border-cream/40 text-cream/90"
                  }`}
                >
                  {prompt.chip}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {active?.stay && (
          <Link
            href={activeHref}
            key={shown}
            className="mt-8 flex w-full max-w-[520px] overflow-hidden rounded-[20px] bg-bright-cream text-left text-near-black shadow-[0_16px_40px_-12px_rgba(23,25,23,0.45)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            {active.stay.cardImageUrl && (
              <span className="relative block w-[34%] shrink-0">
                <Image src={active.stay.cardImageUrl} alt="" fill sizes="180px" className="object-cover" />
              </span>
            )}
            <span className="flex min-w-0 flex-col gap-1 px-5 py-4">
              <span className="text-[11px] font-semibold tracking-widest text-forest-green uppercase">
                Best match{active.stay.place ? ` · ${active.stay.place}` : ""}
              </span>
              <span className="font-serif text-xl leading-tight font-bold text-deep-forest">{active.stay.name}</span>
              <span className="mt-1 text-sm font-medium text-forest-green">Check dates in {active.location} →</span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
