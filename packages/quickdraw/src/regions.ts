// Region routines — from QuickDraw.p Region Calculations +
// Graphical Operations on Regions sections.
// Implements the QuickDraw scanline-compressed region format.
//
// Region encoding:
//   Rectangular region: rgnSize=10, rgnBBox set, scanlines=undefined/empty
//   Complex region: scanlines = array of { y, xs }
//     Each scanline holds sorted x-inversion points for that row.
//     A pixel (h, v) is inside if the count of xs[i] <= h is odd.

import {
  Region,
  RgnHandle,
  Rect,
  Point,
  Pattern,
  GrafPort,
  cloneRect,
} from "./types";
import { globals } from "./globals";
import { drawHSpan, drawRectToPort, pointInRegion } from "./bitblt";
import {
  patCopy,
  patXor,
  FRAME,
  PAINT,
  ERASE,
  INVERT,
  FILL,
} from "./constants";

// -------------------------------------------------------------------------
// Internal helpers
// -------------------------------------------------------------------------

function makeRgn(
  bbox: Rect,
  scanlines?: Array<{ y: number; xs: number[] }>
): RgnHandle {
  return {
    rgn: {
      rgnSize:
        scanlines && scanlines.length > 0 ? 10 + scanlines.length * 8 : 10,
      rgnBBox: cloneRect(bbox),
      scanlines,
    },
  };
}

function isRect(rgn: RgnHandle): boolean {
  return !rgn.rgn.scanlines || rgn.rgn.scanlines.length === 0;
}

// Recompute rgnBBox from scanline data
function recomputeBBox(rgn: Region): void {
  if (!rgn.scanlines || rgn.scanlines.length === 0) return;
  let top = 0x7fff;
  let bottom = -0x7fff;
  let left = 0x7fff;
  let right = -0x7fff;
  for (const sl of rgn.scanlines) {
    if (sl.xs.length === 0) continue;
    if (sl.y < top) top = sl.y;
    if (sl.y + 1 > bottom) bottom = sl.y + 1;
    if (sl.xs[0] < left) left = sl.xs[0];
    if (sl.xs[sl.xs.length - 1] > right) right = sl.xs[sl.xs.length - 1];
  }
  rgn.rgnBBox = { top, left, bottom, right };
}

// -------------------------------------------------------------------------
// NewRgn / DisposeRgn / CopyRgn
// -------------------------------------------------------------------------

// FUNCTION NewRgn: RgnHandle;
export function NewRgn(): RgnHandle {
  return {
    rgn: { rgnSize: 10, rgnBBox: { top: 0, left: 0, bottom: 0, right: 0 } },
  };
}

// PROCEDURE DisposeRgn(rgn: RgnHandle);
export function DisposeRgn(_rgn: RgnHandle): void {
  // GC handles memory in JS
}

// PROCEDURE CopyRgn(srcRgn, dstRgn: RgnHandle);
export function CopyRgn(srcRgn: RgnHandle, dstRgn: RgnHandle): void {
  dstRgn.rgn = {
    rgnSize: srcRgn.rgn.rgnSize,
    rgnBBox: cloneRect(srcRgn.rgn.rgnBBox),
    scanlines: srcRgn.rgn.scanlines
      ? srcRgn.rgn.scanlines.map((sl) => ({ y: sl.y, xs: [...sl.xs] }))
      : undefined,
  };
}

// -------------------------------------------------------------------------
// SetEmptyRgn / SetRectRgn / RectRgn
// -------------------------------------------------------------------------

// PROCEDURE SetEmptyRgn(rgn: RgnHandle);
export function SetEmptyRgn(rgn: RgnHandle): void {
  rgn.rgn.rgnSize = 10;
  rgn.rgn.rgnBBox = { top: 0, left: 0, bottom: 0, right: 0 };
  rgn.rgn.scanlines = undefined;
}

// PROCEDURE SetRectRgn(rgn: RgnHandle; left, top, right, bottom: INTEGER);
export function SetRectRgn(
  rgn: RgnHandle,
  left: number,
  top: number,
  right: number,
  bottom: number
): void {
  rgn.rgn.rgnSize = 10;
  rgn.rgn.rgnBBox = { top, left, bottom, right };
  rgn.rgn.scanlines = undefined;
}

