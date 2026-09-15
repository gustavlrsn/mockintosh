/**
 * Draw pass tests — verify that the pixel buffer is written correctly.
 *
 * These tests draw into a small packed BitMap and assert that specific
 * pixels are set after drawTree().
 */

import { describe, it, expect, beforeEach } from "vitest";
import { computeLayout } from "../src/layout";
import { createDrawContext, drawTree } from "../src/draw";
import { createNode } from "../src/nodes";
import type { MeasureFunc } from "../src/layout";
import { createFocusManager } from "../src/focus";
import type { BitMap } from "@mockintosh/quickdraw";
import { getBit, newBitMap } from "@mockintosh/quickdraw/bits";

const noMeasure: MeasureFunc = () => ({ width: 0, height: 0 });

const W = 32;
const H = 32;

function makeTestContext() {
  const screen = newBitMap(W, H);
  const ctx = createDrawContext(screen);
  const root = createNode("_root");
  root.style.width = W;
  root.style.height = H;
  root.layout = { x: 0, y: 0, width: W, height: H };
  ctx.focusManager = createFocusManager(root);
  return { screen, ctx, root };
}

function px(screen: BitMap, x: number, y: number): number {
  return getBit(screen, x, y);
}

describe("drawTree — background fill", () => {
  it("box with background=1 fills pixels black", () => {
    const { screen, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 8, height: 8 };
    child.props = { background: 1 };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    // Top-left region should be black
    expect(px(screen, 0, 0)).toBe(1);
    expect(px(screen, 7, 7)).toBe(1);
    // Area outside should be white
    expect(px(screen, 9, 0)).toBe(0);
  });

  it("box with background=0 keeps pixels white", () => {
    const { screen, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 8, height: 8 };
    child.props = { background: 0 };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    expect(px(screen, 0, 0)).toBe(0);
    expect(px(screen, 7, 7)).toBe(0);
  });

  it("checker pattern alternates pixels", () => {
    const { screen, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 8, height: 8 };
    child.props = { background: "checker" };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    // Checker pattern: pixel (0,0) = black (0xAA byte, bit 7 set)
    expect(px(screen, 0, 0)).toBe(1); // black
    expect(px(screen, 1, 0)).toBe(0); // white
  });

  it("accepts a raw 8-byte QuickDraw pattern", () => {
    const { screen, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 8, height: 8 };
    child.props = { background: new Uint8Array([0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]) };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    expect(px(screen, 0, 0)).toBe(1);
    expect(px(screen, 1, 0)).toBe(0);
  });
});

describe("drawTree — borderRadius", () => {
  it("strokes a thick rounded border with one PenSize FrameRoundRect", () => {
    const { screen, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 24, height: 20, borderWidth: 3 };
    child.props = { background: 0, borderColor: 1, borderRadius: 8 };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    expect(px(screen, 0, 0)).toBe(0);
    expect(px(screen, 23, 0)).toBe(0);
    expect(px(screen, 12, 0)).toBe(1);
    expect(px(screen, 12, 1)).toBe(1);
    expect(px(screen, 12, 2)).toBe(1);
    expect(px(screen, 12, 3)).toBe(0);
    expect(px(screen, 12, 10)).toBe(0);
  });

  it("cuts the square corners of a filled box", () => {
    const { screen, ctx, root } = makeTestContext();
    const child = createNode("box");
    child.style = { width: 12, height: 10 };
    child.props = { background: 1, borderRadius: 3 };
    child.parent = root;
    root.children = [child];

    computeLayout(root, W, H, noMeasure);
    drawTree(root, ctx);

    expect(px(screen, 0, 0)).toBe(0);
    expect(px(screen, 11, 0)).toBe(0);
    expect(px(screen, 0, 9)).toBe(0);
    expect(px(screen, 11, 9)).toBe(0);
    expect(px(screen, 5, 5)).toBe(1);
  });
});

describe("drawTree — nested boxes", () => {
  it("inner box overwrites outer box pixels", () => {
    const { screen, ctx, root } = makeTestContext();

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

    expect(px(screen, 4, 4)).toBe(1);   // inner box start
    expect(px(screen, 11, 11)).toBe(1); // inner box end
    expect(px(screen, 0, 0)).toBe(0);   // outer box only (white)
    expect(px(screen, 16, 0)).toBe(0);  // outside both boxes
  });
});
