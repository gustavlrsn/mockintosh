import { describe, expect, it } from "vitest";
import type { ImageFrame } from "@mockintosh/sdk";
import { centerInkFrame, detectGrid, frameBitmap, inkBounds, traceBitmap, trimBitmap } from "./grid";

function paint(
  width: number,
  height: number,
  put: (x: number, y: number) => number,
): ImageFrame {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = put(x, y);
      const i = (y * width + x) * 4;
      rgba[i] = v;
      rgba[i + 1] = v;
      rgba[i + 2] = v;
      rgba[i + 3] = 255;
    }
  }
  return { width, height, rgba };
}

function artAt(art: number[][], ax: number, ay: number): number | null {
  if (ay < 0 || ax < 0 || ay >= art.length || ax >= art[0].length) return null;
  return art[ay][ax];
}

/**
 * Blow each art pixel up, softening only the edges where two colors meet,
 * and draw a one-pixel watermark across the blocks.
 */
function fatPixels(art: number[][], block: number, pad: number): ImageFrame {
  const artH = art.length;
  const artW = art[0].length;
  const width = pad + artW * block;
  const height = pad + artH * block;
  return paint(width, height, (x, y) => {
    const ax = Math.floor((x - pad) / block);
    const ay = Math.floor((y - pad) / block);
    const ink = artAt(art, ax, ay);
    if (ink === null) return 255;
    const bx = (x - pad) % block;
    const by = (y - pad) % block;
    let v = ink ? 0 : 255;
    const fringe = (nx: number, ny: number, onEdge: boolean) => {
      if (!onEdge) return;
      const neighbor = artAt(art, nx, ny);
      if (neighbor !== null && neighbor !== ink) v = ink ? 50 : 205;
    };
    fringe(ax - 1, ay, bx === 0);
    fringe(ax + 1, ay, bx === block - 1);
    fringe(ax, ay - 1, by === 0);
    fringe(ax, ay + 1, by === block - 1);
    if (x === y || x === height - 1 - y) v = ink ? 80 : 188;
    return v;
  });
}

/** Same artwork, scaled by a non-integer factor and softened at the block edges. */
function scaledPixels(art: number[][], period: number, pad: number): ImageFrame {
  const artH = art.length;
  const artW = art[0].length;
  const width = pad + Math.ceil(artW * period);
  const height = pad + Math.ceil(artH * period);
  return paint(width, height, (x, y) => {
    const fx = (x - pad) / period;
    const fy = (y - pad) / period;
    const ax = Math.floor(fx);
    const ay = Math.floor(fy);
    if (ax < 0 || ay < 0 || ax >= artW || ay >= artH) return 255;
    const fx0 = fx - ax;
    const fy0 = fy - ay;
    const nearEdge = fx0 < 0.18 || fx0 > 0.82 || fy0 < 0.18 || fy0 > 0.82;
    const black = art[ay][ax] === 1;
    if ((x * 3 + y) % 17 === 0) return black ? 70 : 190;
    if (nearEdge) return black ? 60 : 200;
    return black ? 8 : 250;
  });
}

const ART = [
  [1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1],
  [1, 1, 0, 0, 1, 1],
  [0, 0, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 1],
];

function bits(art: number[][]): number[] {
  return art.flat();
}

describe("detectGrid", () => {
  it("finds an integer block grid behind padding, fringe, and a watermark", () => {
    const frame = fatPixels(ART, 5, 3);
    const grid = detectGrid(frame);
    expect(grid.block).toBeGreaterThan(4.4);
    expect(grid.block).toBeLessThan(5.6);
    expect(grid.originX).toBeGreaterThan(2.2);
    expect(grid.originX).toBeLessThan(3.8);
    expect(grid.originY).toBeGreaterThan(2.2);
    expect(grid.originY).toBeLessThan(3.8);
  });

  it("finds a non-integer scale", () => {
    const frame = scaledPixels(ART, 7.5, 4);
    const grid = detectGrid(frame);
    expect(grid.block).toBeGreaterThan(6.9);
    expect(grid.block).toBeLessThan(8.1);
  });
});

describe("traceBitmap", () => {
  it("rebuilds the art pixels from an integer screenshot", () => {
    const frame = fatPixels(ART, 5, 3);
    const traced = traceBitmap(frame, detectGrid(frame));
    expect(traced).not.toBeNull();
    expect(traced!.width).toBe(ART[0].length);
    expect(traced!.height).toBe(ART.length);
    expect([...traced!.pixels]).toEqual(bits(ART));
  });

  it("rebuilds the art pixels from a fractional screenshot", () => {
    const frame = scaledPixels(ART, 7.5, 4);
    const traced = traceBitmap(frame, detectGrid(frame));
    expect(traced).not.toBeNull();
    expect([...traced!.pixels]).toEqual(bits(ART));
  });

  it("refuses a bitmap larger than the cap", () => {
    const frame = paint(400, 8, () => 255);
    expect(traceBitmap(frame, { block: 1, originX: 0, originY: 0 })).toBeNull();
  });

  it("drops the white margin around the ink", () => {
    const trimmed = trimBitmap(
      {
        width: 4,
        height: 4,
        pixels: new Uint8Array([
          0, 0, 0, 0,
          0, 1, 1, 0,
          0, 1, 0, 0,
          0, 0, 0, 0,
        ]),
      },
      0,
    );
    expect(trimmed.width).toBe(2);
    expect(trimmed.height).toBe(2);
    expect([...trimmed.pixels]).toEqual([1, 1, 1, 0]);
  });
});

describe("frameBitmap", () => {
  const src = {
    width: 4,
    height: 4,
    pixels: new Uint8Array([
      0, 0, 0, 0,
      0, 1, 1, 0,
      0, 1, 0, 0,
      0, 0, 0, 0,
    ]),
  };

  it("finds the ink bounds", () => {
    expect(inkBounds(src)).toEqual({ x: 1, y: 1, width: 2, height: 2 });
  });

  it("pads white when the frame is larger than the ink", () => {
    const framed = frameBitmap(src, centerInkFrame(src, 4, 4));
    expect(framed.width).toBe(4);
    expect(framed.height).toBe(4);
    expect([...framed.pixels]).toEqual([
      0, 0, 0, 0,
      0, 1, 1, 0,
      0, 1, 0, 0,
      0, 0, 0, 0,
    ]);
  });

  it("crops when the frame is smaller than the source", () => {
    const framed = frameBitmap(src, { width: 2, height: 2, cropX: 1, cropY: 1 });
    expect([...framed.pixels]).toEqual([1, 1, 1, 0]);
  });

  it("pads when the crop sits past the edge", () => {
    const framed = frameBitmap(src, { width: 3, height: 2, cropX: -1, cropY: 1 });
    expect([...framed.pixels]).toEqual([0, 0, 1, 0, 0, 1]);
  });
});
