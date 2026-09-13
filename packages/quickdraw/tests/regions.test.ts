import { describe, expect, it } from "vitest";
import {
  CopyRgn,
  DiffRgn,
  EmptyRgn,
  EqualRgn,
  InitGraf,
  InsetRgn,
  NewRgn,
  OffsetRgn,
  OpenPort,
  PtInRgn,
  RectRgn,
  SectRgn,
  SetRectRgn,
  UnionRgn,
  XorRgn,
  globals,
  type GrafPort,
  type RgnHandle,
} from "../src";
import { makePoint, makeRect, newBitMap } from "../src/bits";
import { isRectRgn } from "../src/regionTypes";

function openPort(): GrafPort {
  InitGraf(newBitMap(64, 64));
  const port = {} as GrafPort;
  OpenPort(port);
  return port;
}

function rect(l: number, t: number, r: number, b: number): RgnHandle {
  const h = NewRgn();
  SetRectRgn(h, l, t, r, b);
  return h;
}

function pixels(rgn: RgnHandle, bounds = makeRect(0, 0, 16, 16)): Set<string> {
  const out = new Set<string>();
  for (let v = bounds.top; v < bounds.bottom; v++) {
    for (let h = bounds.left; h < bounds.right; h++) {
      if (PtInRgn(makePoint(h, v), rgn)) out.add(`${h},${v}`);
    }
  }
  return out;
}

describe("packed regions", () => {
  it("treats rgnSize === 10 as rectangular", () => {
    openPort();
    const r = rect(2, 3, 8, 9);
    expect(isRectRgn(r.rgn)).toBe(true);
    expect(r.rgn.data.length).toBe(0);
    expect(PtInRgn(makePoint(2, 3), r)).toBe(true);
    expect(PtInRgn(makePoint(7, 8), r)).toBe(true);
    expect(PtInRgn(makePoint(8, 9), r)).toBe(false);
  });

  it("CopyRgn copies into the existing Region object", () => {
    openPort();
    const src = rect(1, 1, 4, 5);
    const dst = NewRgn();
    const obj = dst.rgn;
    CopyRgn(src, dst);
    expect(dst.rgn).toBe(obj);
    expect(EqualRgn(src, dst)).toBe(true);
  });

  it("Sect/Union/Diff/Xor match a pixel oracle on rectangles", () => {
    openPort();
    const a = rect(0, 0, 8, 8);
    const b = rect(4, 4, 12, 12);
    const dst = NewRgn();

    SectRgn(a, b, dst);
    expect([...pixels(dst)].sort()).toEqual([...pixels(rect(4, 4, 8, 8))].sort());

    UnionRgn(a, b, dst);
    expect(PtInRgn(makePoint(1, 1), dst)).toBe(true);
    expect(PtInRgn(makePoint(10, 10), dst)).toBe(true);
    expect(PtInRgn(makePoint(10, 1), dst)).toBe(false);

    DiffRgn(a, b, dst);
    expect(PtInRgn(makePoint(1, 1), dst)).toBe(true);
    expect(PtInRgn(makePoint(5, 5), dst)).toBe(false);

    XorRgn(a, b, dst);
    expect(PtInRgn(makePoint(1, 1), dst)).toBe(true);
    expect(PtInRgn(makePoint(5, 5), dst)).toBe(false);
    expect(PtInRgn(makePoint(10, 10), dst)).toBe(true);
  });

  it("InsetRgn shrinks a rectangle and empties when it collapses", () => {
    openPort();
    const r = rect(0, 0, 10, 8);
    InsetRgn(r, 2, 1);
    expect(r.rgn.rgnBBox).toEqual(makeRect(1, 2, 7, 8));
    InsetRgn(r, 10, 10);
    expect(EmptyRgn(r)).toBe(true);
  });

  it("OffsetRgn walks a rectangle", () => {
    openPort();
    const r = rect(1, 2, 5, 6);
    OffsetRgn(r, 3, -1);
    expect(r.rgn.rgnBBox).toEqual(makeRect(1, 4, 5, 8));
  });

  it("SectRgn(wideOpen, r) is O(|r|) and equals r", () => {
    openPort();
    const r = rect(10, 10, 14, 15);
    const dst = NewRgn();
    SectRgn(globals.wideOpen, r, dst);
    expect(EqualRgn(dst, r)).toBe(true);
  });
});
