import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dev import map", () => {
  it("routes @mockintosh/sdk through the shared runtime wrapper", () => {
    const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
    expect(html).toContain('"/src/runtime/sdk.ts"');
    expect(html).not.toMatch(/"@mockintosh\/sdk":\s*"\/packages\/sdk\//);
  });
});
