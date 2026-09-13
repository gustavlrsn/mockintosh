/**
 * Region calculations — `QuickDraw.p` / `Regions.a`, on the packed
 * XOR-delta encoding (`PackRgn.a`).
 */

import { Region, RgnHandle, Rect, Point, Pattern, cloneRect } from "./types";
import { globals, requirePort } from "./globals";
import { asInt16 } from "./fixmath";
import { HidePen, ShowPen } from "./lines";
import { MapPt } from "./points";
import { EmptyRect, EqualRect, MapRect, OffsetRect, PushVerb } from "./rects";
import { ERASE, FILL, FRAME, INVERT, PAINT } from "./constants";
import { RgnBlt } from "./rgnBlt";
import {
  cloneRegionInto,
  emptyRegion,
  ptInPacked,
  rectRegion,
} from "./regionData";
import { rgnByteSize } from "./regionData";
import { isRectRgn } from "./regionTypes";
import { CullPoints, SortPoints } from "./sortPoints";
import { PackRgn } from "./packRgn";
import { PutRgn } from "./putRgn";
import { CheckPic, PutPicByte, PutPicRgn, PutPicVerb } from "./picSave";
import { InitRgn, SeekRgn, type RGNREC } from "./seekRgn";
import { RgnOp } from "./rgnOp";

const OP_SECT = 0;
const OP_DIFF = 2;
const OP_UNION = 4;
const OP_XOR = 6;
const OP_INSET = 8;

function handleFrom(rgn: Region): RgnHandle {
  return { rgn };
}

export function NewRgn(): RgnHandle {
  return handleFrom(emptyRegion());
}

export function DisposeRgn(_rgn: RgnHandle): void {}

export function CopyRgn(srcRgn: RgnHandle, dstRgn: RgnHandle): void {
  if (srcRgn === dstRgn) return;
  cloneRegionInto(srcRgn.rgn, dstRgn.rgn);
}

export function SetEmptyRgn(rgn: RgnHandle): void {
  cloneRegionInto(emptyRegion(), rgn.rgn);
}

export function SetRectRgn(
  rgn: RgnHandle,
  left: number,
  top: number,
  right: number,
  bottom: number
): void {
  cloneRegionInto(rectRegion({ top, left, bottom, right }), rgn.rgn);
}

export function RectRgn(rgn: RgnHandle, r: Rect): void {
  SetRectRgn(rgn, r.left, r.top, r.right, r.bottom);
}

/** `PROCEDURE OpenRgn` — flag, new point buffer, HidePen (`Regions.a:266-286`). */
export function OpenRgn(): void {
  const port = requirePort();
  port.rgnSave = true;
  globals.rgnBuf = [];
  globals.rgnIndex = 0;
  globals.rgnMax = 0;
  HidePen();
}

/** `PROCEDURE CloseRgn` — ShowPen, Sort/Cull/Pack (`Regions.a:289-329`). */
export function CloseRgn(dstRgn: RgnHandle): void {
  const port = requirePort();
  if (!port.rgnSave) return;
  port.rgnSave = false;
  ShowPen();
  const pts = globals.rgnBuf ?? [];
  SortPoints(pts, pts.length);
  const n = CullPoints(pts, pts.length);
  PackRgn(pts, n, dstRgn.rgn);
  globals.rgnBuf = null;
}

/** `PROCEDURE OffsetRgn` — walk the stream (`Regions.a:440-479`). */
export function OffsetRgn(rgn: RgnHandle, dh: number, dv: number): void {
  OffsetRect(rgn.rgn.rgnBBox, dh, dv);
  if (isRectRgn(rgn.rgn)) return;
  const data = rgn.rgn.data;
  let i = 0;
  while (i < data.length) {
    if (data[i] === 32767) break;
    data[i] = (data[i] + dv) | 0;
    i++;
    while (i < data.length && data[i] !== 32767) {
      data[i] = (data[i] + dh) | 0;
      i++;
    }
    if (i < data.length && data[i] === 32767) i++;
  }
}

/**
 * `PROCEDURE InsetRgn` (`Regions.a:483-595`): rect → InsetRect;
 * complex → two HINSET passes with V/H swap.
 */
export function InsetRgn(rgn: RgnHandle, dh: number, dv: number): void {
  if (dh === 0 && dv === 0) return;
  if (isRectRgn(rgn.rgn)) {
    const b = rgn.rgn.rgnBBox;
    b.top += dv;
    b.left += dh;
    b.bottom -= dv;
    b.right -= dh;
    if (b.left >= b.right || b.top >= b.bottom) SetEmptyRgn(rgn);
    return;
  }
  hinset(rgn.rgn, dh);
  swapVH(rgn.rgn);
  hinset(rgn.rgn, dv);
  swapVH(rgn.rgn);
}

