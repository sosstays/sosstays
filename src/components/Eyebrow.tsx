import type { ElementType, ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

const TONE_CLASSES = {
  neutral: "text-near-black/55",
  maroon: "text-muted-maroon",
  sage: "text-light-sage",
  forest: "text-forest-green",
} as const;

type Tone = keyof typeof TONE_CLASSES;

// The small uppercase label that sits above a heading — a dash plus tracked-out
// text. One shared look so it doesn't keep drifting per section.
//
// Pass `delay` when this eyebrow animates in on its own (as the first of a
// series of individually-staggered <Reveal>-wrapped siblings). Leave it out
// when a parent already handles the reveal/fade-in for the whole block —
// this then renders as a plain, unanimated tag.
export function Eyebrow({
  children,
  tone = "neutral",
  dash = true,
  as = "p",
  delay,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  dash?: boolean;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const Tag = as;
  const classes = `inline-flex items-center gap-2.5 text-xs font-semibold tracking-widest uppercase ${TONE_CLASSES[tone]} ${className}`;
  const content = (
    <>
      {dash && <span className="inline-block h-px w-5.5 bg-current" />}
      {children}
    </>
  );

  if (delay !== undefined) {
    return (
      <Reveal as={as} delay={delay} className={classes}>
        {content}
      </Reveal>
    );
  }

  return <Tag className={classes}>{content}</Tag>;
}
