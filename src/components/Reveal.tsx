"use client";

import { useEffect, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

// Fades and rises a section into view the first time it crosses into the
// viewport. Respects prefers-reduced-motion by rendering visible immediately.
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  style,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}) {
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(reduceMotion);

  useEffect(() => {
    if (!node || reduceMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(node);
    // Safety net: if IntersectionObserver never fires for some reason (an
    // unusual environment/extension edge case), content must not stay
    // permanently invisible — this is booking-driving copy, not decoration.
    const fallback = setTimeout(() => setVisible(true), 2000);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [node, reduceMotion]);

  return (
    <Tag
      {...rest}
      ref={setNode}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(26px)",
        transition: `opacity 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
