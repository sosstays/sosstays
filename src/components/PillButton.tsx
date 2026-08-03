"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

// Which ink color the label settles into once the wash has filled the pill —
// pick whichever accent matches the section this button sits in.
const WASH_TEXT = {
  forest: "group-hover:text-forest-green",
  maroon: "group-hover:text-maroon",
} as const;

type BaseProps = {
  children: ReactNode;
  ink?: keyof typeof WASH_TEXT;
  /** Base fill/border/text/padding classes — e.g. "rounded-full bg-forest-green px-8 py-4 text-[15px] font-semibold text-cream". */
  className: string;
};

type LinkProps = BaseProps & {
  href: string;
  external?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

type ButtonProps = BaseProps & {
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

// Shared pill CTA. Base styling (fill/border/text/padding) is supplied by the
// caller via `className` — this layers on the hover interaction: a
// light-sage wash sweeps in from the left and the label settles into the
// page's ink color, replacing the old flat opacity fade.
export function PillButton(props: LinkProps | ButtonProps) {
  const { children, ink = "forest", className } = props;
  const shared = `group relative isolate inline-flex items-center justify-center overflow-hidden ${className}`;

  const content = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 origin-left scale-x-0 bg-light-sage transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
      <span className={`relative transition-colors duration-300 ${WASH_TEXT[ink]}`}>
        {children}
      </span>
    </>
  );

  if ("href" in props) {
    return props.external ? (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={props.onClick}
        className={shared}
      >
        {content}
      </a>
    ) : (
      <Link href={props.href} onClick={props.onClick} className={shared}>
        {content}
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
      {content}
    </button>
  );
}
