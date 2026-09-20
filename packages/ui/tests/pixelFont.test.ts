import { describe, it, expect } from "vitest";
import { initBuiltinFonts, listFonts, requireFont } from "../src/fonts/registry";
import { getGlyphIndexForChar, getGlyphPixel, getGlyphWidth, hasGlyph } from "../src/fonts/font";
import { measureText } from "../src/fonts/bridge";
import { faceMetrics } from "../src/fonts/metrics";

initBuiltinFonts();

function glyphHasInk(name: string, ch: string): boolean {
  const font = requireFont(name);
  const ord = getGlyphIndexForChar(font, ch);
  const width = getGlyphWidth(font, ord);
  for (let y = 0; y < font.glyphHeight; y++) {
    for (let x = 0; x < width; x++) {
      if (getGlyphPixel(font, ord, x, y)) return true;
    }
  }
  return false;
}

describe("pixel face (Geist Pixel Square)", () => {
  it("is a built-in display face", () => {
    expect(listFonts()).toContain("pixel");
    const font = requireFont("pixel");
    expect(font.name).toBe("pixel");
    expect(font.spacing).toBe(0);
    expect(font.glyphHeight).toBeGreaterThan(requireFont("menu").glyphHeight);
  });

  it("has native 1:1 advances for ASCII", () => {
    const font = requireFont("pixel");
    expect(getGlyphWidth(font, " ".charCodeAt(0))).toBe(10);
    expect(getGlyphWidth(font, "I".charCodeAt(0))).toBe(6);
    expect(getGlyphWidth(font, "A".charCodeAt(0))).toBe(16);
    expect(getGlyphWidth(font, "W".charCodeAt(0))).toBe(24);
    expect(hasGlyph(font, "0".charCodeAt(0))).toBe(true);
  });

  it("draws ink for letters, digits, and punctuation", () => {
    for (const ch of "AaGgWw0$?.") {
      expect(glyphHasInk("pixel", ch)).toBe(true);
    }
    expect(glyphHasInk("pixel", " ")).toBe(false);
  });

  it("measures a word as the sum of advances", () => {
    expect(measureText("IA", "pixel")).toBe(6 + 16);
  });

  it("derives cap metrics from A–Z ink", () => {
    const m = faceMetrics(requireFont("pixel"));
    expect(m.capHeight).toBe(19);
    expect(m.cellHeight).toBe(m.capAscent + (m.cellHeight - m.capAscent));
    expect(m.lineHeight).toBeGreaterThanOrEqual(m.cellHeight);
  });
});
