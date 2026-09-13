/**
 * Grep guard: keep the §3 simplifications from creeping back into the port.
 * Comments are stripped so documentary mentions (`no portRect`, `scanlines`
 * as English) do not fail the check.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), "../src");

const BLITTERS = new Set([
  "bitBltCore.ts",
  "rgnBlt.ts",
  "stretchBits.ts",
  "bitblt.ts",
  "drawLine.ts",
  "drawArc.ts",
]);

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function srcFiles(): { name: string; code: string }[] {
  return readdirSync(SRC_DIR)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => ({
      name,
      code: stripComments(readFileSync(join(SRC_DIR, name), "utf8")),
    }));
}

describe("fidelity grep", () => {
  it("forbids Math.max(1, as any, scanlines, and portRect in blitters", () => {
    const hits: string[] = [];
    for (const { name, code } of srcFiles()) {
      if (/Math\.max\(\s*1\s*[,)]/.test(code)) hits.push(`${name}: Math.max(1`);
      if (/\bas\s+any\b/.test(code)) hits.push(`${name}: as any`);
      if (/\bscanlines\b/.test(code)) hits.push(`${name}: scanlines`);
      if (BLITTERS.has(name) && /\bportRect\b/.test(code)) {
        hits.push(`${name}: portRect`);
      }
    }
    expect(hits).toEqual([]);
  });
});