function hinset(rgn: Region, dh: number): void {
  const pts: Point[] = [];
  const n = RgnOp(rgn, rgn, pts, 4096, OP_INSET, dh, true);
  SortPoints(pts, n);
  PackRgn(pts, n, rgn);
}

function swapVH(rgn: Region): void {
  const tmp = rgn.rgnBBox.top;
  rgn.rgnBBox.top = rgn.rgnBBox.left;
  rgn.rgnBBox.left = tmp;
  const tmp2 = rgn.rgnBBox.bottom;
  rgn.rgnBBox.bottom = rgn.rgnBBox.right;
  rgn.rgnBBox.right = tmp2;
  if (isRectRgn(rgn)) return;
  const pts: Point[] = [];
  PutRgn(rgn, pts);
  for (const p of pts) {
    const h = p.h;
    p.h = p.v;
    p.v = h;
  }
  SortPoints(pts, pts.length);
  PackRgn(pts, pts.length, rgn);
}

/** `PROCEDURE MapRgn` (`Regions.a:1076-1165`). */
export function MapRgn(rgn: RgnHandle, fromRect: Rect, toRect: Rect): void {
  if (EqualRect(fromRect, toRect)) return;
  if (isRectRgn(rgn.rgn)) {
    MapRect(rgn.rgn.rgnBBox, fromRect, toRect);
    return;
  }
  const pts: Point[] = [];
  PutRgn(rgn.rgn, pts);
  for (const p of pts) MapPt(p, fromRect, toRect);
  SortPoints(pts, pts.length);
  const n = CullPoints(pts, pts.length);
  PackRgn(pts, n, rgn.rgn);
}

export function EmptyRgn(rgn: RgnHandle): boolean {
  return EmptyRect(rgn.rgn.rgnBBox);
}

/** Byte compare of canonical form (`Regions.a:613-645`). */
export function EqualRgn(rgnA: RgnHandle, rgnB: RgnHandle): boolean {
  if (rgnA.rgn.rgnSize !== rgnB.rgn.rgnSize) return false;
  if (!EqualRect(rgnA.rgn.rgnBBox, rgnB.rgn.rgnBBox)) return false;
  if (rgnA.rgn.data.length !== rgnB.rgn.data.length) return false;
  for (let i = 0; i < rgnA.rgn.data.length; i++) {
    if (rgnA.rgn.data[i] !== rgnB.rgn.data[i]) return false;
  }
  return true;
}

function makeSeek(rgn: Region, minH: number, maxH: number): RGNREC {
  const state = {
    rgnPtr: rgn,
    dataPtr: 0,
    scanBuf: new Uint16Array(0),
    scanSize: 0,
    thisV: 0,
    nextV: 0,
    minH: 0,
    maxH: 0,
    leftH: 0,
  };
  InitRgn(rgn, state, minH, maxH, minH);
  return state;
}

function scanHasInk(state: RGNREC): boolean {
  for (let i = 0; i < state.scanBuf.length; i++) if (state.scanBuf[i]) return true;
  return false;
}

export function PtInRgn(pt: Point, rgn: RgnHandle): boolean {
  return ptInPacked(rgn.rgn, pt);
}

/** `RectInRgn` via SeekRgn (`Regions.a:907-1002`). */
export function RectInRgn(r: Rect, rgn: RgnHandle): boolean {
  const b = rgn.rgn.rgnBBox;
  if (r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom) {
    return false;
  }
  if (isRectRgn(rgn.rgn)) return true;
  const state = makeSeek(rgn.rgn, r.left, r.right);
  for (let v = r.top; v < r.bottom; v++) {
    SeekRgn(state, v);
    if (scanHasInk(state)) return true;
  }
  return false;
}

function doRgnOp(srcA: RgnHandle, srcB: RgnHandle, dst: RgnHandle, op: number): void {
  const a = srcA.rgn;
  const b = srcB.rgn;
  if (EqualRgn(srcA, srcB)) {
    if (op === OP_SECT || op === OP_UNION) CopyRgn(srcA, dst);
    else SetEmptyRgn(dst);
    return;
  }
  if (op === OP_DIFF && EmptyRgn(srcB)) {
    CopyRgn(srcA, dst);
    return;
  }
  if (op === OP_SECT || op === OP_DIFF) {
    const t: Rect = { top: 0, left: 0, bottom: 0, right: 0 };
    t.top = Math.max(a.rgnBBox.top, b.rgnBBox.top);
    t.left = Math.max(a.rgnBBox.left, b.rgnBBox.left);
    t.bottom = Math.min(a.rgnBBox.bottom, b.rgnBBox.bottom);
    t.right = Math.min(a.rgnBBox.right, b.rgnBBox.right);
    if (t.top >= t.bottom || t.left >= t.right) {
      if (op === OP_SECT) SetEmptyRgn(dst);
      else CopyRgn(srcA, dst);
      return;
    }
    if (op === OP_SECT && isRectRgn(a) && isRectRgn(b)) {
      RectRgn(dst, t);
      return;
    }
  }
  if (op === OP_UNION || op === OP_XOR) {
    if (EmptyRgn(srcB)) {
      CopyRgn(srcA, dst);
      return;
    }
    if (EmptyRgn(srcA)) {
      CopyRgn(srcB, dst);
      return;
    }
  }
  const pts: Point[] = [];
  const n = RgnOp(a, b, pts, 4096, op, 0, true);
  PackRgn(pts, n, dst.rgn);
}

