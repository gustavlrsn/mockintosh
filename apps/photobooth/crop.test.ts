import { describe, expect, it } from "vitest";
import type { ImageFrame } from "@mockintosh/sdk";
import { IDENTITY_CROP, sampleCover, sampledFrame } from "./crop";

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

function greyAt(dest: ImageFrame, x: number, y: number): number {
  return dest.rgba[(y * dest.width + x) * 4];
}

function empty(width: number, height: number): ImageFrame {
  return { width, height, rgba: new Uint8ClampedArray(width * height * 4) };
}

describe("sampleCover", () => {
  it("copies 1:1 when source and dest match and the crop is identity", () => {
    const src = frame([
      [10, 20],
      [30, 40],
    ]);
    const dest = empty(2, 2);
    sampleCover(src, dest, IDENTITY_CROP);
    expect(greyAt(dest, 0, 0)).toBe(10);
    expect(greyAt(dest, 1, 0)).toBe(20);
    expect(greyAt(dest, 0, 1)).toBe(30);
    expect(greyAt(dest, 1, 1)).toBe(40);
  });

  it("zooms into the center", () => {
    const src = frame([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
    ]);
    const dest = sampledFrame(src, 2, { scale: 2, panX: 0, panY: 0 });
    expect(greyAt(dest, 0, 0)).toBe(6);
    expect(greyAt(dest, 1, 0)).toBe(7);
    expect(greyAt(dest, 0, 1)).toBe(10);
    expect(greyAt(dest, 1, 1)).toBe(11);
  });

  it("positive panX moves the picture right (samples further left)", () => {
    const src = frame([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]);
    const dest = empty(4, 2);
    sampleCover(src, dest, { scale: 1, panX: 1, panY: 0 });
    expect(greyAt(dest, 0, 0)).toBe(255);
    expect(greyAt(dest, 1, 0)).toBe(1);
    expect(greyAt(dest, 2, 0)).toBe(2);
    expect(greyAt(dest, 3, 0)).toBe(3);
  });

  it("fills white when the window leaves the source", () => {
    const src = frame([[80]]);
    const dest = sampledFrame(src, 2, { scale: 0.7, panX: 40, panY: 0 });
    expect(greyAt(dest, 0, 0)).toBe(255);
    expect(greyAt(dest, 1, 0)).toBe(255);
  });
});