// PROCEDURE RectRgn(rgn: RgnHandle; r: Rect);
export function RectRgn(rgn: RgnHandle, r: Rect): void {
  SetRectRgn(rgn, r.left, r.top, r.right, r.bottom);
}

// -------------------------------------------------------------------------
// OpenRgn / CloseRgn
// Used to build a complex region from drawing operations.
// During OpenRgn, line draws record inversion points.
// -------------------------------------------------------------------------

// PROCEDURE OpenRgn;
export function OpenRgn(): void {
  const port = globals.thePort;
  if (!port) return;
  // Create a new empty region handle as the accumulator
  const h = NewRgn();
  port.rgnSave = h;
  globals.rgnBuf = [];
  globals.rgnIndex = 0;
  globals.rgnMax = 0;
}

// PROCEDURE CloseRgn(dstRgn: RgnHandle);
export function CloseRgn(dstRgn: RgnHandle): void {
  const port = globals.thePort;
  if (!port) return;
  const acc = port.rgnSave;
  port.rgnSave = null;

  if (!acc) return;

  // Convert accumulated line inversion points into scanline data
  // globals.rgnBuf holds pairs [x, y] recorded by DoLine
  const scanMap = new Map<number, number[]>();
  const buf = globals.rgnBuf ?? [];
  for (let i = 0; i + 1 < buf.length; i += 2) {
    const x = buf[i];
    const y = buf[i + 1];
    if (!scanMap.has(y)) scanMap.set(y, []);
    scanMap.get(y)!.push(x);
  }

  const scanlines: Array<{ y: number; xs: number[] }> = [];
  scanMap.forEach((xs, y) => {
    // XOR: if a point appears an even number of times, remove it
    const counts = new Map<number, number>();
    for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
    const filtered: number[] = [];
    counts.forEach((cnt, x) => {
      if (cnt % 2 === 1) filtered.push(x);
    });
    filtered.sort((a, b) => a - b);
    if (filtered.length > 0) scanlines.push({ y, xs: filtered });
  });

  scanlines.sort((a, b) => a.y - b.y);
  dstRgn.rgn.scanlines = scanlines;
  recomputeBBox(dstRgn.rgn);
  globals.rgnBuf = null;
}

// -------------------------------------------------------------------------
// Geometric transformations
// -------------------------------------------------------------------------

// PROCEDURE OffsetRgn(rgn: RgnHandle; dh, dv: INTEGER);
export function OffsetRgn(rgn: RgnHandle, dh: number, dv: number): void {
  rgn.rgn.rgnBBox.top += dv;
  rgn.rgn.rgnBBox.left += dh;
  rgn.rgn.rgnBBox.bottom += dv;
  rgn.rgn.rgnBBox.right += dh;
  if (rgn.rgn.scanlines) {
    for (const sl of rgn.rgn.scanlines) {
      sl.y += dv;
      sl.xs = sl.xs.map((x) => x + dh);
    }
  }
}

// PROCEDURE InsetRgn(rgn: RgnHandle; dh, dv: INTEGER);
export function InsetRgn(rgn: RgnHandle, dh: number, dv: number): void {
  rgn.rgn.rgnBBox.top += dv;
  rgn.rgn.rgnBBox.left += dh;
  rgn.rgn.rgnBBox.bottom -= dv;
  rgn.rgn.rgnBBox.right -= dh;
  // For complex regions, remove scanlines outside new bbox
  if (rgn.rgn.scanlines) {
    rgn.rgn.scanlines = rgn.rgn.scanlines
      .filter(
        (sl) => sl.y >= rgn.rgn.rgnBBox.top && sl.y < rgn.rgn.rgnBBox.bottom
      )
      .map((sl) => ({
        y: sl.y,
        xs: sl.xs.filter(
          (x) => x >= rgn.rgn.rgnBBox.left && x <= rgn.rgn.rgnBBox.right
        ),
      }))
      .filter((sl) => sl.xs.length > 0);
  }
}

