import { describe, expect, it } from "vitest";
import { ExprError, compileSurface } from "./expr";

function evalAt(src: string, x = 0, y = 0, t = 0): number {
  return compileSurface(src).fn(x, y, t);
}

describe("compileSurface", () => {
  it("follows the usual precedence", () => {
    expect(evalAt("1 + 2 * 3")).toBe(7);
    expect(evalAt("(1 + 2) * 3")).toBe(9);
    expect(evalAt("2 ^ 3 ^ 2")).toBe(512);
    expect(evalAt("-x^2", 3)).toBe(-9);
    expect(evalAt("10 - 4 - 3")).toBe(3);
    expect(evalAt("8 / 4 / 2")).toBe(1);
  });

  it("multiplies implicitly", () => {
    expect(evalAt("4x", 2)).toBe(8);
    expect(evalAt("2(x + y)", 1, 2)).toBe(6);
    expect(evalAt("x y", 3, 4)).toBe(12);
    expect(evalAt("2x^2", 3)).toBe(18);
  });

  it("reads variables, derived variables, constants and functions", () => {
    expect(evalAt("x + 10y + 100t", 1, 2, 3)).toBe(321);
    expect(evalAt("r", 3, 4)).toBe(5);
    expect(evalAt("cos(pi)")).toBeCloseTo(-1);
    expect(evalAt("exp(-(x^2 + y^2))", 0, 0)).toBe(1);
    expect(evalAt("max(x, y)", 2, 5)).toBe(5);
    expect(evalAt("mod(-1, 3)")).toBe(2);
  });

  it("accepts a z = prefix and typographic operators", () => {
    expect(evalAt("z = x + 1", 1)).toBe(2);
    expect(evalAt("f(x, y) = x·y", 2, 3)).toBe(6);
    expect(evalAt("x² + y**2", 2, 3)).toBe(13);
  });

  it("reports whether the surface depends on time", () => {
    expect(compileSurface("sin(x + t)").usesTime).toBe(true);
    expect(compileSurface("sin(x)").usesTime).toBe(false);
  });

  it("points at the offending character", () => {
    const at = (src: string): number => {
      try {
        compileSurface(src);
      } catch (err) {
        expect(err).toBeInstanceOf(ExprError);
        return (err as ExprError).at;
      }
      throw new Error("expected an error");
    };
    expect(at("x + $")).toBe(4);
    expect(at("z = foo(x)")).toBe(4);
    expect(at("sin x")).toBe(0);
    expect(at("(x + 1")).toBe(6);
    expect(() => compileSurface("z = ")).toThrow(ExprError);
    expect(() => compileSurface("atan2(x)")).toThrow(/2 arguments/);
    expect(() => compileSurface("fbm(x)")).toThrow(/2 to 4 arguments/);
    expect(() => compileSurface("noise(x, y, t, 3)")).toThrow(/2 to 3 arguments/);
  });

  it("turns unknown names into parameters, in order of first use", () => {
    const surface = compileSurface("a sin(k r) + b + a");
    expect(surface.params).toEqual(["a", "k", "b"]);
    expect(surface.fn(0, 0, 0)).toBe(2);
    const bound = surface.bind({ params: { a: 2, k: 1, b: 10 } });
    expect(bound(Math.PI / 2, 0, 0)).toBeCloseTo(2 * 1 + 10 + 2);
  });

  it("caps the number of parameters", () => {
    expect(compileSurface("a + b + c + d").params).toHaveLength(4);
    expect(() => compileSurface("a + b + c + d + g")).toThrow(/At most 4 parameters/);
  });

  it("keeps bound functions independent", () => {
    const surface = compileSurface("a x");
    const two = surface.bind({ params: { a: 2 } });
    const three = surface.bind({ params: { a: 3 } });
    expect(two(1, 0, 0)).toBe(2);
    expect(three(1, 0, 0)).toBe(3);
  });

  it("reads noise from the bound seed", () => {
    const surface = compileSurface("fbm(x, y)");
    expect(surface.usesNoise).toBe(true);
    expect(surface.params).toEqual([]);
    const a = surface.bind({ seed: 1 });
    const again = surface.bind({ seed: 1 });
    const b = surface.bind({ seed: 2 });
    expect(a(0.3, -1.2, 0)).toBe(again(0.3, -1.2, 0));
    expect(a(0.3, -1.2, 0)).not.toBe(b(0.3, -1.2, 0));
    expect(compileSurface("sin(x)").usesNoise).toBe(false);
  });
});
