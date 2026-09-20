import { describe, expect, it } from "vitest";
import { ditherGradient, isDitherGradientFill } from "../src/nodes";
import {
  fillGradientT,
  gradientDegrees,
  gradientT,
  rasterizeDitherGradient,
} from "../src/ditherGradient";

describe("gradientT", () => {
  it("runs se from the top-left to the bottom-right", () => {
    expect(gradientT(0, 0, 8, 8, "se")).toBe(0);
    expect(gradientT(7, 7, 8, 8, "se")).toBe(1);
    expect(gradientT(0, 7, 8, 8, "se")).toBeCloseTo(0.5);
  });

  it("runs n from the bottom to the top", () => {
    expect(gradientT(3, 7, 8, 8, "n")).toBe(0);
    expect(gradientT(3, 0, 8, 8, "n")).toBe(1);
  });

  it("treats CSS keywords and degrees as the same heading", () => {
    expect(gradientDegrees("to bottom right")).toBe(135);
    expect(gradientDegrees(135)).toBe(135);
    expect(gradientT(0, 0, 8, 8, "to bottom right")).toBeCloseTo(gradientT(0, 0, 8, 8, "se"));
    expect(gradientT(7, 7, 8, 8, 135)).toBeCloseTo(gradientT(7, 7, 8, 8, "se"));
    expect(gradientT(4, 0, 8, 8, 0)).toBeCloseTo(gradientT(4, 0, 8, 8, "to top"));
  });
});

describe("fillGradientT", () => {
  it("ramps a radial from the center to the farthest corner", () => {
    const fill = ditherGradient({ from: 0, to: 1, kind: "radial" });
    expect(fillGradientT(4, 4, 9, 9, fill)).toBeCloseTo(0);
    expect(fillGradientT(8, 8, 9, 9, fill)).toBeGreaterThan(fillGradientT(6, 4, 9, 9, fill));
  });

  it("sweeps a conic clockwise from up", () => {
    const fill = ditherGradient({ from: 0, to: 1, kind: "conic" });
    expect(fillGradientT(4, 0, 9, 9, fill)).toBeCloseTo(0);
    expect(fillGradientT(8, 4, 9, 9, fill)).toBeCloseTo(0.25);
    expect(fillGradientT(4, 8, 9, 9, fill)).toBeCloseTo(0.5);
  });

  it("repeats the 0…1 parameter", () => {
    const fill = ditherGradient({ from: 0, to: 1, direction: "e", repeat: 0.5 });
    expect(fillGradientT(0, 0, 9, 1, fill)).toBeCloseTo(0);
    expect(fillGradientT(4, 0, 9, 1, fill)).toBeCloseTo(0);
    expect(fillGradientT(2, 0, 9, 1, fill)).toBeCloseTo(0.5);
  });
});

describe("rasterizeDitherGradient", () => {
  it("puts more ink at the dark end of a southeast ramp", () => {
    const bits = rasterizeDitherGradient(24, 24, ditherGradient(0.2, 0.85, "se"));
    const ink = (x0: number, y0: number, x1: number, y1: number) => {
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) n += bits[y * 24 + x]!;
      }
      return n;
    };
    expect(ink(16, 16, 24, 24)).toBeGreaterThan(ink(0, 0, 8, 8));
  });

  it("is empty when the box has no area", () => {
    expect(rasterizeDitherGradient(0, 8, ditherGradient(0, 1, "e"))).toHaveLength(0);
  });

  it("returns the same buffer for the same size and fill", () => {
    const fill = ditherGradient(0.2, 0.85, "se");
    const a = rasterizeDitherGradient(24, 24, fill);
    const b = rasterizeDitherGradient(24, 24, ditherGradient(0.2, 0.85, "se"));
    expect(b).toBe(a);
  });
});

describe("ditherGradient", () => {
  it("tags a fill object", () => {
    const fill = ditherGradient(0.5, 0.9, "se");
    expect(isDitherGradientFill(fill)).toBe(true);
    expect(isDitherGradientFill("checker")).toBe(false);
    expect(isDitherGradientFill(1)).toBe(false);
  });
});