// PROCEDURE MapRgn(rgn: RgnHandle; fromRect, toRect: Rect);
export function MapRgn(rgn: RgnHandle, fromRect: Rect, toRect: Rect): void {
  const fW = fromRect.right - fromRect.left;
  const fH = fromRect.bottom - fromRect.top;
  const tW = toRect.right - toRect.left;
  const tH = toRect.bottom - toRect.top;
  const mapH = (x: number) =>
    fW !== 0 ? toRect.left + Math.round(((x - fromRect.left) * tW) / fW) : x;
  const mapV = (y: number) =>
    fH !== 0 ? toRect.top + Math.round(((y - fromRect.top) * tH) / fH) : y;

  rgn.rgn.rgnBBox = {
    top: mapV(rgn.rgn.rgnBBox.top),
    left: mapH(rgn.rgn.rgnBBox.left),
    bottom: mapV(rgn.rgn.rgnBBox.bottom),
    right: mapH(rgn.rgn.rgnBBox.right),
  };
  if (rgn.rgn.scanlines) {
    rgn.rgn.scanlines = rgn.rgn.scanlines.map((sl) => ({
      y: mapV(sl.y),
      xs: sl.xs.map(mapH),
    }));
  }
}

// -------------------------------------------------------------------------
// Region predicates
// -------------------------------------------------------------------------

// FUNCTION EqualRgn(rgnA, rgnB: RgnHandle): BOOLEAN;
export function EqualRgn(rgnA: RgnHandle, rgnB: RgnHandle): boolean {
  const a = rgnA.rgn;
  const b = rgnB.rgn;
  if (
    a.rgnBBox.top !== b.rgnBBox.top ||
    a.rgnBBox.left !== b.rgnBBox.left ||
    a.rgnBBox.bottom !== b.rgnBBox.bottom ||
    a.rgnBBox.right !== b.rgnBBox.right
  )
    return false;
  const aSL = a.scanlines ?? [];
  const bSL = b.scanlines ?? [];
  if (aSL.length !== bSL.length) return false;
  for (let i = 0; i < aSL.length; i++) {
    if (aSL[i].y !== bSL[i].y) return false;
    if (aSL[i].xs.length !== bSL[i].xs.length) return false;
    for (let j = 0; j < aSL[i].xs.length; j++) {
      if (aSL[i].xs[j] !== bSL[i].xs[j]) return false;
    }
  }
  return true;
}

// FUNCTION EmptyRgn(rgn: RgnHandle): BOOLEAN;
export function EmptyRgn(rgn: RgnHandle): boolean {
  const r = rgn.rgn.rgnBBox;
  return r.top >= r.bottom || r.left >= r.right;
}

// FUNCTION PtInRgn(pt: Point; rgn: RgnHandle): BOOLEAN;
export function PtInRgn(pt: Point, rgn: RgnHandle): boolean {
  return pointInRegion(rgn, pt.h, pt.v);
}

// FUNCTION RectInRgn(r: Rect; rgn: RgnHandle): BOOLEAN;
export function RectInRgn(r: Rect, rgn: RgnHandle): boolean {
  // Quick bounding-box check
  const b = rgn.rgn.rgnBBox;
  if (
    r.right <= b.left ||
    r.left >= b.right ||
    r.bottom <= b.top ||
    r.top >= b.bottom
  )
    return false;
  if (isRect(rgn)) return true;
  // Check if any pixel in r is inside rgn
  for (let y = r.top; y < r.bottom; y++) {
    for (let x = r.left; x < r.right; x++) {
      if (pointInRegion(rgn, x, y)) return true;
    }
  }
  return false;
}

// -------------------------------------------------------------------------
// Boolean region operations (SectRgn, UnionRgn, DiffRgn, XorRgn)
// Implemented via scanline merging using the XOR-based inversion point model.
// -------------------------------------------------------------------------

