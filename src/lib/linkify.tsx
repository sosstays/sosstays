import type { ReactNode } from "react";

// Email addresses, full URLs, www. addresses and bare domains on common
// TLDs (e.g. "rydercup.com", "funtasia.ie"). Emails come first so the
// domain part of an address isn't matched on its own.
const LINK_PATTERN =
  /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(https?:\/\/[^\s<]+)|(\b(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|ie|org|net|eu|uk|io|gov)\b(?:\/[^\s<]*)?)/gi;

// Sentence punctuation that ends up glued to the end of a match.
const TRAILING = /[.,;:!?)\]'"]+$/;

const linkClass = "text-forest-green underline underline-offset-2";

// Turns the email addresses and web addresses in plain CMS text into
// links, leaving everything else as text.
export function linkify(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    let raw = match[0];
    const trail = raw.match(TRAILING)?.[0] ?? "";
    raw = raw.slice(0, raw.length - trail.length);
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));

    if (match[1]) {
      out.push(
        <a key={start} href={`mailto:${raw}`} className={linkClass}>
          {raw}
        </a>
      );
    } else {
      const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const internal = /^https?:\/\/(www\.)?sosstays\.com/i.test(href);
      out.push(
        <a
          key={start}
          href={href}
          className={linkClass}
          {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        >
          {raw}
        </a>
      );
    }
    if (trail) out.push(trail);
    last = start + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
