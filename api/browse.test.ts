import { describe, expect, it } from "vitest";
import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";
import { documentFromHtml } from "./browse";

const PAGE = `<!doctype html><html><head><title>Mac</title></head><body>
<nav>Jump to content</nav>
<article>
  <h1>Mac</h1>
  <p>Mac is a brand of personal computers designed by Apple.</p>
</article>
</body></html>`;
const URL = "https://example.com/mac";

describe("documentFromHtml", () => {
  it("gives Defuddle the article instead of the whole page chrome", async () => {
    const { document } = parseHTML(PAGE);
    const raw = await Defuddle(document, URL, { markdown: true, useAsync: false });
    const prepared = await Defuddle(documentFromHtml(PAGE, URL), URL, {
      markdown: true,
      useAsync: false,
    });

    expect(String(raw.content)).toContain("Jump to content");
    expect(String(prepared.content)).toContain("personal computers");
    expect(String(prepared.content)).not.toContain("Jump to content");
  });
});