// Convert a rectangular region to scanline representation
function rgnToScanlines(rgn: RgnHandle): Map<number, number[]> {
  const map = new Map<number, number[]>();
  if (rgn.rgn.scanlines && rgn.rgn.scanlines.length > 0) {
    for (const sl of rgn.rgn.scanlines) {
      map.set(sl.y, [...sl.xs]);
    }
  } else {
    // Rectangular region — generate two inversion points per row
    const { top, left, bottom, right } = rgn.rgn.rgnBBox;
    for (let y = top; y < bottom; y++) {
      map.set(y, [left, right]);
    }
  }
  return map;
}

// Rebuild a region from a scanline map
function scanlinesToRgn(map: Map<number, number[]>): RgnHandle {
  const scanlines: Array<{ y: number; xs: number[] }> = [];
  map.forEach((xs, y) => {
    const sorted = [...xs].sort((a, b) => a - b);
    if (sorted.length > 0 && sorted.length % 2 === 0) {
      scanlines.push({ y, xs: sorted });
    }
  });
  scanlines.sort((a, b) => a.y - b.y);
  const handle: RgnHandle = {
    rgn: { rgnSize: 10, rgnBBox: { top: 0, left: 0, bottom: 0, right: 0 } },
  };
  handle.rgn.scanlines = scanlines;
  recomputeBBox(handle.rgn);
  // If scanlines exactly describe a rectangle, clear them
  const b = handle.rgn.rgnBBox;
  let isRectResult = true;
  for (const sl of scanlines) {
    if (sl.xs.length !== 2 || sl.xs[0] !== b.left || sl.xs[1] !== b.right) {
      isRectResult = false;
      break;
    }
  }
  if (isRectResult && scanlines.length === b.bottom - b.top) {
    handle.rgn.scanlines = undefined;
  }
  return handle;
}

// XOR-merge two inversion point lists (union of odd-parity sets)
function xorInvPoints(a: number[], b: number[]): number[] {
  const counts = new Map<number, number>();
  for (const x of [...a, ...b]) counts.set(x, (counts.get(x) ?? 0) + 1);
  const result: number[] = [];
  counts.forEach((cnt, x) => {
    if (cnt % 2 === 1) result.push(x);
  });
  return result.sort((a, b) => a - b);
}

// Intersect two inversion point lists (AND of coverage)
function andInvPoints(aXs: number[], bXs: number[]): number[] {
  // Convert both to coverage ranges, intersect, convert back
  function toRanges(xs: number[]): Array<[number, number]> {
    const ranges: Array<[number, number]> = [];
    for (let i = 0; i + 1 < xs.length; i += 2) ranges.push([xs[i], xs[i + 1]]);
    return ranges;
  }
  const aRanges = toRanges(aXs);
  const bRanges = toRanges(bXs);
  const result: number[] = [];
  for (const [a0, a1] of aRanges) {
    for (const [b0, b1] of bRanges) {
      const lo = Math.max(a0, b0);
      const hi = Math.min(a1, b1);
      if (lo < hi) {
        result.push(lo);
        result.push(hi);
      }
    }
  }
  return result.sort((a, b) => a - b);
}

// Subtract bXs coverage from aXs coverage
function diffInvPoints(aXs: number[], bXs: number[]): number[] {
  function toRanges(xs: number[]): Array<[number, number]> {
    const ranges: Array<[number, number]> = [];
    for (let i = 0; i + 1 < xs.length; i += 2) ranges.push([xs[i], xs[i + 1]]);
    return ranges;
  }
  const aRanges = toRanges(aXs);
  const bRanges = toRanges(bXs);
  const result: number[] = [];
  for (const [a0, a1] of aRanges) {
    let cur = a0;
    for (const [b0, b1] of bRanges) {
      if (b0 >= a1) break;
      if (b1 <= cur) continue;
      if (b0 > cur) {
        result.push(cur);
        result.push(b0);
      }
      cur = Math.max(cur, b1);
    }
    if (cur < a1) {
      result.push(cur);
      result.push(a1);
    }
  }
  return result;
}

