import { describe, expect, it } from "vitest";
import { encodePackedPng } from "./png";

describe("encodePackedPng", () => {
  it("emits a PNG signature and IHDR for a 1-bit frame", () => {
    const png = encodePackedPng({
      width: 8,
      height: 1,
      rowBytes: 1,
      bytes: [0xff],
    });
    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(String.fromCharCode(...png.slice(12, 16))).toBe("IHDR");
    expect(png.length).toBeGreaterThan(40);
  });
});
