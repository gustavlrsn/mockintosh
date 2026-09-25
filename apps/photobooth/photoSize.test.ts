import { describe, expect, it } from "vitest";
import { photoSize, photoSizeLabel } from "./photoSize";

describe("photoSize", () => {
  it("keeps the fixed presets", () => {
    expect(photoSize("square", 576)).toEqual({ width: 288, height: 288 });
    expect(photoSize("wide", 384)).toEqual({ width: 512, height: 384 });
  });

  it("fits the printer width to a 4:3 camera, upright and lying down", () => {
    expect(photoSize("printer", 576)).toEqual({ width: 576, height: 432 });
    expect(photoSize("lying", 576)).toEqual({ width: 768, height: 576 });
    expect(photoSize("printer", 384)).toEqual({ width: 384, height: 288 });
    expect(photoSize("lying", 384)).toEqual({ width: 512, height: 384 });
  });

  it("names the printer presets", () => {
    expect(photoSizeLabel("printer", { width: 576, height: 432 })).toBe("576 × 432 (Printer Width)");
    expect(photoSizeLabel("lying", { width: 768, height: 576 })).toBe("768 × 576 (Printer Width, Lying Down)");
    expect(photoSizeLabel("square", { width: 288, height: 288 })).toBe("288 × 288");
  });
});
