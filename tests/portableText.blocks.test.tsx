// Run with: npx tsx --env-file=.env.local --test tests/portableText.blocks.test.tsx
//
// Verifies the new `table` and `embedBlock` Portable Text renderers render
// real markup with the expected safety properties (sandboxed iframe via
// srcDoc, never dangerouslySetInnerHTML'd into the page), using sample data
// shaped exactly like what the Sanity schema produces. No live content was
// touched to run this — a direct publish+revert test was blocked by the
// write-permission classifier, so this renders the actual component
// functions in isolation instead.
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { blogBodyComponents } from "../src/sanity/portableText";

function renderType(typeName: string, value: unknown) {
  const Component = (blogBodyComponents.types as Record<string, (props: { value: unknown }) => React.ReactElement | null>)[
    typeName
  ];
  const el = Component({ value });
  return el ? renderToStaticMarkup(el) : "";
}

test("table renderer: first row becomes <thead>, rest become <tbody> rows", () => {
  const html = renderType("table", {
    rows: [
      { _key: "r1", cells: ["Spot", "Minutes away"] },
      { _key: "r2", cells: ["Aggie's Coffee Hut", "15"] },
      { _key: "r3", cells: ["Wholey Cow Milk", "15"] },
    ],
  });
  assert.match(html, /<thead>/);
  assert.match(html, /<th[^>]*>Spot<\/th>/);
  assert.match(html, /<th[^>]*>Minutes away<\/th>/);
  assert.match(html, /<td[^>]*>Aggie&#x27;s Coffee Hut<\/td>/);
  assert.match(html, /<td[^>]*>15<\/td>/);
});

test("table renderer: empty rows array renders nothing", () => {
  assert.equal(renderType("table", { rows: [] }), "");
  assert.equal(renderType("table", {}), "");
});

test("embedBlock renderer: embed code goes into an iframe's srcDoc, never dangerouslySetInnerHTML on the page itself", () => {
  const code = '<script>alert("x")</script><iframe src="https://example.com"></iframe>';
  const html = renderType("embedBlock", { code, caption: "A test embed", aspectRatio: "16:9" });
  assert.match(html, /<iframe/);
  // The raw embed code must appear only inside the iframe's srcdoc attribute
  // (HTML-escaped by React), never as live markup in the surrounding page.
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /srcDoc=/);
  assert.match(html, /A test embed/);
});

test("embedBlock renderer: iframe is sandboxed", () => {
  const html = renderType("embedBlock", { code: "<p>hi</p>" });
  assert.match(html, /sandbox="[^"]*allow-scripts[^"]*"/);
});

test("embedBlock renderer: missing code renders nothing", () => {
  assert.equal(renderType("embedBlock", {}), "");
  assert.equal(renderType("embedBlock", { caption: "no code" }), "");
});

test("embedBlock renderer: unknown aspect ratio falls back to a fixed-height container instead of an empty one", () => {
  const html = renderType("embedBlock", { code: "<p>hi</p>", aspectRatio: "auto" });
  assert.match(html, /min-h-\[480px\]/);
});
