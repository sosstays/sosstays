"use client";

import { useId, useState } from "react";

// Reviews longer than this get clamped to three lines with a toggle. A
// character count (rather than measuring the rendered height) keeps the
// markup identical on server and client, so nothing shifts on load.
const CLAMP_AT = 170;

export function GoogleReviewText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const long = text.length > CLAMP_AT;

  return (
    <div>
      <p
        id={id}
        className={`text-base leading-relaxed whitespace-pre-line text-cream/90 ${
          long && !expanded ? "line-clamp-3" : ""
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 rounded-[8px] text-[13px] font-semibold text-cream underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
