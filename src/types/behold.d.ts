// <behold-widget> is a web component from https://behold.so (loaded via
// next/script in src/app/page.tsx) — not a native DOM element, so it needs
// a JSX type declaration. React 19 moved the JSX namespace under
// React.JSX, so this augments "react" rather than the old global JSX.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "behold-widget": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { "feed-id": string },
        HTMLElement
      >;
    }
  }
}

export {};
