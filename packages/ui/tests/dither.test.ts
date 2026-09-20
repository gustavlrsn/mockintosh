import { describe, expect, it } from "vitest";
import { coverFrame, createDitherer, toBits, type ImageFrame } from "../src/dither";

function frame(pixels: number[][]): ImageFrame {
  const height = pixels.length;
  const width = pixels[0].length;
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = pixels[y][x];
      const i = (y * width + x) * 4;
      rgba[i] = v;
      rgba[i + 1] = v;
      rgba[i + 2] = v;
      rgba[i + 3] = 255;
    }
  }
  return { width, height, rgba };
}

describe("toBits", () => {
  it("thresholds dark to black and light to white", () => {
    const bits = toBits(frame([[0, 255], [64, 200]]), "threshold");
    expect([...bits]).toEqual([1, 0, 1, 0]);
  });

  it("Atkinson produces a mixed field on mid-gray", () => {
    const bits = toBits(frame([[128, 128], [128, 128]]), "atkinson");
    expect(bits).toHaveLength(4);
    expect(new Set(bits).size).toBeGreaterThan(1);
  });

  it("createDitherer reuses the output buffer", () => {
    const src = frame([[0, 255], [0, 255]]);
    const dither = createDitherer(2, 2, "threshold");
    const out = new Uint8Array(4);
    dither(src, out);
    expect([...out]).toEqual([1, 0, 1, 0]);
  });

  it("ascii mode stamps a solid dark 8×8 tile black", () => {
    const src = frame(Array.from({ length: 8 }, () => Array(8).fill(0)));
    const bits = toBits(src, "ascii");
    expect([...bits]).toEqual(Array(64).fill(1));
    const out = new Uint8Array(64);
    createDitherer(8, 8, "ascii")(src, out);
    expect([...out]).toEqual(Array(64).fill(1));
  });
});

function greyAt(dest: ImageFrame, x: number, y: number): number {
  return dest.rgba[(y * dest.width + x) * 4];
}

function empty(width: number, height: number): ImageFrame {
  return { width, height, rgba: new Uint8ClampedArray(width * height * 4) };
}

describe("coverFrame", () => {
  it("center-crops a wide source and scales into the destination", () => {
    const src = frame([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]);
    const dest = empty(2, 2);
    coverFrame(src, dest);
    expect(greyAt(dest, 0, 0)).toBe(2);
    expect(greyAt(dest, 1, 0)).toBe(3);
    expect(greyAt(dest, 0, 1)).toBe(6);
    expect(greyAt(dest, 1, 1)).toBe(7);
  });

  it("center-crops a tall source", () => {
    const src = frame([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ]);
    const dest = empty(2, 2);
    coverFrame(src, dest);
    expect(greyAt(dest, 0, 0)).toBe(3);
    expect(greyAt(dest, 1, 0)).toBe(4);
    expect(greyAt(dest, 0, 1)).toBe(5);
    expect(greyAt(dest, 1, 1)).toBe(6);
  });

  it("mirrors horizontally", () => {
    const src = frame([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]);
    const dest = empty(2, 2);
    coverFrame(src, dest, { mirror: true });
    expect(greyAt(dest, 0, 0)).toBe(3);
    expect(greyAt(dest, 1, 0)).toBe(2);
    expect(greyAt(dest, 0, 1)).toBe(7);
    expect(greyAt(dest, 1, 1)).toBe(6);
  });

  it("keeps the cover-crop field of view, not a 1:1 center clip", () => {
    const src = empty(16, 9);
    for (let y = 0; y < 9; y++) src.rgba[(y * 16 + 3) * 4] = 200;
    const dest = empty(4, 4);
    coverFrame(src, dest);
    expect(greyAt(dest, 0, 0)).toBe(200);
    expect(greyAt(dest, 0, 3)).toBe(200);
    expect(greyAt(dest, 1, 0)).toBe(0);
  });
});
