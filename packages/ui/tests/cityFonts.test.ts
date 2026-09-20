import { describe, it, expect } from "vitest";
import {
  defaultFontSize,
  getFont,
  initBuiltinFonts,
  listFontFamilies,
  listFontSizes,
  listFonts,
  requireFont,
} from "../src/fonts/registry";
import { getGlyphPixel, getGlyphWidth } from "../src/fonts/font";
import { measureText } from "../src/fonts/bridge";
import { faceMetrics } from "../src/fonts/metrics";

initBuiltinFonts();

function glyphHasInk(name: string, size: number, ch: string): boolean {
  const font = requireFont(name, size);
  const ord = ch.charCodeAt(0);
  const width = getGlyphWidth(font, ord);
  for (let y = 0; y < font.glyphHeight; y++) {
    for (let x = 0; x < width; x++) {
      if (getGlyphPixel(font, ord, x, y)) return true;
    }
  }
  return false;
}

describe("city font families", () => {
  it("lists original city names with their native sizes under the family", () => {
    expect(listFonts()).toEqual(expect.arrayContaining([
      "body",
      "menu",
      "mono",
      "chicago",
      "geneva",
      "newYork",
      "monaco",
      "venice",
      "london",
      "athens",
      "sanFrancisco",
      "toronto",
      "cairo",
      "losAngeles",
    ]));
    expect(listFontSizes("chicago")).toEqual([12]);
    expect(listFontSizes("geneva")).toEqual([9, 10, 12, 14, 18, 20, 24]);
    expect(listFontSizes("monaco")).toEqual([9, 12]);
    expect(listFontSizes("newYork")).toEqual([9, 10, 12, 14, 18, 20, 24]);
    expect(listFontSizes("venice")).toEqual([14]);
    expect(listFontSizes("london")).toEqual([18]);
    expect(listFontSizes("athens")).toEqual([18]);
    expect(listFontSizes("sanFrancisco")).toEqual([18]);
    expect(listFontSizes("toronto")).toEqual([9, 12, 14, 18, 24]);
    expect(listFontSizes("cairo")).toEqual([18]);
    expect(listFontSizes("losAngeles")).toEqual([12, 24]);
  });

  it("keeps body / menu / mono as aliases onto Geneva 9, Chicago 12, Monaco 9", () => {
    expect(defaultFontSize("body")).toBe(9);
    expect(defaultFontSize("menu")).toBe(12);
    expect(defaultFontSize("mono")).toBe(9);
    expect(requireFont("body")).toBe(requireFont("geneva", 9));
    expect(requireFont("menu")).toBe(requireFont("chicago", 12));
    expect(requireFont("mono")).toBe(requireFont("monaco", 9));
  });

  it("snaps a missing size to the nearest native strike", () => {
    expect(requireFont("geneva", 11)).toBe(requireFont("geneva", 12));
    expect(requireFont("geneva", 13)).toBe(requireFont("geneva", 14));
    expect(requireFont("geneva", 16)).toBe(requireFont("geneva", 18));
  });

  it("lets body size={12} select Geneva 12", () => {
    expect(requireFont("body", 12)).toBe(requireFont("geneva", 12));
  });

  it("does not advertise baked bold names as families", () => {
    expect(listFonts()).not.toContain("bodyBold");
    expect(listFonts()).not.toContain("geneva12Bold");
    expect(getFont("bodyBold")).toBeTruthy();
    expect(listFontFamilies().some((family) => family.name === "geneva")).toBe(true);
  });

  it("draws ink in each city family at its default size", () => {
    for (const name of ["chicago", "geneva", "newYork", "monaco", "venice", "london", "athens", "sanFrancisco", "toronto", "losAngeles"]) {
      expect(glyphHasInk(name, defaultFontSize(name), "A")).toBe(true);
    }
    expect(glyphHasInk("cairo", 18, "z")).toBe(true);
  });

  it("makes larger Geneva wider than Geneva 9", () => {
    expect(measureText("Washington", "geneva", {}, 12)).toBeGreaterThan(measureText("Washington", "geneva", {}, 9));
    expect(requireFont("geneva", 24).glyphHeight).toBeGreaterThan(requireFont("geneva", 9).glyphHeight);
  });

  it("uses the FONT header for New York 12", () => {
    const m = faceMetrics(requireFont("newYork", 12));
    expect(m.ascent).toBe(12);
    expect(m.descent).toBe(3);
    expect(m.leading).toBe(1);
  });
});
