import { describe, it, expect } from "vitest";
import { computeLayout } from "../src/layout";
import { createDrawContext, drawTree } from "../src/draw";
import { createNode } from "../src/nodes";
import { createElement } from "../src/renderer";
import type { MeasureFunc } from "../src/layout";
import { newBitMap, pixelsFromBitMap } from "@mockintosh/quickdraw/bits";

const noMeasure: MeasureFunc = () => ({ width: 0, height: 0 });
const W = 16;
const H = 16;

function paint(pixels: Uint8Array, width: number, height: number, left = 0, top = 0) {
  const screen = newBitMap(W, H);
  const ctx = createDrawContext(screen);
  const root = createNode("_root");
  root.style = { width: W, height: H };
  const bitmap = createNode("bitmap");
  bitmap.style = { position: "absolute", left, top, width, height };
  bitmap.props.pixels = pixels;
  bitmap.parent = root;
  root.children = [bitmap];
  computeLayout(root, W, H, noMeasure);
  drawTree(root, ctx);
  return pixelsFromBitMap(screen);
}

describe("bitmap", () => {
  it("is a first-class element, not a box fallback", () => {
    expect(createElement("bitmap").type).toBe("bitmap");
  });

  it("blits a 1-byte-per-pixel buffer, 0 white and nonzero black", () => {
    const src = new Uint8Array([
      1, 0, 1, 0,
      0, 1, 0, 1,
      1, 0, 1, 0,
      0, 1, 0, 1,
    ]);
    const pixels = paint(src, 4, 4, 2, 3);
    expect(pixels[3 * W + 2]).toBe(1);
    expect(pixels[3 * W + 3]).toBe(0);
    expect(pixels[4 * W + 3]).toBe(1);
    expect(pixels[6 * W + 5]).toBe(1);
    expect(pixels[0]).toBe(0);
  });

  it("clips to the laid-out rect when the buffer is larger", () => {
    const src = new Uint8Array(8 * 8).fill(1);
    const pixels = paint(src, 8, 8, 12, 12);
    expect(pixels[12 * W + 12]).toBe(1);
    expect(pixels[15 * W + 15]).toBe(1);
    // Would be (12, 20) in buffer space — outside the screen.
    expect(pixels.every((p) => p === 0 || p === 1)).toBe(true);
  });

  it("paints nothing when pixels is missing or too short for a row", () => {
    const empty = paint(new Uint8Array(0), 4, 4);
    expect(empty.every((p) => p === 0)).toBe(true);
    const short = paint(new Uint8Array([1, 1, 1]), 4, 4);
    expect(short.every((p) => p === 0)).toBe(true);
  });

  it("is clipped by a parent overflow=hidden, not by its own buffer size", () => {
    const screen = newBitMap(W, H);
    const ctx = createDrawContext(screen);
    const root = createNode("_root");
    root.style = { width: W, height: H };
    const frame = createNode("box");
    frame.style = { width: 6, height: 6, overflow: "hidden" };
    frame.props.background = 0;
    const bitmap = createNode("bitmap");
    bitmap.style = { width: 12, height: 12 };
    bitmap.props.pixels = new Uint8Array(12 * 12).fill(1);
    bitmap.parent = frame;
    frame.children = [bitmap];
    frame.parent = root;
    root.children = [frame];
    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);
    const pixels = pixelsFromBitMap(screen);
    expect(pixels[0]).toBe(1);
    expect(pixels[5 * W + 5]).toBe(1);
    expect(pixels[6 * W + 6]).toBe(0);
    expect(pixels[8]).toBe(0);
  });
});
