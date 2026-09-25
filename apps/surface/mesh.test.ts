import { describe, expect, it } from "vitest";
import {
  DEFAULT_CAMERA,
  PITCH_MAX,
  PITCH_MIN,
  buildScene,
  clampPitch,
  projectPoint,
  sampleSurface,
  widenRange,
  type OrbitCamera,
} from "./mesh";

const DOMAIN = { xMin: -1, xMax: 1, yMin: -1, yMax: 1 };
const VIEW = { width: 200, height: 200 };

describe("sampleSurface", () => {
  it("samples (cells + 1)² points across the domain", () => {
    const grid = sampleSurface((x, y) => x + 10 * y, DOMAIN, 2, 0);
    expect(grid.z.length).toBe(9);
    expect([...grid.z]).toEqual([-11, -10, -9, -1, 0, 1, 9, 10, 11]);
    expect(grid.range).toEqual({ min: -11, max: 11 });
  });

  it("keeps non-finite samples out of the range", () => {
    const grid = sampleSurface((x) => 1 / x, DOMAIN, 2, 0);
    expect(Number.isNaN(grid.z[1])).toBe(true);
    expect(grid.range).toEqual({ min: -1, max: 1 });
  });

  it("has no range when nothing is finite", () => {
    expect(sampleSurface(() => NaN, DOMAIN, 2, 0).range).toBeNull();
  });
});

describe("widenRange", () => {
  it("only grows", () => {
    expect(widenRange({ min: 0, max: 1 }, { min: 0.2, max: 2 })).toEqual({ min: 0, max: 2 });
  });

  it("gives a flat surface some height", () => {
    expect(widenRange(null, { min: 3, max: 3 })).toEqual({ min: 2.5, max: 3.5 });
  });
});

describe("projectPoint", () => {
  it("puts the origin at the viewport centre", () => {
    const p = projectPoint({ x: 0, y: 0, z: 0 }, DEFAULT_CAMERA, VIEW);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(100);
  });

  it("draws higher z higher on screen", () => {
    const low = projectPoint({ x: 0, y: 0, z: -0.5 }, DEFAULT_CAMERA, VIEW);
    const high = projectPoint({ x: 0, y: 0, z: 0.5 }, DEFAULT_CAMERA, VIEW);
    expect(high.y).toBeLessThan(low.y);
  });

  it("treats +y as away from an unrotated viewer", () => {
    const camera: OrbitCamera = { yaw: 0, pitch: 0.5, zoom: 1 };
    const near = projectPoint({ x: 0, y: -1, z: 0 }, camera, VIEW);
    const far = projectPoint({ x: 0, y: 1, z: 0 }, camera, VIEW);
    expect(far.depth).toBeGreaterThan(near.depth);
  });

  it("clamps the camera between side-on and top-down", () => {
    expect(clampPitch(-1)).toBe(PITCH_MIN);
    expect(clampPitch(3)).toBe(PITCH_MAX);
  });
});

describe("buildScene", () => {
  it("emits one quad per cell, farthest first", () => {
    const grid = sampleSurface((x, y) => Math.exp(-(x * x + y * y)), DOMAIN, 6, 0);
    const scene = buildScene(grid, grid.range, DEFAULT_CAMERA, VIEW);
    expect(scene.quads.length).toBe(36);
    for (let k = 1; k < scene.quads.length; k++) {
      expect(scene.quads[k - 1].depth).toBeGreaterThanOrEqual(scene.quads[k].depth);
    }
    for (const quad of scene.quads) {
      expect(quad.light).toBeGreaterThanOrEqual(0);
      expect(quad.light).toBeLessThanOrEqual(1);
    }
  });

  it("skips cells that touch a hole", () => {
    const grid = sampleSurface((x, y) => (x === 0 && y === 0 ? NaN : x), DOMAIN, 2, 0);
    expect(buildScene(grid, grid.range, DEFAULT_CAMERA, VIEW).quads.length).toBe(0);
  });

  it("still draws axes without a surface", () => {
    const grid = sampleSurface(() => NaN, DOMAIN, 2, 0);
    const scene = buildScene(grid, grid.range, DEFAULT_CAMERA, VIEW);
    expect(scene.quads.length).toBe(0);
    expect(scene.axes.length).toBeGreaterThan(4);
  });

  it("draws the ground axes on the front edges and the vertical axis on the left-most corner", () => {
    for (const yaw of [-2.5, -0.6, 0.4, 1.9]) {
      const camera: OrbitCamera = { ...DEFAULT_CAMERA, yaw };
      const grid = sampleSurface(() => NaN, DOMAIN, 2, 0);
      const { axes } = buildScene(grid, null, camera, VIEW);
      const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([x, y]) => projectPoint({ x: x!, y: y!, z: -0.6 }, camera, VIEW));
      const touches = (p: { x: number; y: number }) =>
        axes.some((s) => [s.a, s.b].some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1e-6));
      const back = corners.reduce((a, b) => (b.depth > a.depth ? b : a));
      const left = corners.reduce((a, b) => (b.x < a.x ? b : a));
      expect(touches(back), `yaw ${yaw}: back corner stays open`).toBe(false);
      const vertical = axes.find((s) => Math.abs(s.a.x - left.x) < 1e-6 && Math.abs(s.b.x - left.x) < 1e-6 && s.b.y < s.a.y - 10);
      expect(vertical, `yaw ${yaw}: vertical axis on the left corner`).toBeDefined();
    }
  });
});
