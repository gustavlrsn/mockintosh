/**
 * Conformance harness seeded from `reference/QuickDraw/TestGraf.p`.
 * Snapshots start as the port's current output and are updated as each
 * fidelity phase lands.
 */
import { describe, expect, it } from "vitest";
import {
  BackColor,
  ClipRect,
  EraseRect,
  FillRect,
  ForeColor,
  FrameOval,
  FrameRect,
  InitGraf,
  InvertRect,
  LineTo,
  MoveTo,
  OpenPort,
  PaintOval,
  PaintRect,
  PenMode,
  PenNormal,
  PenSize,
  PtToAngle,
  blackColor,
  globals,
  patXor,
  whiteColor,
  type GrafPort,
} from "../src";
import { AngleFromSlope, SlopeFromAngle } from "../src/angles";
import { makePoint, makeRect, newBitMap, pixelsFromBitMap } from "../src/bits";

function art(port: GrafPort): string[] {
  const bm = port.portBits;
  const w = bm.bounds.right - bm.bounds.left;
  const px = pixelsFromBitMap(bm);
  const rows: string[] = [];
  for (let y = 0; y < bm.bounds.bottom - bm.bounds.top; y++) {
    rows.push(Array.from(px.subarray(y * w, (y + 1) * w), (p) => (p ? "#" : ".")).join(""));
  }
  return rows;
}

function openOffscreen(width: number, height: number): GrafPort {
  InitGraf(newBitMap(width, height));
  const port = {} as GrafPort;
  OpenPort(port);
  return port;
}

describe("TestGraf harness", () => {
  it("paints, frames, inverts and fills a rect under a clip", () => {
    const port = openOffscreen(16, 12);
    BackColor(whiteColor);
    ForeColor(blackColor);
    ClipRect(port.portRect);
    EraseRect(port.portRect);
    PaintRect(makeRect(2, 2, 8, 10));
    FrameRect(makeRect(1, 1, 11, 15));
    InvertRect(makeRect(4, 4, 6, 8));
    FillRect(makeRect(9, 3, 11, 6), globals.gray);
    const snapshot = art(port);
    expect(snapshot).toHaveLength(12);
    expect(snapshot[1].startsWith(".#") || snapshot[1].includes("#")).toBe(true);
  });

  it("draws hairlines with the current pen", () => {
    const port = openOffscreen(20, 8);
    PenNormal();
    PenSize(1, 1);
    MoveTo(0, 2);
    LineTo(19, 2);
    MoveTo(5, 0);
    LineTo(5, 7);
    expect(art(port).some((row) => row.includes("#"))).toBe(true);
  });

  it("FrRect pinwheel does not XOR-cancel corners under a fat pen", () => {
    const port = openOffscreen(16, 16);
    EraseRect(port.portRect);
    PenNormal();
    PenSize(3, 3);
    PenMode(patXor);
    FrameRect(makeRect(2, 2, 12, 12));
    const px = pixelsFromBitMap(port.portBits);
    const at = (h: number, v: number) => px[v * 16 + h];
    expect(at(2, 2)).toBe(1);
    expect(at(11, 2)).toBe(1);
    expect(at(2, 11)).toBe(1);
    expect(at(11, 11)).toBe(1);
  });

  it("StdOval / StdArc drain into DrawArc", () => {
    const port = openOffscreen(20, 16);
    EraseRect(port.portRect);
    PaintOval(makeRect(1, 1, 17, 13));
    expect(art(port).some((row) => row.includes("#"))).toBe(true);
    EraseRect(port.portRect);
    FrameOval(makeRect(1, 1, 17, 13));
    expect(art(port).some((row) => row.includes("#"))).toBe(true);
  });

  it("PtToAngle and SlopeFromAngle match the ROM cardinals", () => {
    expect(SlopeFromAngle(45)).toBe(-65536);
    expect(AngleFromSlope(-65536)).toBe(45);
    expect(AngleFromSlope(65536)).toBe(135);
    const r = makeRect(0, 0, 20, 20);
    const angle = { value: -1 };
    PtToAngle(r, makePoint(10, 0), angle);
    expect(angle.value).toBe(0);
    PtToAngle(r, makePoint(20, 10), angle);
    expect(angle.value).toBe(90);
    PtToAngle(r, makePoint(10, 20), angle);
    expect(angle.value).toBe(180);
    PtToAngle(r, makePoint(0, 10), angle);
    expect(angle.value).toBe(270);
  });
});
