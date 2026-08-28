"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

// The site's small, fixed palette — kept as a closed set (rather than
// accepting arbitrary strings) so every class below can be written out
// literally for Tailwind's static scanner instead of built with template
// interpolation, which it can't see into.
export type ButtonColor = "forest-green" | "cream" | "maroon" | "light-sage" | "transparent";

const BG_CLASS: Record<ButtonColor, string> = {
  "forest-green": "bg-forest-green",
  cream: "bg-cream",
  maroon: "bg-maroon",
  "light-sage": "bg-light-sage",
  transparent: "bg-transparent",
};

const TEXT_CLASS: Record<ButtonColor, string> = {
  "forest-green": "text-forest-green",
  cream: "text-cream",
  maroon: "text-maroon",
  "light-sage": "text-light-sage",
  transparent: "text-transparent",
};

const BORDER_CLASS: Record<ButtonColor, string> = {
  "forest-green": "border-forest-green",
  cream: "border-cream",
  maroon: "border-maroon",
  "light-sage": "border-light-sage",
  transparent: "border-transparent",
};

// group-hover text-color classes have to exist as literal strings somewhere
// for Tailwind to pick them up — can't be assembled from TEXT_CLASS at
// runtime with a "group-hover:" prefix.
const GROUP_HOVER_TEXT_CLASS: Record<ButtonColor, string> = {
  "forest-green": "group-hover:text-forest-green",
  cream: "group-hover:text-cream",
  maroon: "group-hover:text-maroon",
  "light-sage": "group-hover:text-light-sage",
  transparent: "group-hover:text-transparent",
};

const SIZE_CLASS = {
  sm: "px-6 py-3 text-sm font-semibold",
  md: "px-8 py-4 text-[15px] font-semibold",
  // Escape hatch for one-off pills (e.g. the compact nav CTA) that need
  // their own padding/type-size instead of one of the two sizes above —
  // supply it all via `className`.
  custom: "",
} as const;

type Variant = "primary" | "secondary";

// The two default looks. "primary" is a solid fill; "secondary" is an
// outline that fills in on hover. Both wash to light-sage and settle the
// label into forest-green by default — override bgColor/color/
// animateBgColor/animateColor per instance for maroon-context pages etc.
const VARIANT_DEFAULTS: Record<
  Variant,
  { bgColor: ButtonColor; color: ButtonColor; animateBgColor: ButtonColor; animateColor: ButtonColor }
> = {
  primary: {
    bgColor: "forest-green",
    color: "cream",
    animateBgColor: "light-sage",
    animateColor: "forest-green",
  },
  secondary: {
    bgColor: "transparent",
    color: "forest-green",
    animateBgColor: "light-sage",
    animateColor: "forest-green",
  },
};

type BaseProps = {
  children?: ReactNode;
  variant?: Variant;
  bgColor?: ButtonColor;
  color?: ButtonColor;
  /** Wash color revealed on hover. Defaults per variant — see VARIANT_DEFAULTS. */
  animateBgColor?: ButtonColor;
  /** Label color once the wash has filled. Defaults per variant. */
  animateColor?: ButtonColor;
  /** Set false for a static pill with no hover wash. */
  animate?: boolean;
  size?: "sm" | "md" | "custom";
  className?: string;
};

type LinkProps = BaseProps & {
  link: string;
  external?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

type ButtonElProps = BaseProps & {
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

// The site's one pill button/CTA/link. `variant` picks a default look
// (solid "primary" or outline "secondary"); bgColor/color/animateBgColor/
// animateColor override individual pieces of it for pages that don't use
// the defaults (e.g. the maroon landlord section).
export function Button(props: LinkProps | ButtonElProps) {
  const variant = props.variant ?? "primary";
  const defaults = VARIANT_DEFAULTS[variant];

  const bgColor = props.bgColor ?? defaults.bgColor;
  const color = props.color ?? defaults.color;
  const animateBgColor = props.animateBgColor ?? defaults.animateBgColor;
  const animateColor = props.animateColor ?? defaults.animateColor;
  const animate = props.animate ?? true;
  const size = props.size ?? "md";
  const isOutline = bgColor === "transparent";
  const content = props.children;

  const baseClass = [
    "rounded-full whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-green",
    SIZE_CLASS[size],
    BG_CLASS[bgColor],
    TEXT_CLASS[color],
    isOutline ? `border ${BORDER_CLASS[color]}` : "",
    props.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const shared = `${animate ? "group" : ""} relative isolate inline-flex items-center justify-center overflow-hidden ${baseClass}`;

  const inner = animate ? (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 origin-left scale-x-0 ${BG_CLASS[animateBgColor]} transition-transform duration-300 ease-out group-hover:scale-x-100`}
      />
      <span className={`relative transition-colors duration-300 ${GROUP_HOVER_TEXT_CLASS[animateColor]}`}>
        {content}
      </span>
    </>
  ) : (
    content
  );

  if ("link" in props) {
    return props.external ? (
      <a href={props.link} target="_blank" rel="noopener noreferrer" onClick={props.onClick} className={shared}>
        {inner}
      </a>
    ) : (
      <Link href={props.link} onClick={props.onClick} className={shared}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      className={shared}
    >
      {inner}
    </button>
  );
}