// PROCEDURE SectRgn(srcRgnA, srcRgnB, dstRgn: RgnHandle);
export function SectRgn(
  srcRgnA: RgnHandle,
  srcRgnB: RgnHandle,
  dstRgn: RgnHandle
): void {
  const aMap = rgnToScanlines(srcRgnA);
  const bMap = rgnToScanlines(srcRgnB);
  const result = new Map<number, number[]>();
  aMap.forEach((aXs, y) => {
    const bXs = bMap.get(y);
    if (!bXs) return;
    const xs = andInvPoints(aXs, bXs);
    if (xs.length > 0) result.set(y, xs);
  });
  const h = scanlinesToRgn(result);
  CopyRgn(h, dstRgn);
}

// PROCEDURE UnionRgn(srcRgnA, srcRgnB, dstRgn: RgnHandle);
export function UnionRgn(
  srcRgnA: RgnHandle,
  srcRgnB: RgnHandle,
  dstRgn: RgnHandle
): void {
  const aMap = rgnToScanlines(srcRgnA);
  const bMap = rgnToScanlines(srcRgnB);

  // Collect all rows
  const allYs = new Set<number>([...aMap.keys(), ...bMap.keys()]);
  const result = new Map<number, number[]>();
  allYs.forEach((y) => {
    const aXs = aMap.get(y) ?? [];
    const bXs = bMap.get(y) ?? [];
    // Union = XOR of the two inversion point lists, then collapse
    const xs = unionInvPoints(aXs, bXs);
    if (xs.length > 0) result.set(y, xs);
  });
  const h = scanlinesToRgn(result);
  CopyRgn(h, dstRgn);
}

function unionInvPoints(aXs: number[], bXs: number[]): number[] {
  // Union of two coverage sets (result is ranges in A or B)
  function toRanges(xs: number[]): Array<[number, number]> {
    const r: Array<[number, number]> = [];
    for (let i = 0; i + 1 < xs.length; i += 2) r.push([xs[i], xs[i + 1]]);
    return r;
  }
  // Merge all ranges
  const all = [...toRanges(aXs), ...toRanges(bXs)].sort((a, b) => a[0] - b[0]);
  if (all.length === 0) return [];
  const merged: Array<[number, number]> = [all[0]];
  for (let i = 1; i < all.length; i++) {
    const top = merged[merged.length - 1];
    if (all[i][0] <= top[1]) top[1] = Math.max(top[1], all[i][1]);
    else merged.push(all[i]);
  }
  const result: number[] = [];
  for (const [a, b] of merged) {
    result.push(a);
    result.push(b);
  }
  return result;
}

// PROCEDURE DiffRgn(srcRgnA, srcRgnB, dstRgn: RgnHandle);
export function DiffRgn(
  srcRgnA: RgnHandle,
  srcRgnB: RgnHandle,
  dstRgn: RgnHandle
): void {
  const aMap = rgnToScanlines(srcRgnA);
  const bMap = rgnToScanlines(srcRgnB);
  const result = new Map<number, number[]>();
  aMap.forEach((aXs, y) => {
    const bXs = bMap.get(y);
    const xs = bXs ? diffInvPoints(aXs, bXs) : [...aXs];
    if (xs.length > 0) result.set(y, xs);
  });
  const h = scanlinesToRgn(result);
  CopyRgn(h, dstRgn);
}

// PROCEDURE XorRgn(srcRgnA, srcRgnB, dstRgn: RgnHandle);
export function XorRgn(
  srcRgnA: RgnHandle,
  srcRgnB: RgnHandle,
  dstRgn: RgnHandle
): void {
  const aMap = rgnToScanlines(srcRgnA);
  const bMap = rgnToScanlines(srcRgnB);
  const allYs = new Set<number>([...aMap.keys(), ...bMap.keys()]);
  const result = new Map<number, number[]>();
  allYs.forEach((y) => {
    const aXs = aMap.get(y) ?? [];
    const bXs = bMap.get(y) ?? [];
    const xs = xorInvPoints(aXs, bXs);
    if (xs.length > 0) result.set(y, xs);
  });
  const h = scanlinesToRgn(result);
  CopyRgn(h, dstRgn);
}

// -------------------------------------------------------------------------
// Graphical operations on regions
// -------------------------------------------------------------------------

