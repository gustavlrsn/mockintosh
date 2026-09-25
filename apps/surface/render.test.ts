import { describe, expect, it } from "vitest";
import { DEFAULT_CAMERA, buildScene, sampleSurface } from "./mesh";
import { createFrame, ditherInk, drawLine, fillPolygon, renderScene } from "./render";

function ink(frame: { pixels: Uint8Array }): number {
  return frame.pixels.reduce((sum, v) => sum + v, 0);
}

describe("drawLine", () => {
  it("covers both endpoints and every column of a shallow line", () => {
    const frame = createFrame(8, 4);
    drawLine(frame, { x: 0, y: 0 }, { x: 7, y: 3 }, 1);
    expect(frame.pixels[0]).toBe(1);
    expect(frame.pixels[3 * 8 + 7]).toBe(1);
    expect(ink(frame)).toBe(8);
  });

  it("clips instead of wrapping", () => {
    const frame = createFrame(4, 4);
    drawLine(frame, { x: -10, y: 1 }, { x: 10, y: 1 }, 1);
    expect(ink(frame)).toBe(4);
  });
});

describe("fillPolygon", () => {
  it("fills the pixels whose centres are inside", () => {
    const frame = createFrame(6, 6);
    fillPolygon(frame, [{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 4 }, { x: 1, y: 4 }], () => 1);
    expect(ink(frame)).toBe(12);
  });

  it("gives a shared edge to exactly one of two neighbours", () => {
    const frame = createFrame(8, 4);
    let claims = 0;
    const count = () => {
      claims++;
      return 1 as const;
    };
    fillPolygon(frame, [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }], count);
    fillPolygon(frame, [{ x: 4, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 4 }, { x: 4, y: 4 }], count);
    expect(claims).toBe(32);
    expect(ink(frame)).toBe(32);
  });
});

describe("ditherInk", () => {
  it("spans solid ink to bare paper", () => {
    let dark = 0;
    let light = 0;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        dark += ditherInk(0, x, y, 0);
        light += ditherInk(1, x, y, 0);
      }
    }
    expect(dark).toBe(16);
    expect(light).toBe(0);
  });
});

describe("renderScene", () => {
  const grid = sampleSurface((x, y) => Math.exp(-(x * x + y * y)), { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }, 12, 0);
  const view = { width: 120, height: 90 };
  const scene = buildScene(grid, grid.range, DEFAULT_CAMERA, view);

  it("draws less ink with hidden lines removed", () => {
    const wire = createFrame(view.width, view.height);
    const hidden = createFrame(view.width, view.height);
    renderScene(scene, wire, { mode: "wireframe", inverted: false });
    renderScene(scene, hidden, { mode: "hidden", inverted: false });
    expect(ink(hidden)).toBeGreaterThan(0);
    expect(ink(hidden)).toBeLessThan(ink(wire));
  });

  it("inverts paper and ink", () => {
    const normal = createFrame(view.width, view.height);
    const inverted = createFrame(view.width, view.height);
    renderScene(scene, normal, { mode: "hidden", inverted: false });
    renderScene(scene, inverted, { mode: "hidden", inverted: true });
    expect(ink(normal) + ink(inverted)).toBe(view.width * view.height);
  });
});