export function SectRgn(srcA: RgnHandle, srcB: RgnHandle, dst: RgnHandle): void {
  doRgnOp(srcA, srcB, dst, OP_SECT);
}

export function UnionRgn(srcA: RgnHandle, srcB: RgnHandle, dst: RgnHandle): void {
  doRgnOp(srcA, srcB, dst, OP_UNION);
}

export function DiffRgn(srcA: RgnHandle, srcB: RgnHandle, dst: RgnHandle): void {
  doRgnOp(srcA, srcB, dst, OP_DIFF);
}

export function XorRgn(srcA: RgnHandle, srcB: RgnHandle, dst: RgnHandle): void {
  doRgnOp(srcA, srcB, dst, OP_XOR);
}

/**
 * `PROCEDURE DrawRgn(rgn, mode, pat)` (`Regions.a:146-174`).
 * Quits if `pnVis < 0`. Blits portBits through clip / vis / rgn.
 */
export function DrawRgn(rgn: RgnHandle, mode: number, pat: Pattern): void {
  const port = requirePort();
  if (asInt16(port.pnVis) < 0) return;
  RgnBlt(
    port.portBits,
    port.portBits,
    port.portBits.bounds,
    port.portBits.bounds,
    mode,
    pat,
    port.clipRgn,
    port.visRgn,
    rgn
  );
}

/**
 * `PROCEDURE FrRgn(rgn, mode, pat)` (`Regions.a:178-228`).
 * CopyRgn → InsetRgn(pnSize) → DiffRgn → DrawRgn. Rectangular FrRect
 * fast path omitted (same pixels; would ignore the passed mode/pat).
 */
export function FrRgn(rgn: RgnHandle, mode: number, pat: Pattern): void {
  const port = requirePort();
  if (asInt16(port.pnVis) < 0) return;
  const temp = NewRgn();
  CopyRgn(rgn, temp);
  InsetRgn(temp, port.pnSize.h, port.pnSize.v);
  DiffRgn(rgn, temp, temp);
  DrawRgn(temp, mode, pat);
}

function drawRegion(verb: number, rgn: RgnHandle, fillPat?: Pattern): void {
  const port = requirePort();
  if (fillPat) port.fillPat = new Uint8Array(fillPat);
  if (port.grafProcs?.rgnProc) {
    port.grafProcs.rgnProc(verb as 0 | 1 | 2 | 3 | 4, rgn);
    return;
  }
  StdRgn(verb, rgn);
}

/** `PROCEDURE StdRgn(verb, rgn)` (`Regions.a:18-63`). */
export function StdRgn(verb: number, rgn: RgnHandle, fillPat?: Pattern): void {
  const port = requirePort();
  if (fillPat) port.fillPat = new Uint8Array(fillPat);
  if (CheckPic()) {
    PutPicVerb(verb);
    PutPicByte(0x80 + verb);
    PutPicRgn(rgn);
  }
  const { mode, pat } = PushVerb(verb);
  if (verb === FRAME) {
    if (port.rgnSave) {
      if (!globals.rgnBuf) globals.rgnBuf = [];
      PutRgn(rgn.rgn, globals.rgnBuf);
    }
    FrRgn(rgn, mode, pat);
  } else {
    DrawRgn(rgn, mode, pat);
  }
}

export function FrameRgn(rgn: RgnHandle): void {
  drawRegion(FRAME, rgn);
}
export function PaintRgn(rgn: RgnHandle): void {
  drawRegion(PAINT, rgn);
}
export function EraseRgn(rgn: RgnHandle): void {
  drawRegion(ERASE, rgn);
}
export function InvertRgn(rgn: RgnHandle): void {
  drawRegion(INVERT, rgn);
}
export function FillRgn(rgn: RgnHandle, pat: Pattern): void {
  drawRegion(FILL, rgn, pat);
}

export { isRectRgn, rgnByteSize };
