import { describe, it, expect } from "vitest";
import { computeLayout } from "../src/layout";
import { createDrawContext, drawTree } from "../src/draw";
import { createNode } from "../src/nodes";
import type { MeasureFunc } from "../src/layout";
import type { GrafPort } from "@mockintosh/quickdraw";

const noMeasure: MeasureFunc = () => ({ width: 0, height: 0 });
const W = 16;
const H = 16;

describe("raster onPaint", () => {
  it("invokes onPaint with the laid-out rect and writes pixels", () => {
    const pixels = new Uint8Array(W * H);
    const ctx = createDrawContext(pixels, W, H);
    const root = createNode("_root");
    root.style = { width: W, height: H };
    const raster = createNode("raster");
    raster.style = { position: "absolute", left: 2, top: 3, width: 4, height: 5 };
    raster.props.onPaint = (_port: unknown, rect) => {
      expect(rect).toEqual({ x: 2, y: 3, width: 4, height: 5 });
      const port = _port as GrafPort;
      const { baseAddr, rowBytes } = port.portBits;
      for (let y = rect.y; y < rect.y + rect.height; y++) {
        for (let x = rect.x; x < rect.x + rect.width; x++) {
          baseAddr[y * rowBytes + x] = 1;
        }
      }
    };
    raster.parent = root;
    root.children = [raster];
    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);
    expect(pixels[3 * W + 2]).toBe(1);
    expect(pixels[7 * W + 5]).toBe(1);
    expect(pixels[0]).toBe(0);
  });
});

describe("border protection", () => {
  it("overflow=hidden clips children to the padding box, so the border survives", () => {
    const pixels = new Uint8Array(W * H);
    const ctx = createDrawContext(pixels, W, H);
    const root = createNode("_root");
    root.style = { width: W, height: H };
    const frame = createNode("box");
    frame.style = { width: 10, height: 10, borderWidth: 1, overflow: "hidden" };
    frame.props.borderColor = 1;
    frame.props.background = 0;
    // Child tries to paint white over the whole frame, including the border.
    const child = createNode("box");
    child.style = { position: "absolute", left: -1, top: -1, width: 12, height: 12 };
    child.props.background = 0;
    child.parent = frame;
    frame.children = [child];
    frame.parent = root;
    root.children = [frame];
    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);
    // Border pixels intact
    expect(pixels[0]).toBe(1);           // top-left corner
    expect(pixels[5]).toBe(1);           // top edge
    expect(pixels[5 * W + 0]).toBe(1);   // left edge
    expect(pixels[9 * W + 9]).toBe(1);   // bottom-right corner
    // Interior is white
    expect(pixels[5 * W + 5]).toBe(0);
  });

  it("a child at left=0 in a bordered box does not cover the border", () => {
    const pixels = new Uint8Array(W * H);
    const ctx = createDrawContext(pixels, W, H);
    const root = createNode("_root");
    root.style = { width: W, height: H };
    const frame = createNode("box");
    frame.style = { width: 10, height: 10, borderWidth: 1 };
    frame.props.borderColor = 1;
    const child = createNode("box");
    child.style = { position: "absolute", left: 0, top: 0, width: 8, height: 8 };
    child.props.background = 0;
    child.parent = frame;
    frame.children = [child];
    frame.parent = root;
    root.children = [frame];
    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);
    expect(pixels[0]).toBe(1);
    expect(pixels[1 * W + 0]).toBe(1);
    expect(pixels[1 * W + 1]).toBe(0);
  });
});

describe("palette color fill", () => {
  it("writes palette index 3 into the buffer", () => {
    const pixels = new Uint8Array(W * H);
    const ctx = createDrawContext(pixels, W, H);
    const root = createNode("_root");
    root.style = { width: W, height: H };
    const box = createNode("box");
    box.style = { width: 4, height: 4 };
    box.props.background = 3;
    box.parent = root;
    root.children = [box];
    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);
    expect(pixels[0]).toBe(3);
    expect(pixels[3 * W + 3]).toBe(3);
    expect(pixels[5]).toBe(0);
  });
});
