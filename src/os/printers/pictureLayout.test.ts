import { describe, expect, it } from "vitest";
import { bitMapHeight, bitMapWidth, getBit } from "@mockintosh/quickdraw/bits";
import { layoutPicture, type PictureLayoutOptions } from "./pictureLayout";
import type { PrintableImage } from "@mockintosh/sdk";

function image(width: number, height: number, paint?: (data: Uint8Array) => void): PrintableImage {
  const data = new Uint8Array(width * height);
  paint?.(data);
  return { width, height, data };
}

function fit(width: number, height: number, paperWidth: number, options: PictureLayoutOptions = {}) {
  const layout = layoutPicture(image(width, height, (data) => data.fill(1)), options, paperWidth);
  return { scale: layout.scale, orientation: layout.orientation, pageW: bitMapWidth(layout.page), pageH: bitMapHeight(layout.page) };
}

describe("layoutPicture", () => {
  it("picks the whole-number scale and orientation that fill the paper", () => {
    expect(fit(288, 288, 576)).toMatchObject({ scale: 2, orientation: "portrait" });
    expect(fit(288, 288, 384)).toMatchObject({ scale: 1, orientation: "portrait" });
    expect(fit(512, 384, 576)).toMatchObject({ scale: 1, orientation: "portrait" });
    expect(fit(512, 384, 384)).toMatchObject({ scale: 1, orientation: "landscape" });
    expect(fit(576, 432, 576)).toMatchObject({ scale: 1, orientation: "portrait" });
    expect(fit(384, 288, 384)).toMatchObject({ scale: 1, orientation: "portrait" });
    expect(fit(768, 576, 576)).toMatchObject({ scale: 1, orientation: "landscape" });
    expect(fit(512, 384, 384)).toMatchObject({ scale: 1, orientation: "landscape" });
  });

  it("shrinks the least when neither side fits at 1×", () => {
    const layout = fit(1000, 800, 576);
    expect(layout.orientation).toBe("landscape");
    expect(layout.scale).toBeCloseTo(576 / 800);
  });

  it("honours an explicit orientation and clamps a scale that is too wide", () => {
    expect(fit(288, 288, 576, { orientation: "landscape", scale: 2 })).toMatchObject({
      scale: 2,
      orientation: "landscape",
    });
    const clamped = fit(288, 288, 576, { scale: 3 });
    expect(clamped.orientation).toBe("portrait");
    expect(clamped.scale).toBeCloseTo(2);
  });

  it("fills the paper width when asked to fit", () => {
    const layout = fit(288, 288, 576, { scale: "fit", orientation: "portrait" });
    expect(layout.scale).toBeCloseTo(2);
    expect(layout.pageW).toBe(576);
  });

  it("sizes the page to the scaled picture", () => {
    const layout = fit(8, 8, 576, { scale: 1 });
    expect(layout.pageW).toBe(576);
    expect(layout.pageH).toBe(8);
  });

  it("turns a landscape picture clockwise, mapping the top-left corner to the top-right", () => {
    const src = image(2, 1, (data) => {
      data[0] = 1;
    });
    const layout = layoutPicture(src, { orientation: "landscape", scale: 1 }, 4);
    const page = layout.page;
    const left = Math.floor((4 - 1) / 2);
    expect(getBit(page, left, 0)).toBe(1);
    expect(getBit(page, left, 1)).toBe(0);
  });
});
