import { describe, expect, it } from "vitest";
import { themeRadius, type UITheme } from "../src/theme";

function theme(radius: UITheme["radius"]): UITheme {
  return { radius };
}

describe("themeRadius", () => {
  it("is square on none at every step", () => {
    expect(themeRadius(theme("none"), "lg")).toBe(0);
    expect(themeRadius(theme("none"), "md")).toBe(0);
    expect(themeRadius(theme("none"), "sm")).toBe(0);
  });

  it("steps md and sm down 2px from the base, like shadcn", () => {
    expect(themeRadius(theme("lg"), "lg")).toBe(6);
    expect(themeRadius(theme("lg"), "md")).toBe(4);
    expect(themeRadius(theme("lg"), "sm")).toBe(2);
    expect(themeRadius(theme("md"), "lg")).toBe(4);
    expect(themeRadius(theme("md"), "md")).toBe(2);
    expect(themeRadius(theme("md"), "sm")).toBe(0);
    expect(themeRadius(theme("sm"), "lg")).toBe(2);
    expect(themeRadius(theme("sm"), "md")).toBe(0);
  });
});
