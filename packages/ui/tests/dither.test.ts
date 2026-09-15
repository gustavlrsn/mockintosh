import { describe, expect, it } from "vitest";
import { createDitherer, toBits, type ImageFrame } from "../src/dither";

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
});
