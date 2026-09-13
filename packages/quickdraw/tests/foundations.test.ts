import { describe, expect, it } from "vitest";
import {
  BitAnd,
  BitNot,
  BitOr,
  BitShift,
  BitXor,
  ClosePort,
  CopyRgn,
  GetClip,
  GetPort,
  HiWord,
  InitGraf,
  LoWord,
  MapPt,
  MapRect,
  NewRgn,
  OffsetRgn,
  OpenPort,
  QDError,
  Random,
  ScalePt,
  SetClip,
  SetEmptyRgn,
  SetOrigin,
  SetRectRgn,
  globals,
  type GrafPort,
  type RgnHandle,
} from "../src";
import { makePoint, makeRect, newBitMap } from "../src/bits";
import { map1Oracle, randomStepOracle, scale1Oracle } from "./oracle/fixmath";

function openPort(w: number, h: number): GrafPort {
  InitGraf(newBitMap(w, h));
  const port = {} as GrafPort;
  OpenPort(port);
  return port;
}

describe("signed word utilities", () => {
  it("HiWord/LoWord are signed INTEGERs", () => {
    expect(HiWord(-65536)).toBe(-1);
    expect(LoWord(-65536)).toBe(0);
    expect(HiWord(0x80000000)).toBe(-32768);
    expect(LoWord(0x00008000)).toBe(-32768);
    expect(HiWord(0x00010000)).toBe(1);
    expect(LoWord(0x0000ffff)).toBe(-1);
  });

  it("BitAnd/Or/Xor/Not return signed LongInt", () => {
    expect(BitAnd(0xffffffff, 0x80000000)).toBe(-2147483648);
    expect(BitOr(0x80000000, 1)).toBe(-2147483647);
    expect(BitXor(-1, 0)).toBe(-1);
    expect(BitNot(0)).toBe(-1);
  });

  it("BitShift count ≥ 32 yields 0 (68k LSL.L/LSR.L mod 64)", () => {
    expect(BitShift(1, 32)).toBe(0);
    expect(BitShift(1, 31)).toBe(-2147483648);
    expect(BitShift(0x80000000, -32)).toBe(0);
    expect(BitShift(0x80000000, -1)).toBe(0x40000000);
  });
});

describe("ScalePt / MapPt / MapRect", () => {
  it("ScalePt matches SCALE1 including the 1-pixel minimum", () => {
    const pt = makePoint(1, 1);
    ScalePt(pt, makeRect(0, 0, 8, 8), makeRect(0, 0, 1, 1));
    expect(pt).toEqual(makePoint(scale1Oracle(1, 8, 1), scale1Oracle(1, 8, 1)));
    expect(pt.h).toBe(1);
  });

  it("ScalePt zeroes non-positive inputs and skips equal extents", () => {
    const pt = makePoint(-3, 5);
    // from 10×10 → to 20×10: width scales (h≤0 → 0), height is unchanged
    ScalePt(pt, makeRect(0, 0, 10, 10), makeRect(0, 0, 10, 20));
    expect(pt.h).toBe(0);
    expect(pt.v).toBe(5);
  });

  it("MapPt(-5) from 2→1 rounds half away from zero", () => {
    const pt = makePoint(-5, 0);
    MapPt(pt, makeRect(0, 0, 1, 2), makeRect(0, 0, 1, 1));
    expect(pt.h).toBe(map1Oracle(-5, 0, 2, 0, 1));
  });

  it("MapRect is MapPt × 2", () => {
    const r = makeRect(2, -4, 6, 4);
    const from = makeRect(0, 0, 8, 8);
    const to = makeRect(10, 20, 14, 24);
    MapRect(r, from, to);
    const tl = makePoint(-4, 2);
    const br = makePoint(4, 6);
    MapPt(tl, from, to);
    MapPt(br, from, to);
    expect(r).toEqual(makeRect(tl.v, tl.h, br.v, br.h));
  });
});

describe("Random", () => {
  it("matches the Util.a 16-bit-word recurrence, including −32768 → 0", () => {
    globals.randSeed = 1;
    let seed = 1;
    for (let i = 0; i < 2000; i++) {
      const step = randomStepOracle(seed);
      const value = Random();
      expect(value).toBe(step.value);
      expect(globals.randSeed).toBe(step.seed);
      seed = step.seed;
    }
  });
});

describe("port plumbing", () => {
  it("throws QDError when thePort is NIL", () => {
    InitGraf(newBitMap(8, 8));
    expect(globals.thePort).toBeNull();
    expect(() => SetOrigin(0, 0)).toThrow(QDError);
  });

  it("OpenPort = NewRgn × 2 + InitPort; ClosePort leaves thePort", () => {
    const port = openPort(16, 10);
    expect(GetPort()).toBe(port);
    expect(port.visRgn.rgn.rgnSize).toBe(10);
    expect(port.clipRgn.rgn.rgnBBox).toEqual(globals.wideOpen.rgn.rgnBBox);
    ClosePort(port);
    expect(GetPort()).toBe(port);
  });

  it("SetClip/GetClip copy into the existing handle", () => {
    const port = openPort(32, 32);
    const clip = port.clipRgn;
    const src = NewRgn();
    SetRectRgn(src, 4, 5, 12, 13);
    SetClip(src);
    expect(port.clipRgn).toBe(clip);
    expect(clip.rgn.rgnBBox).toEqual(makeRect(5, 4, 13, 12));
    const out = NewRgn();
    const outRgn = out.rgn;
    GetClip(out);
    expect(out.rgn).toBe(outRgn);
    expect(out.rgn.rgnBBox).toEqual(clip.rgn.rgnBBox);
  });

  it("SetOrigin offsets the visRgn, not just its bbox", () => {
    const port = openPort(20, 16);
    const vis = port.visRgn;
    SetOrigin(3, 4);
    expect(port.portRect.top).toBe(4);
    expect(port.portRect.left).toBe(3);
    expect(vis.rgn.rgnBBox).toEqual(makeRect(4, 3, 20, 23));
  });

  it("SetRectRgn normalises an empty rect to (0,0,0,0)", () => {
    const rgn = NewRgn();
    SetRectRgn(rgn, 10, 10, 10, 20);
    expect(rgn.rgn.rgnBBox).toEqual(makeRect(0, 0, 0, 0));
    SetRectRgn(rgn, 2, 3, 8, 9);
    expect(rgn.rgn.rgnBBox).toEqual(makeRect(3, 2, 9, 8));
  });

  it("CopyRgn is a same-handle no-op and copies into dst.rgn", () => {
    const src = NewRgn();
    SetRectRgn(src, 1, 2, 5, 6);
    CopyRgn(src, src);
    const dst = NewRgn();
    const dstObj = dst.rgn;
    CopyRgn(src, dst);
    expect(dst.rgn).toBe(dstObj);
    expect(dst.rgn.rgnBBox).toEqual(src.rgn.rgnBBox);
  });

  it("OffsetRgn walks the region", () => {
    const rgn: RgnHandle = NewRgn();
    SetRectRgn(rgn, 0, 0, 4, 4);
    OffsetRgn(rgn, 2, 3);
    expect(rgn.rgn.rgnBBox).toEqual(makeRect(3, 2, 7, 6));
    SetEmptyRgn(rgn);
    expect(rgn.rgn.rgnBBox).toEqual(makeRect(0, 0, 0, 0));
  });
});
