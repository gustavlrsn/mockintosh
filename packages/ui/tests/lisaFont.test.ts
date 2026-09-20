import { describe, it, expect } from "vitest";
import { initBuiltinFonts, listFonts, requireFont } from "../src/fonts/registry";
import { getGlyphPixel, getGlyphWidth, hasGlyph } from "../src/fonts/font";
import { measureText } from "../src/fonts/bridge";
import { faceMetrics } from "../src/fonts/metrics";

initBuiltinFonts();

function glyphHasInk(name: string, ch: string): boolean {
  const font = requireFont(name);
  const ord = ch.charCodeAt(0);
  const width = getGlyphWidth(font, ord);
  for (let y = 0; y < font.glyphHeight; y++) {
    for (let x = 0; x < width; x++) {
      if (getGlyphPixel(font, ord, x, y)) return true;
    }
  }
  return false;
}

describe("lisa face (LisaTerminal Paper Raw)", () => {
  it("is a built-in display face", () => {
    expect(listFonts()).toContain("lisa");
    const font = requireFont("lisa");
    expect(font.name).toBe("lisa");
    expect(font.spacing).toBe(0);
    expect(font.maxWidth).toBe(8);
    expect(font.glyphHeight).toBe(12);
  });

  it("is an 8-wide TILE cell for ASCII", () => {
    const font = requireFont("lisa");
    expect(getGlyphWidth(font, " ".charCodeAt(0))).toBe(8);
    expect(getGlyphWidth(font, "I".charCodeAt(0))).toBe(8);
    expect(getGlyphWidth(font, "A".charCodeAt(0))).toBe(8);
    expect(getGlyphWidth(font, "W".charCodeAt(0))).toBe(8);
    expect(hasGlyph(font, "0".charCodeAt(0))).toBe(true);
  });

  it("draws ink for letters, digits, and punctuation", () => {
    for (const ch of "AaGgWw0$?.") {
      expect(glyphHasInk("lisa", ch)).toBe(true);
    }
    expect(glyphHasInk("lisa", " ")).toBe(false);
  });

  it("measures a word as the sum of advances", () => {
    expect(measureText("IA", "lisa")).toBe(8 + 8);
  });

  it("uses the Lisa FONT header for line metrics", () => {
    const m = faceMetrics(requireFont("lisa"));
    expect(m.ascent).toBe(10);
    expect(m.descent).toBe(2);
    expect(m.cellHeight).toBe(12);
    expect(m.lineHeight).toBe(12);
    expect(m.capHeight).toBe(8);
  });
});
