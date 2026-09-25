import { describe, expect, it } from "vitest";
import { createNoiseField } from "./noise";

function samples(f: (x: number, y: number) => number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 40; i++) {
    for (let j = 0; j < 40; j++) out.push(f(-2 + i * 0.1, -2 + j * 0.1));
  }
  return out;
}

describe("createNoiseField", () => {
  it("is deterministic for a seed and differs between seeds", () => {
    const a = createNoiseField(7);
    const b = createNoiseField(7);
    const c = createNoiseField(8);
    expect(samples((x, y) => a.noise(x, y, 0))).toEqual(samples((x, y) => b.noise(x, y, 0)));
    expect(samples((x, y) => a.noise(x, y, 0))).not.toEqual(samples((x, y) => c.noise(x, y, 0)));
  });

  it("stays in range and actually varies", () => {
    const field = createNoiseField(1);
    for (const f of [field.noise, field.fbm, field.ridged]) {
      const values = samples((x, y) => f(x, y, 0.5, 5));
      expect(Math.max(...values.map(Math.abs))).toBeLessThanOrEqual(1.01);
      expect(Math.max(...values) - Math.min(...values)).toBeGreaterThan(0.3);
    }
    const turb = samples((x, y) => field.turb(x, y, 0, 5));
    expect(Math.min(...turb)).toBeGreaterThanOrEqual(0);
  });

  it("is not pinned to zero on integer grid points", () => {
    const field = createNoiseField(1);
    const onLattice = [-2, -1, 0, 1, 2].flatMap((x) => [-2, -1, 0, 1, 2].map((y) => field.noise(x, y, 0)));
    expect(onLattice.filter((v) => Math.abs(v) > 1e-6).length).toBeGreaterThan(20);
  });

  it("is continuous", () => {
    const field = createNoiseField(3);
    expect(Math.abs(field.fbm(0.5, 0.5, 0, 5) - field.fbm(0.5001, 0.5, 0, 5))).toBeLessThan(0.01);
  });
});
