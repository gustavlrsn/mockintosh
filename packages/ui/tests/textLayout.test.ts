/**
 * Text layout tests — line breaking (pure) and text alignment (rendered).
 */

import { describe, it, expect } from "vitest";
import { layoutText } from "../src/fonts/textLayout";
import type { DeckerFont } from "../src/fonts/font";
import { computeLayout } from "../src/layout";
import { createDrawContext, drawTree } from "../src/draw";
import { createNode, type CanvasNode } from "../src/nodes";
import { createMeasureFunc } from "../src/measure";
import { installFontBridge } from "../src/fonts/bridge";
import { newBitMap, pixelsFromBitMap } from "@mockintosh/quickdraw/bits";
import { requireFont } from "../src/fonts/registry";

// Synthetic monospace font: every printable ASCII glyph is 5px + 1px spacing = 6px advance.
function monoFont(): DeckerFont {
  const glyphWidths = new Uint8Array(256);
  for (let c = 32; c <= 126; c++) glyphWidths[c] = 5;
  return {
    name: "mono-test",
    maxWidth: 8,
    glyphHeight: 10,
    spacing: 1,
    glyphStride: 10,
    glyphWidths,
    glyphData: new Uint8Array(256 * 10),
    sourceFormat: "FNT0",
  };
}

describe("layoutText — line breaking", () => {
  const font = monoFont();

  it("single line without maxWidth", () => {
    const b = layoutText(font, "hello");
    expect(b.lines.map((l) => l.text)).toEqual(["hello"]);
    expect(b.width).toBe(30);
    expect(b.height).toBe(10);
  });

  it("explicit newlines always break", () => {
    const b = layoutText(font, "a\nbb\nccc");
    expect(b.lines.map((l) => l.text)).toEqual(["a", "bb", "ccc"]);
    expect(b.width).toBe(18);
    expect(b.height).toBe(30);
  });

  it("word-wraps greedily to maxWidth", () => {
    // "aa bb cc" — each word 12px, space 6px. maxWidth 30 fits "aa bb" (30px).
    const b = layoutText(font, "aa bb cc", 30);
    expect(b.lines.map((l) => l.text)).toEqual(["aa bb", "cc"]);
    expect(b.width).toBe(30);
  });

  it("breaks an overlong word between characters", () => {
    const b = layoutText(font, "abcdefgh", 18); // 3 chars per line
    expect(b.lines.map((l) => l.text)).toEqual(["abc", "def", "gh"]);
    expect(b.lines.every((l) => l.width <= 18)).toBe(true);
  });

  it("newlines and wrapping combine", () => {
    const b = layoutText(font, "aa bb\ncc", 12);
    expect(b.lines.map((l) => l.text)).toEqual(["aa", "bb", "cc"]);
  });

  it("empty text yields one empty line", () => {
    const b = layoutText(font, "");
    expect(b.lines).toEqual([{ text: "", width: 0 }]);
    expect(b.height).toBe(10);
  });
});

// -------------------------------------------------------------------------
// Rendered alignment — uses the real built-in fonts.
// -------------------------------------------------------------------------

installFontBridge();
const measure = createMeasureFunc();

function textNode(props: Record<string, unknown>, style: CanvasNode["style"], content: string): CanvasNode {
  const t = createNode("text");
  t.props = { font: "body", ...props };
  t.style = style;
  const c = createNode("_text_content");
  c.textContent = content;
  c.parent = t;
  t.children = [c];
  return t;
}

/** Bounding box of black pixels, or null if none. */
function inkBounds(pixels: Uint8Array, w: number, h: number) {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (pixels[y * w + x] === 1) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

function render(t: CanvasNode, w: number, h: number): Uint8Array {
  const screen = newBitMap(w, h);
  const ctx = createDrawContext(screen);
  const root = createNode("_root");
  root.style = { width: w, height: h };
  t.parent = root;
  root.children = [t];
  computeLayout(root, w, h, measure);
  drawTree(root, ctx);
  return pixelsFromBitMap(screen);
}

describe("<text> alignment", () => {
  const W = 120;
  const H = 60;
  const glyphH = requireFont("body").glyphHeight;

  it("verticalAlign=top draws at the top of the box", () => {
    const px = render(textNode({ verticalAlign: "top" }, { width: W, height: H }, "Hi"), W, H);
    const ink = inkBounds(px, W, H)!;
    expect(ink).not.toBeNull();
    expect(ink.minY).toBeLessThan(glyphH);
  });

  it("verticalAlign=middle centers the line block", () => {
    const px = render(textNode({ verticalAlign: "middle" }, { width: W, height: H }, "Hi"), W, H);
    const ink = inkBounds(px, W, H)!;
    const expectedTop = Math.floor((H - glyphH) / 2);
    expect(ink.minY).toBeGreaterThanOrEqual(expectedTop);
    expect(ink.maxY).toBeLessThan(expectedTop + glyphH);
  });

  it("verticalAlign=bottom draws against the bottom edge", () => {
    const px = render(textNode({ verticalAlign: "bottom" }, { width: W, height: H }, "Hi"), W, H);
    const ink = inkBounds(px, W, H)!;
    expect(ink.minY).toBeGreaterThanOrEqual(H - glyphH);
  });

  it("align=right puts ink against the right edge; align=left against the left", () => {
    const right = inkBounds(render(textNode({ align: "right" }, { width: W, height: H }, "Hi"), W, H), W, H)!;
    const left = inkBounds(render(textNode({ align: "left" }, { width: W, height: H }, "Hi"), W, H), W, H)!;
    expect(left.minX).toBeLessThan(4);
    expect(right.maxX).toBeGreaterThan(W - 6);
    expect(right.minX).toBeGreaterThan(left.minX);
  });

  it("wrap measures multiple lines and honors padding", () => {
    const t = textNode({ wrap: true }, { width: 60, padding: 4 }, "one two three four five six");
    render(t, W, H);
    expect(t.layout.height).toBeGreaterThan(glyphH * 2);
    expect((t.layout.height - 8) % glyphH).toBe(0); // whole number of lines inside padding
  });

  it("wrapped paragraph aligns each line to the right", () => {
    const t = textNode({ wrap: true, align: "right" }, { width: W, height: H }, "aaaa bbbbbbbbbbbbbbbbbbbb");
    const px = render(t, W, H);
    // Every line should touch the right edge region; check first-line row band.
    const firstBandInk = inkBounds(px.slice(0, W * glyphH), W, glyphH)!;
    expect(firstBandInk.maxX).toBeGreaterThan(W - 6);
  });
});
