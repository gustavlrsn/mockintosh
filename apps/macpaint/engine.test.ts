import { describe, expect, it } from "vitest";
import { systemPatterns } from "../../src/os/resourceCatalog/catalog";
import {
  blitBitmap,
  brushStamp,
  clearRect,
  cloneBitmap,
  createBitmap,
  eraserStamp,
  extractRect,
  fillOval,
  fillRectPattern,
  fillRoundRect,
  floodFill,
  frameOval,
  frameRect,
  frameRoundRect,
  getPixel,
  invertRect,
  normalizeRect,
  resizeBitmap,
  setPixel,
  spray,
  strokeLine,
  walkLine,
} from "./engine";
import { GRAY50_PATTERN, PATTERN_HEX, patternInk, WHITE_PATTERN } from "./patterns";

function dump(b: { width: number; height: number; pixels: Uint8Array }): string {
  const rows: string[] = [];
  for (let y = 0; y < b.height; y++) {
    let row = "";
    for (let x = 0; x < b.width; x++) row += b.pixels[y * b.width + x] ? "#" : ".";
    rows.push(row);
  }
  return rows.join("\n");
}

describe("MacPaint patterns", () => {
  it("matches System PAT# 0 from the 7.5.3 catalog", () => {
    expect(PATTERN_HEX).toEqual(systemPatterns().map((p) => p.pat));
  });

  it("reads QuickDraw pattern bits MSB-left", () => {
    expect(patternInk(GRAY50_PATTERN, 0, 0)).toBe(1);
    expect(patternInk(GRAY50_PATTERN, 1, 0)).toBe(0);
    expect(patternInk(GRAY50_PATTERN, 0, 1)).toBe(0);
    expect(patternInk(WHITE_PATTERN, 3, 3)).toBe(0);
  });
});

describe("bitmap", () => {
  it("creates a white buffer and clones independently", () => {
    const a = createBitmap(3, 2);
    expect(a.pixels).toHaveLength(6);
    expect([...a.pixels]).toEqual([0, 0, 0, 0, 0, 0]);
    setPixel(a, 1, 1, 1);
    const b = cloneBitmap(a);
    setPixel(a, 0, 0, 1);
    expect(getPixel(b, 0, 0)).toBe(0);
    expect(getPixel(b, 1, 1)).toBe(1);
  });

  it("resizes by copying the top-left and filling new area white", () => {
    const src = createBitmap(2, 2);
    setPixel(src, 0, 0, 1);
    setPixel(src, 1, 1, 1);
    const grown = resizeBitmap(src, 3, 2);
    expect(dump(grown)).toBe("#..\n.#.");
    const shrunk = resizeBitmap(src, 1, 1);
    expect(dump(shrunk)).toBe("#");
  });

  it("blits and extracts a clipped rect", () => {
    const src = createBitmap(2, 2, 1);
    const dst = createBitmap(4, 3);
    blitBitmap(src, dst, 2, 1);
    expect(dump(dst)).toBe("....\n..##\n..##");
    expect(dump(extractRect(dst, { x: 2, y: 1, w: 2, h: 2 }))).toBe("##\n##");
  });
});

