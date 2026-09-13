import { describe, expect, it } from "vitest";
import { isWashout, rgbaToSprite } from "./convert";

describe("rgbaToSprite", () => {
  it("thresholds dark opaque pixels to black and honors the mask", () => {
    const rgba = Uint8Array.from([
      0, 0, 0, 255,
      255, 255, 255, 255,
      0, 0, 0, 0,
      200, 200, 0, 255,
    ]);
    const sprite = rgbaToSprite(rgba, 2, 2, 4, "threshold");
    expect(Array.from(sprite.data)).toEqual([1, 0, 0, 0]);
    expect(Array.from(sprite.mask)).toEqual([1, 1, 0, 1]);
    expect(sprite.blackPixels).toBe(1);
    expect(sprite.opaquePixels).toBe(3);
    expect(isWashout(sprite)).toBe(false);
  });

  it("flags a near-white threshold as washout", () => {
    const rgba = Uint8Array.from([
      240, 200, 0, 255,
      240, 200, 0, 255,
      240, 200, 0, 255,
      240, 200, 0, 255,
    ]);
    const sprite = rgbaToSprite(rgba, 2, 2, 4, "threshold");
    expect(sprite.blackPixels).toBe(0);
    expect(isWashout(sprite)).toBe(true);
  });
});
