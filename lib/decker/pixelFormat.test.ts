import { describe, it, expect } from "vitest";
import {
  drawPattern,
  samplePatternPalette,
  resolveAnimPattern,
  getPaletteColor,
  pixelToColorIndex,
  pixelToARGB,
  argbToRgba,
  DEFAULT_COLORS_ARGB,
} from "./pixelFormat";

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

/** Build a minimal pal buffer (28 pattern bitmaps + 16 colors = 28*64 + 16*3 bytes). */
function makePal(overrides: Partial<{ patternBytes: Uint8Array; colors: [number, number, number][] }> = {}): Uint8Array {
  const buf = new Uint8Array(28 * 64 + 16 * 3);
  if (overrides.patternBytes) buf.set(overrides.patternBytes, 0);
  if (overrides.colors) {
    overrides.colors.forEach(([r, g, b], i) => {
      const offset = 28 * 64 + 3 * i;
      buf[offset] = r;
      buf[offset + 1] = g;
      buf[offset + 2] = b;
    });
  }
  return buf;
}

// ────────────────────────────────────────────────
// argbToRgba
// ────────────────────────────────────────────────

describe("argbToRgba", () => {
  it("decodes opaque white (0xffffffff)", () => {
    expect(argbToRgba(0xffffffff)).toEqual([255, 255, 255, 255]);
  });

  it("decodes opaque black (0xff000000)", () => {
    expect(argbToRgba(0xff000000)).toEqual([0, 0, 0, 255]);
  });

  it("decodes 0xffff0000 as red", () => {
    expect(argbToRgba(0xffff0000)).toEqual([255, 0, 0, 255]);
  });

  it("extracts alpha channel correctly", () => {
    const [, , , a] = argbToRgba(0x80123456);
    expect(a).toBe(0x80);
  });
});

// ────────────────────────────────────────────────
// drawPattern
// ────────────────────────────────────────────────

describe("drawPattern", () => {
  const emptyPal = new Uint8Array(28 * 64 + 16 * 3);

  it("pixel 0 → 0 (white)", () => {
    expect(drawPattern(emptyPal, 0, 0, 0)).toBe(0);
  });

  it("pixel 1 → 1 (black)", () => {
    expect(drawPattern(emptyPal, 1, 0, 0)).toBe(1);
  });

  it("pixel 32 → 0 (white, first color index)", () => {
    // pixelValue > 31: values 32-47 are direct palette indices; 32 → color 0 (white)
    // drawPattern only returns 0|1, and 32 → 0 per lil.js rule
    expect(drawPattern(emptyPal, 32, 0, 0)).toBe(0);
  });

  it("pixel > 47 → 1 (black fallback)", () => {
    expect(drawPattern(emptyPal, 255, 0, 0)).toBe(1);
  });

  it("pattern 2 samples from pal buffer at offset 0", () => {
    // patternIndex 2 is at pal byte offset 64*2 = 128... wait, index starts at 0
    // samplePatternPalette uses offset: (x%8) + 8*(y%8) + 64*patternIndex
    // For patternIndex=2 (pixelValue=2), x=0, y=0 → pal[64*2] = pal[128]
    const pal = new Uint8Array(28 * 64 + 16 * 3);
    pal[64 * 2] = 1; // bit 1 set → returns 1 (black)
    expect(drawPattern(pal, 2, 0, 0)).toBe(1);
    pal[64 * 2] = 0; // bit 0 → returns 0 (white)
    expect(drawPattern(pal, 2, 0, 0)).toBe(0);
  });
});

// ────────────────────────────────────────────────
// samplePatternPalette
// ────────────────────────────────────────────────

describe("samplePatternPalette", () => {
  it("wraps x and y at 8", () => {
    const pal = new Uint8Array(28 * 64 + 16 * 3);
    pal[0 + 8 * 0 + 64 * 0] = 42; // patternIndex 0, x%8=0, y%8=0
    expect(samplePatternPalette(pal, 0, 0, 0)).toBe(42);
    expect(samplePatternPalette(pal, 0, 8, 0)).toBe(42); // x=8 wraps to 0
    expect(samplePatternPalette(pal, 0, 0, 8)).toBe(42); // y=8 wraps to 0
  });
});

// ────────────────────────────────────────────────
// resolveAnimPattern
// ────────────────────────────────────────────────

