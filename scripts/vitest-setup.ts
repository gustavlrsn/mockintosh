/**
 * mdast's Vite `browser` build of `decode-named-character-reference` reads
 * `document` at import time. Tests run in Node; give it a stub so importing
 * `@mockintosh/sdk` (which re-exports `<Markdown>`) does not crash.
 */
const global = globalThis as typeof globalThis & { document?: { createElement(tag: string): { innerHTML: string; textContent: string } } };
if (typeof global.document === "undefined") {
  global.document = {
    createElement() {
      return { innerHTML: "", textContent: "" };
    },
  };
}
