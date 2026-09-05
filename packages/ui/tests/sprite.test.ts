import { describe, it, expect } from "vitest";
import { defineSprite, fromGrid } from "../src/sprite";

describe("defineSprite", () => {
  it("decodes 2 bpp base64 into pixels and mask", () => {
    // 4 pixels: 00 transparent, 01 white, 10 black, 01 white → 0b00011001 = 0x19
    const b64 = btoa(String.fromCharCode(0x19));
    const s = defineSprite(4, 1, b64);
    expect([...s.data]).toEqual([0, 0, 1, 0]);
    expect([...s.mask!]).toEqual([0, 1, 1, 1]);
  });

  it("matches the platform base64 decoder on arbitrary bytes", () => {
    const bytes = Uint8Array.from({ length: 64 }, (_, i) => (i * 37 + 11) & 0xff);
    const b64 = btoa(String.fromCharCode(...bytes));
    const s = defineSprite(bytes.length * 4, 1, b64);
    const expected: number[] = [];
    for (const b of bytes)
      for (let sh = 6; sh >= 0; sh -= 2) expected.push(((b >> sh) & 3) === 2 ? 1 : 0);
    expect([...s.data]).toEqual(expected);
  });
});

describe("fromGrid", () => {
  it("maps # to black, . to transparent, anything else to opaque white", () => {
    const s = fromGrid(3, 1, ["#. "]);
    expect([...s.data]).toEqual([1, 0, 0]);
    expect([...s.mask!]).toEqual([1, 0, 1]);
  });
});