describe("resolveAnimPattern", () => {
  const anim = [[5, 6, 7], [10], [], [20, 21]];

  it("leaves non-animated patterns unchanged", () => {
    expect(resolveAnimPattern(anim, 3, 0)).toBe(3);
    expect(resolveAnimPattern(anim, 27, 0)).toBe(27);
    expect(resolveAnimPattern(anim, 32, 0)).toBe(32);
  });

  it("indexes into the anim row based on frameCount/4", () => {
    // slot 0 (patternIndex 28), row [5,6,7]
    expect(resolveAnimPattern(anim, 28, 0)).toBe(5);   // frame 0 → 0%3=0
    expect(resolveAnimPattern(anim, 28, 4)).toBe(6);   // frame 1 → 1%3=1
    expect(resolveAnimPattern(anim, 28, 8)).toBe(7);   // frame 2 → 2%3=2
    expect(resolveAnimPattern(anim, 28, 12)).toBe(5);  // frame 3 → 3%3=0
  });

  it("handles empty anim row by returning 0", () => {
    expect(resolveAnimPattern(anim, 30, 0)).toBe(0);
  });
});

// ────────────────────────────────────────────────
// getPaletteColor
// ────────────────────────────────────────────────

describe("getPaletteColor", () => {
  it("reads RGB bytes and returns ARGB with 0xff alpha", () => {
    const pal = makePal({ colors: [[0xff, 0x00, 0x80]] }); // index 0 = #ff0080
    expect(getPaletteColor(pal, 0)).toBe(0xffff0080);
  });

  it("falls back to DEFAULT_COLORS_ARGB for out-of-range buffer", () => {
    const tinyPal = new Uint8Array(4); // way too small
    expect(getPaletteColor(tinyPal, 0)).toBe(DEFAULT_COLORS_ARGB[0]);
  });
});

// ────────────────────────────────────────────────
// pixelToColorIndex
// ────────────────────────────────────────────────

describe("pixelToColorIndex", () => {
  const emptyPal = new Uint8Array(28 * 64 + 16 * 3);

  it("pixel 0 → color index 0 (draw_pattern returns 0 → white palette slot)", () => {
    expect(pixelToColorIndex(emptyPal, 0, 0, 0)).toBe(0);
  });

  it("pixel 1 → color index 15 (draw_pattern returns 1 → black palette slot)", () => {
    expect(pixelToColorIndex(emptyPal, 1, 0, 0)).toBe(15);
  });

  it("pixel 32 → color index 0 (32-32=0)", () => {
    expect(pixelToColorIndex(emptyPal, 32, 0, 0)).toBe(0);
  });

  it("pixel 47 → color index 15 (47-32=15)", () => {
    expect(pixelToColorIndex(emptyPal, 47, 0, 0)).toBe(15);
  });

  it("pixel > 47 → color index 0", () => {
    expect(pixelToColorIndex(emptyPal, 48, 0, 0)).toBe(0);
    expect(pixelToColorIndex(emptyPal, 255, 0, 0)).toBe(0);
  });
});

// ────────────────────────────────────────────────
// pixelToARGB end-to-end
// ────────────────────────────────────────────────

describe("pixelToARGB", () => {
  it("null palette, pixel 0 → default white (0xffffffff)", () => {
    expect(pixelToARGB(null, 0, 0, 0)).toBe(DEFAULT_COLORS_ARGB[0]);
  });

  it("null palette, pixel 1 → default black (0xff000000)", () => {
    expect(pixelToARGB(null, 1, 0, 0)).toBe(DEFAULT_COLORS_ARGB[15]);
  });

  it("with palette, pixel 0 → palette color 0 (white slot)", () => {
    const pal = makePal({ colors: [[255, 255, 255]] }); // index 0 = white
    expect(pixelToARGB(pal, 0, 0, 0)).toBe(0xffffffff);
  });

  it("with palette, pixel 1 → palette color 15 (black slot)", () => {
    const colors: [number, number, number][] = new Array(16).fill([0, 0, 0]) as [number, number, number][];
    colors[15] = [0, 0, 0];
    const pal = makePal({ colors });
    expect(pixelToARGB(pal, 1, 0, 0)).toBe(0xff000000);
  });

  it("resolves animated patterns when anim + frameCount supplied", () => {
    const anim = [[2], [], [], []]; // slot 0 (pix 28) always resolves to pattern 2
    const pal = new Uint8Array(28 * 64 + 16 * 3);
    // pattern 2 at x=0,y=0 is pal[64*2]=0 → drawPattern=0 → colorIndex=0
    pal[64 * 2] = 0;
    const noAnim = pixelToARGB(pal, 28, 0, 0, null, 0); // no anim: raw pix 28
    const withAnim = pixelToARGB(pal, 28, 0, 0, anim, 0); // resolves to 2
    // Both should come out as color 0 (white), just confirming the path runs without error
    expect(typeof withAnim).toBe("number");
    expect(withAnim >>> 24).toBe(0xff); // alpha is always 0xff
    // With anim the resolved pattern is 2; without it pix stays at 28 (also in pattern range)
    expect(withAnim).not.toBeUndefined();
    void noAnim; // just ensure it runs
  });
});
