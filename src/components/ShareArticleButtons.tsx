"use client";

import { useState } from "react";

type ShareArticleButtonsProps = {
  url: string;
  title: string;
  className?: string;
};

const LABELS = {
  x: "Share on X",
  facebook: "Share on Facebook",
  whatsapp: "Share on WhatsApp",
  linkedin: "Share on LinkedIn",
  email: "Share by email",
};

const ICONS: Record<keyof typeof LABELS, React.ReactNode> = {
  x: (
    <path d="m13.75 10.6 6.4-7.4h-1.9l-5.56 6.4-4.44-6.4H2.9l6.7 9.66-6.7 7.74h1.9l5.87-6.77 4.69 6.77h5.35l-6.96-9.9Zm-2.08 2.4-.68-.97-5.4-7.75h2l4.36 6.24.68.97 5.68 8.13h-2l-4.64-6.62Z" />
  ),
  facebook: (
    <path d="M13.5 21v-7.9h2.65l.4-3.08h-3.05V8.14c0-.89.25-1.5 1.52-1.5h1.63V3.87c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.04v2.25H7.7v3.08h2.65V21h3.15Z" />
  ),
  whatsapp: (
    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4a7.94 7.94 0 0 0-6.9 11.87L4 20l4.24-1.11a7.9 7.9 0 0 0 3.78.96h.01a7.95 7.95 0 0 0 5.6-13.53ZM12.02 18.4a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.58 6.58 0 0 1 10.35-8.05 6.53 6.53 0 0 1 1.93 4.67 6.6 6.6 0 0 1-6.69 6.47Zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.14-.43.05-.2-.1-.83-.31-1.58-.98a5.9 5.9 0 0 1-1.1-1.36c-.11-.2 0-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34h-.38c-.13 0-.34.05-.52.25-.18.2-.68.66-.68 1.62 0 .96.7 1.88.8 2.01.1.13 1.37 2.1 3.33 2.94.46.2.83.32 1.11.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23Z" />
  ),
  linkedin: (
    <path d="M6.94 8.5H3.56V20.4h3.38V8.5ZM5.25 3.6a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.4 20.4h-3.37v-6.24c0-1.49-.03-3.4-2.07-3.4-2.08 0-2.4 1.62-2.4 3.29v6.35H9.2V8.5h3.24v1.63h.05c.45-.86 1.56-1.77 3.21-1.77 3.43 0 4.7 2.61 4.7 6v6.04Z" />
  ),
  email: (
    <path d="M3 5.5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Zm1.8 1.8 7.2 5.76 7.2-5.76H4.8ZM3.8 16.5h16.4V8.9l-8.2 6.56L3.8 8.9v7.6Z" />
  ),
};

// Real "share this article" links — distinct from SocialIcons, which links
// to the brand's own profiles. Each opens that platform's share intent with
// this exact post's URL and title; "Copy link" falls back to a manual
// select if the Clipboard API is unavailable (older Safari, non-HTTPS).
export function ShareArticleButtons({ url, title, className = "" }: ShareArticleButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links: { key: keyof typeof LABELS; href: string }[] = [
    { key: "x", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { key: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { key: "whatsapp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { key: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { key: "email", href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <ul className={`mt-3 flex flex-wrap items-center gap-3 ${className}`}>
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={LABELS[link.key]}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-forest-green transition-colors hover:bg-forest-green hover:text-cream"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              {ICONS[link.key]}
            </svg>
          </a>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy link"
          className="flex h-8 items-center justify-center rounded-full bg-cream px-3 text-xs font-semibold text-forest-green transition-colors hover:bg-forest-green hover:text-cream"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </li>
    </ul>
  );
}
