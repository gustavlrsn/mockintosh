import { describe, expect, it } from "vitest";
import { wheelIsPinchZoom } from "../src/web/hostWheel";

describe("wheelIsPinchZoom", () => {
  it("treats ctrl+wheel as a trackpad pinch, not a scroll", () => {
    expect(wheelIsPinchZoom({ ctrlKey: true })).toBe(true);
    expect(wheelIsPinchZoom({ ctrlKey: false })).toBe(false);
  });
});
