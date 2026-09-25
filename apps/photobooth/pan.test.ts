import { describe, expect, it } from "vitest";
import { pictureOverflows, placedOrigin } from "./pan";

const view = { width: 288, height: 288 };

describe("placedOrigin", () => {
  it("centres a picture that fits", () => {
    expect(placedOrigin({ width: 100, height: 80 }, view, { x: 40, y: -20 })).toEqual({
      x: Math.floor((288 - 100) / 2),
      y: Math.floor((288 - 80) / 2),
    });
  });

  it("clamps a drag so a larger picture never leaves a gap", () => {
    const picture = { width: 512, height: 384 };
    expect(placedOrigin(picture, view, { x: 0, y: 0 })).toEqual({
      x: Math.floor((288 - 512) / 2),
      y: Math.floor((288 - 384) / 2),
    });
    expect(placedOrigin(picture, view, { x: 10_000, y: 10_000 })).toEqual({ x: 0, y: 0 });
    expect(placedOrigin(picture, view, { x: -10_000, y: -10_000 })).toEqual({
      x: 288 - 512,
      y: 288 - 384,
    });
  });

  it("notices overflow", () => {
    expect(pictureOverflows({ width: 512, height: 100 }, view)).toBe(true);
    expect(pictureOverflows({ width: 200, height: 200 }, view)).toBe(false);
  });
});
