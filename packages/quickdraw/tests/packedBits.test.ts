import { describe, it, expect } from "vitest";
import {
  InitGraf,
  OpenPort,
  PaintRect,
  CopyBits,
  ScrollRect,
  GetPixel,
  globals,
  srcCopy,
  srcXor,
  type GrafPort,
  type RgnHandle,
} from "../src";
import {
  makeRect,
  newBitMap,
  rowBytesFor,
  getBit,
  setBit,
  bitMapFromPixels,
  pixelsFromBitMap,
} from "../src/bits";

/** Render a bitmap as rows of `#` / `.` for readable assertions. */
function art(bm: ReturnType<typeof newBitMap>): string[] {
  const w = bm.bounds.right - bm.bounds.left;
  const px = pixelsFromBitMap(bm);
  const rows: string[] = [];
  for (let y = 0; y < bm.bounds.bottom - bm.bounds.top; y++) {
    rows.push(Array.from(px.subarray(y * w, (y + 1) * w), (p) => (p ? "#" : ".")).join(""));
  }
  return rows;
}

function openScreenPort(width: number, height: number): GrafPort {
  InitGraf(newBitMap(width, height));
  const port = {} as GrafPort;
  OpenPort(port);
  return port;
}

describe("packed BitMap layout", () => {
  it("rounds rowBytes up to a 16-bit word, as BitBlt.a requires", () => {
    expect(rowBytesFor(1)).toBe(2);
    expect(rowBytesFor(16)).toBe(2);
    expect(rowBytesFor(17)).toBe(4);
    expect(rowBytesFor(512)).toBe(64);
    expect(newBitMap(512, 342).baseAddr.length).toBe(64 * 342);
  });

  it("stores 8 pixels per byte, MSB leftmost, 1 = black", () => {
    const bm = newBitMap(10, 2);
    setBit(bm, 0, 0, 1);
    setBit(bm, 7, 0, 1);
    setBit(bm, 8, 1, 1);
    expect([...bm.baseAddr]).toEqual([0b10000001, 0, 0, 0b10000000]);
    expect(getBit(bm, 0, 0)).toBe(1);
    expect(getBit(bm, 1, 0)).toBe(0);
    expect(getBit(bm, 8, 1)).toBe(1);
    setBit(bm, 0, 0, 0);
    expect(bm.baseAddr[0]).toBe(0b00000001);
  });

  it("round-trips a 1-byte-per-pixel buffer", () => {
    const src = Uint8Array.from([1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1]);
    const bm = bitMapFromPixels(src, 4, 3);
    expect([...pixelsFromBitMap(bm)]).toEqual([...src]);
  });

  it("honours a source stride wider than the image", () => {
    const src = Uint8Array.from([1, 1, 9, 9, 0, 1, 9, 9]); // 2 wide, stride 4
    expect([...pixelsFromBitMap(bitMapFromPixels(src, 2, 2, 4))]).toEqual([1, 1, 0, 1]);
  });

  it("respects bounds that do not start at the origin", () => {
    const bm = { ...newBitMap(8, 2), bounds: makeRect(10, 20, 12, 28) };
    setBit(bm, 20, 10, 1);
    expect(bm.baseAddr[0]).toBe(0b10000000);
    expect(getBit(bm, 20, 10)).toBe(1);
  });
});

describe("InitGraf", () => {
  it("allocates the screen bitmap when none is supplied", () => {
    InitGraf(newBitMap(20, 4));
    expect(globals.screenBits.rowBytes).toBe(4);
    expect(globals.screenBits.baseAddr.length).toBe(16);
  });

  it("uses a host-supplied framebuffer", () => {
    const bits = newBitMap(16, 2);
    InitGraf(bits);
    expect(globals.screenBits).toBe(bits);
    const port = {} as GrafPort;
    OpenPort(port);
    PaintRect(makeRect(0, 0, 1, 16));
    expect([...bits.baseAddr]).toEqual([0xff, 0xff, 0, 0]);
  });
});

describe("drawing into packed bits", () => {
  it("PaintRect sets exactly the covered bits across byte boundaries", () => {
    const port = openScreenPort(16, 3);
    PaintRect(makeRect(1, 6, 2, 11));
    expect(art(port.portBits)).toEqual([
      "................",
      "......#####.....",
      "................",
    ]);
    expect(GetPixel(6, 1)).toBe(true);
    expect(GetPixel(5, 1)).toBe(false);
  });

  it("CopyBits shifts an unaligned source with srcCopy and combines with srcXor", () => {
    const port = openScreenPort(16, 2);
    const src = bitMapFromPixels(Uint8Array.from([1, 0, 1, 1, 0, 1]), 3, 2);
    CopyBits(src, port.portBits, src.bounds, makeRect(0, 5, 2, 8), srcCopy, null);
    expect(art(port.portBits)).toEqual([".....#.#........", ".....#.#........"]);
    CopyBits(src, port.portBits, src.bounds, makeRect(0, 6, 2, 9), srcXor, null);
    expect(art(port.portBits)).toEqual([".....####.......", ".....####......."]);
  });

  it("ScrollRect moves pixels by sub-byte amounts in both directions", () => {
    const port = openScreenPort(16, 4);
    PaintRect(makeRect(1, 1, 2, 4)); // ###
    PaintRect(makeRect(2, 9, 3, 10)); //          #
    const update: RgnHandle = { rgn: { rgnSize: 10, rgnBBox: makeRect(0, 0, 0, 0), data: new Int16Array(0) } };

    ScrollRect(makeRect(0, 0, 4, 16), 3, 1, update);
    expect(art(port.portBits)).toEqual([
      "................",
      "................",
      "....###.........",
      "............#...",
    ]);

    ScrollRect(makeRect(0, 0, 4, 16), -5, -2, update);
    // The bar's left pixel scrolls off the edge; the dot lands at (7, 1).
    expect(art(port.portBits)).toEqual([
      "##..............",
      ".......#........",
      "................",
      "................",
    ]);
  });
});