describe("drawing", () => {
  it("walks a horizontal, vertical, and diagonal line", () => {
    const h: Array<[number, number]> = [];
    walkLine(1, 2, 4, 2, (x, y) => h.push([x, y]));
    expect(h).toEqual([[1, 2], [2, 2], [3, 2], [4, 2]]);

    const v: Array<[number, number]> = [];
    walkLine(0, 0, 0, 2, (x, y) => v.push([x, y]));
    expect(v).toEqual([[0, 0], [0, 1], [0, 2]]);

    const d = createBitmap(4, 4);
    walkLine(0, 0, 3, 3, (x, y) => setPixel(d, x, y, 1));
    expect(dump(d)).toBe("#...\n.#..\n..#.\n...#");
  });

  it("strokes a thick line as a square stamp along the path", () => {
    const b = createBitmap(5, 3);
    strokeLine(1, 1, 3, 1, 3, (x, y) => setPixel(b, x, y, 1));
    expect(dump(b)).toBe("#####\n#####\n#####");
  });

  it("frames and fills a rect", () => {
    const frame = createBitmap(5, 4);
    frameRect({ x: 0, y: 0, w: 5, h: 4 }, 1, (x, y) => setPixel(frame, x, y, 1));
    expect(dump(frame)).toBe("#####\n#...#\n#...#\n#####");

    const fill = createBitmap(4, 3);
    fillRectPattern(fill, { x: 1, y: 0, w: 2, h: 2 }, GRAY50_PATTERN);
    expect(getPixel(fill, 1, 0)).toBe(patternInk(GRAY50_PATTERN, 1, 0));
    expect(getPixel(fill, 2, 0)).toBe(patternInk(GRAY50_PATTERN, 2, 0));
    expect(getPixel(fill, 0, 0)).toBe(0);
  });

  it("fills an oval and leaves the corners white", () => {
    const b = createBitmap(8, 6);
    fillOval({ x: 0, y: 0, w: 8, h: 6 }, (x, y) => setPixel(b, x, y, 1));
    expect(getPixel(b, 0, 0)).toBe(0);
    expect(getPixel(b, 7, 0)).toBe(0);
    expect(getPixel(b, 3, 3)).toBe(1);
    expect(getPixel(b, 4, 2)).toBe(1);
    const framed = createBitmap(8, 6);
    frameOval({ x: 0, y: 0, w: 8, h: 6 }, 1, (x, y) => setPixel(framed, x, y, 1));
    expect(getPixel(framed, 3, 3)).toBe(0);
    expect(getPixel(framed, 3, 0) + getPixel(framed, 0, 3)).toBeGreaterThan(0);
    floodFill(framed, 3, 3, GRAY50_PATTERN);
    expect(getPixel(framed, 0, 0)).toBe(0);
  });

  it("rounds the corners of a round-rect", () => {
    const b = createBitmap(8, 8);
    fillRoundRect({ x: 0, y: 0, w: 8, h: 8 }, (x, y) => setPixel(b, x, y, 1));
    expect(getPixel(b, 0, 0)).toBe(0);
    expect(getPixel(b, 3, 3)).toBe(1);
    const framed = createBitmap(8, 8);
    frameRoundRect({ x: 0, y: 0, w: 8, h: 8 }, 1, (x, y) => setPixel(framed, x, y, 1));
    expect(getPixel(framed, 3, 3)).toBe(0);
    expect(framed.pixels.some((p) => p === 1)).toBe(true);
    expect(getPixel(framed, 0, 0)).toBe(0);
  });

  it("flood-fills a connected region with a pattern and stops at a wall", () => {
    const b = createBitmap(5, 3);
    walkLine(2, 0, 2, 2, (x, y) => setPixel(b, x, y, 1));
    floodFill(b, 0, 1, GRAY50_PATTERN);
    expect(getPixel(b, 2, 1)).toBe(1);
    expect(getPixel(b, 4, 1)).toBe(0);
    expect(getPixel(b, 0, 1)).toBe(patternInk(GRAY50_PATTERN, 0, 1));
    expect(getPixel(b, 1, 0)).toBe(patternInk(GRAY50_PATTERN, 1, 0));
  });

  it("stamps a brush disc, an eraser square, and a seeded spray", () => {
    const brush = createBitmap(7, 7);
    brushStamp(brush, 3, 3, 5, GRAY50_PATTERN);
    expect(getPixel(brush, 3, 3)).toBe(patternInk(GRAY50_PATTERN, 3, 3));
    expect(getPixel(brush, 0, 0)).toBe(0);

    const erased = createBitmap(6, 6, 1);
    eraserStamp(erased, 2, 2, 3);
    expect(dump(extractRect(erased, { x: 1, y: 1, w: 3, h: 3 }))).toBe("...\n...\n...");
    expect(getPixel(erased, 0, 0)).toBe(1);

    let i = 0;
    const sprayBits = createBitmap(9, 9);
    spray(sprayBits, 4, 4, 3, GRAY50_PATTERN, () => {
      i += 0.17;
      return i % 1;
    });
    expect(sprayBits.pixels.some((p) => p === 1)).toBe(true);
  });

  it("inverts and clears a clipped rect", () => {
    const b = createBitmap(4, 2, 1);
    invertRect(b, { x: 1, y: 0, w: 2, h: 2 });
    expect(dump(b)).toBe("#..#\n#..#");
    clearRect(b, { x: -2, y: 0, w: 3, h: 1 });
    expect(getPixel(b, 0, 0)).toBe(0);
    expect(getPixel(b, 3, 0)).toBe(1);
  });

  it("treats a single-pixel drag as a 1×1 rect", () => {
    expect(normalizeRect(4, 5, 4, 5)).toEqual({ x: 4, y: 5, w: 1, h: 1 });
    expect(normalizeRect(3, 1, 1, 4)).toEqual({ x: 1, y: 1, w: 3, h: 4 });
  });
});
