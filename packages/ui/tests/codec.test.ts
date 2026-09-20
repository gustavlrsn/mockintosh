import { describe, it, expect } from "vitest";
import { decodeDeckerFont, encodeDeckerFont } from "../src/fonts/codec";
import { getGlyphPixel, type DeckerFont } from "../src/fonts/font";
import { requireFont, initBuiltinFonts } from "../src/fonts/registry";

initBuiltinFonts();

function tinyFont(): DeckerFont {
  const maxWidth = 8;
  const glyphHeight = 2;
  const glyphStride = glyphHeight;
  const glyphWidths = new Uint8Array(256);
  const glyphData = new Uint8Array(256 * glyphStride);
  glyphWidths[65] = 3;
  // Row 0: ##.     Row 1: #.#
  glyphData[65 * glyphStride] = 0b1100_0000;
  glyphData[65 * glyphStride + 1] = 0b1010_0000;
  return {
    name: "tiny",
    maxWidth,
    glyphHeight,
    spacing: 1,
    glyphStride,
    glyphWidths,
    glyphData,
    sourceFormat: "FNT1",
  };
}

describe("Decker font codec", () => {
  it("round-trips a sparse FNT1 font", () => {
    const encoded = encodeDeckerFont(tinyFont());
    expect(encoded.startsWith("%%FNT1")).toBe(true);
    const decoded = decodeDeckerFont(encoded, "tiny");
    expect(decoded.maxWidth).toBe(8);
    expect(decoded.glyphHeight).toBe(2);
    expect(decoded.spacing).toBe(1);
    expect(decoded.glyphWidths[65]).toBe(3);
    expect(getGlyphPixel(decoded, 65, 0, 0)).toBe(true);
    expect(getGlyphPixel(decoded, 65, 1, 0)).toBe(true);
    expect(getGlyphPixel(decoded, 65, 2, 0)).toBe(false);
    expect(getGlyphPixel(decoded, 65, 0, 1)).toBe(true);
    expect(getGlyphPixel(decoded, 65, 1, 1)).toBe(false);
    expect(getGlyphPixel(decoded, 65, 2, 1)).toBe(true);
  });

  it("round-trips the built-in body face pixels and widths", () => {
    const body = requireFont("body");
    const again = decodeDeckerFont(encodeDeckerFont(body), "body");
    expect(again.maxWidth).toBe(body.maxWidth);
    expect(again.glyphHeight).toBe(body.glyphHeight);
    expect(again.spacing).toBe(body.spacing);
    expect(Array.from(again.glyphWidths)).toEqual(Array.from(body.glyphWidths));
    expect(Array.from(again.glyphData)).toEqual(Array.from(body.glyphData));
  });
});
