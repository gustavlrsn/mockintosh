import { describe, it, expect } from "vitest";
import { newBitMap, setBit } from "@mockintosh/quickdraw/bits";
import {
  DEFAULT_HOST_PALETTE,
  formatRgb8,
  hostPalettesEqual,
  paintBitMapRgba,
  parseRgb8,
} from "../src/web/palette";

describe("parseRgb8 / formatRgb8", () => {
  it("reads #rgb and #rrggbb", () => {
    expect(parseRgb8("#0f8")).toEqual({ r: 0, g: 255, b: 136 });
    expect(parseRgb8("112233")).toEqual({ r: 0x11, g: 0x22, b: 0x33 });
    expect(parseRgb8("  #AaBbCc  ")).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc });
  });

  it("rejects junk", () => {
    expect(parseRgb8("")).toBeNull();
    expect(parseRgb8("#12")).toBeNull();
    expect(parseRgb8("#gg0000")).toBeNull();
  });

  it("round-trips clamped channels", () => {
    expect(formatRgb8({ r: 0, g: 16, b: 255 })).toBe("#0010ff");
  });
});

describe("paintBitMapRgba", () => {
  it("maps ink and paper through the palette", () => {
    const src = newBitMap(2, 1);
    setBit(src, 0, 0, 1);
    const rgba = new Uint8ClampedArray(8);
    paintBitMapRgba(
      src,
      rgba,
      2,
      1,
      { foreground: { r: 10, g: 20, b: 30 }, background: { r: 200, g: 210, b: 220 } },
    );
    expect(Array.from(rgba.subarray(0, 4))).toEqual([10, 20, 30, 255]);
    expect(Array.from(rgba.subarray(4, 8))).toEqual([200, 210, 220, 255]);
  });

  it("defaults to black ink on white paper", () => {
    const src = newBitMap(1, 1);
    setBit(src, 0, 0, 1);
    const rgba = new Uint8ClampedArray(4);
    paintBitMapRgba(src, rgba, 1, 1);
    expect(Array.from(rgba)).toEqual([0, 0, 0, 255]);
    expect(hostPalettesEqual(DEFAULT_HOST_PALETTE, DEFAULT_HOST_PALETTE)).toBe(true);
  });
});
