import { describe, expect, it } from "vitest";
import { newBitMap, pixelsFromBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Dithered } from "../src/widgets/Dithered";
import {
  isDitheredAsset,
  isImageFrame,
  rasterizeFrame,
  type DitheredAsset,
  type ImageFrame,
} from "../src/dither";

function greyFrame(width: number, height: number, value: number): ImageFrame {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    rgba[o] = value;
    rgba[o + 1] = value;
    rgba[o + 2] = value;
    rgba[o + 3] = 255;
  }
  return { width, height, rgba };
}

describe("rasterizeFrame", () => {
  it("ascii-dithers a solid dark tile to black", () => {
    const bits = rasterizeFrame(greyFrame(8, 8, 0), 8, 8, "ascii");
    expect([...bits]).toEqual(Array(64).fill(1));
  });
});

describe("source guards", () => {
  it("tells ImageFrame and DitheredAsset apart", () => {
    const frame = greyFrame(2, 2, 0);
    const asset: DitheredAsset = { width: 2, height: 2, pixels: new Uint8Array([1, 0, 0, 1]) };
    expect(isImageFrame(frame)).toBe(true);
    expect(isDitheredAsset(frame)).toBe(false);
    expect(isDitheredAsset(asset)).toBe(true);
    expect(isImageFrame(asset)).toBe(false);
  });
});

describe("Dithered", () => {
  it("paints a build-time asset without a decoder", () => {
    const asset: DitheredAsset = {
      width: 4,
      height: 4,
      pixels: new Uint8Array([
        1, 0, 1, 0,
        0, 1, 0, 1,
        1, 0, 1, 0,
        0, 1, 0, 1,
      ]),
    };
    const screen = newBitMap(8, 8);
    const ui = createUI({ screen });
    ui.render(() => <Dithered src={asset} width={4} height={4} />);
    ui.frame();
    const pixels = pixelsFromBitMap(screen);
    expect(pixels[0]).toBe(1);
    expect(pixels[1]).toBe(0);
    expect(pixels[8 + 1]).toBe(1);
  });

  it("dithers an ImageFrame in place", () => {
    const screen = newBitMap(16, 16);
    const ui = createUI({ screen });
    ui.render(() => <Dithered src={greyFrame(8, 8, 0)} mode="ascii" width={8} height={8} />);
    ui.frame();
    const pixels = pixelsFromBitMap(screen);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) expect(pixels[y * 16 + x]).toBe(1);
    }
  });
});