function drawRegion(verb: number, rgn: RgnHandle, fillPat?: Pattern): void {
  const port = globals.thePort;
  if (!port) return;
  if (port.grafProcs && port.grafProcs.rgnProc) {
    if (fillPat) port.fillPat = new Uint8Array(fillPat);
    port.grafProcs.rgnProc(verb as any, rgn);
    return;
  }
  StdRgn(verb, rgn, fillPat);
}

export function StdRgn(verb: number, rgn: RgnHandle, fillPat?: Pattern): void {
  const port = globals.thePort;
  if (!port) return;

  let pat: Pattern;
  let mode: number;
  switch (verb) {
    case FRAME:
      pat = port.pnPat;
      mode = port.pnMode;
      break;
    case PAINT:
      pat = port.pnPat;
      mode = port.pnMode;
      break;
    case ERASE:
      pat = port.bkPat;
      mode = patCopy;
      break;
    case INVERT:
      pat = globals.black;
      mode = patXor;
      break;
    case FILL:
      pat = fillPat ?? port.fillPat;
      mode = patCopy;
      break;
    default:
      pat = port.pnPat;
      mode = port.pnMode;
  }

  const r = rgn.rgn;

  if (verb === FRAME) {
    // Frame: draw outline pixels (edge pixels only)
    // For rectangular regions, use rect framing
    if (isRect(rgn)) {
      const pw = Math.max(1, port.pnSize.h);
      const ph = Math.max(1, port.pnSize.v);
      const b = r.rgnBBox;
      drawRectToPort(
        b.left,
        b.top,
        b.right,
        b.top + ph,
        port.pnPat,
        port.pnMode,
        port
      );
      drawRectToPort(
        b.left,
        b.bottom - ph,
        b.right,
        b.bottom,
        port.pnPat,
        port.pnMode,
        port
      );
      drawRectToPort(
        b.left,
        b.top + ph,
        b.left + pw,
        b.bottom - ph,
        port.pnPat,
        port.pnMode,
        port
      );
      drawRectToPort(
        b.right - pw,
        b.top + ph,
        b.right,
        b.bottom - ph,
        port.pnPat,
        port.pnMode,
        port
      );
      return;
    }
    // Complex region framing: pixel is on the frame if it's inside the region
    // but at least one of its 4-neighbours is outside.
    const b = r.rgnBBox;
    for (let y = b.top; y < b.bottom; y++) {
      for (let x = b.left; x < b.right; x++) {
        if (!pointInRegion(rgn, x, y)) continue;
        const edge =
          !pointInRegion(rgn, x - 1, y) ||
          !pointInRegion(rgn, x + 1, y) ||
          !pointInRegion(rgn, x, y - 1) ||
          !pointInRegion(rgn, x, y + 1);
        if (edge) drawHSpan(x, x + 1, y, pat, mode, port);
      }
    }
    return;
  }

  // Paint/Erase/Invert/Fill: scanline fill
  if (isRect(rgn)) {
    const b = r.rgnBBox;
    drawRectToPort(b.left, b.top, b.right, b.bottom, pat, mode, port);
    return;
  }

  if (!r.scanlines) return;
  for (const sl of r.scanlines) {
    for (let i = 0; i + 1 < sl.xs.length; i += 2) {
      drawHSpan(sl.xs[i], sl.xs[i + 1], sl.y, pat, mode, port);
    }
  }
}

// PROCEDURE FrameRgn(rgn: RgnHandle);
export function FrameRgn(rgn: RgnHandle): void {
  drawRegion(FRAME, rgn);
}
// PROCEDURE PaintRgn(rgn: RgnHandle);
export function PaintRgn(rgn: RgnHandle): void {
  drawRegion(PAINT, rgn);
}
// PROCEDURE EraseRgn(rgn: RgnHandle);
export function EraseRgn(rgn: RgnHandle): void {
  drawRegion(ERASE, rgn);
}
// PROCEDURE InvertRgn(rgn: RgnHandle);
export function InvertRgn(rgn: RgnHandle): void {
  drawRegion(INVERT, rgn);
}
// PROCEDURE FillRgn(rgn: RgnHandle; pat: Pattern);
export function FillRgn(rgn: RgnHandle, pat: Pattern): void {
  drawRegion(FILL, rgn, pat);
}
