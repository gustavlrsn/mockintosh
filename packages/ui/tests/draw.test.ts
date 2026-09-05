/**
 * Draw pass tests — verify that the pixel buffer is written correctly.
 *
 * These tests initialise QuickDraw with a small in-memory pixel buffer
 * and assert that specific pixels are set after drawTree().
 */

import { describe, it, expect, beforeEach } from "vitest";
import { computeLayout } from "../src/layout";
import { createDrawContext, drawTree } from "../src/draw";
import { createNode } from "../src/nodes";
import type { MeasureFunc } from "../src/layout";
import { createFocusManager } from "../src/focus";

const noMeasure: MeasureFunc = () => ({ width: 0, height: 0 });

const W = 32;
const H = 32;

function makeTestContext() {
  const pixels = new Uint8Array(W * H);
  const ctx = createDrawContext(pixels, W, H);
  const root = createNode("_root");
  root.style.width = W;
  root.style.height = H;
  root.layout = { x: 0, y: 0, width: W, height: H };
  ctx.focusManager = createFocusManager(root);
  return { pixels, ctx, root };
}

function px(pixels: Uint8Array, x: number, y: number): number {
  return pixels[y * W + x];
}

describe("drawTree — background fill", () => {
  it("box with background=1 fills pixels black", () => {
    const { pixels, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 8, height: 8 };
    child.props = { background: 1 };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    // Top-left region should be black
    expect(px(pixels, 0, 0)).toBe(1);
    expect(px(pixels, 7, 7)).toBe(1);
    // Area outside should be white
    expect(px(pixels, 9, 0)).toBe(0);
  });

  it("box with background=0 keeps pixels white", () => {
    const { pixels, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 8, height: 8 };
    child.props = { background: 0 };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    expect(px(pixels, 0, 0)).toBe(0);
    expect(px(pixels, 7, 7)).toBe(0);
  });

  it("checker pattern alternates pixels", () => {
    const { pixels, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 8, height: 8 };
    child.props = { background: "checker" };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    // Checker pattern: pixel (0,0) = black (0xAA byte, bit 7 set)
    expect(px(pixels, 0, 0)).toBe(1); // black
    expect(px(pixels, 1, 0)).toBe(0); // white
  });
});

describe("drawTree — nested boxes", () => {
  it("inner box overwrites outer box pixels", () => {
    const { pixels, ctx, root } = makeTestContext();

    const outer = createNode("box");
    outer.style = { width: 16, height: 16 };
    outer.props = { background: 0 };

    const inner = createNode("box");
    // Absolute position within outer
    inner.style = { position: "absolute", left: 4, top: 4, width: 8, height: 8 };
    inner.props = { background: 1 };

    outer.children = [inner];
    inner.parent = outer;
    root.children = [outer];
    outer.parent = root;

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    expect(px(pixels, 4, 4)).toBe(1);   // inner box start
    expect(px(pixels, 11, 11)).toBe(1); // inner box end
    expect(px(pixels, 0, 0)).toBe(0);   // outer box only (white)
    expect(px(pixels, 16, 0)).toBe(0);  // outside both boxes
  });
});
