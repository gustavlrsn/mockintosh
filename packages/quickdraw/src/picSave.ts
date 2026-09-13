/**
 * Picture-recording writers — `Pictures.a` CheckPic / PutPic* / StdPutPic /
 * StdComment. No drawing imports (avoids a cycle with Std*).
 */
import type {
  Pattern,
  PicHandle,
  Point,
  PolyHandle,
  Rect,
  RgnHandle,
} from "./types";
import { cloneRect } from "./types";
import { requirePort } from "./globals";
import { asInt16 } from "./fixmath";
import { cloneRegionInto, emptyRegion } from "./regionData";
import { ERASE, FILL, FRAME, INVERT, PAINT } from "./constants";

function save(): NonNullable<ReturnType<typeof requirePort>["picSave"]> | null {
  return requirePort().picSave;
}

function patsEqual(a: Pattern, b: Pattern): boolean {
  for (let i = 0; i < 8; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return false;
  return true;
}

function ptsEqual(a: Point, b: Point): boolean {
  return asInt16(a.h) === asInt16(b.h) && asInt16(a.v) === asInt16(b.v);
}

function rectsEqual(a: Rect, b: Rect): boolean {
  return (
    asInt16(a.top) === asInt16(b.top) &&
    asInt16(a.left) === asInt16(b.left) &&
    asInt16(a.bottom) === asInt16(b.bottom) &&
    asInt16(a.right) === asInt16(b.right)
  );
}

function rgnsEqual(a: RgnHandle, b: RgnHandle): boolean {
  if (a.rgn.rgnSize !== b.rgn.rgnSize) return false;
  if (!rectsEqual(a.rgn.rgnBBox, b.rgn.rgnBBox)) return false;
  if (a.rgn.data.length !== b.rgn.data.length) return false;
  for (let i = 0; i < a.rgn.data.length; i++) {
    if (a.rgn.data[i] !== b.rgn.data[i]) return false;
  }
  return true;
}

/**
 * `PROCEDURE StdPutPic` (`Pictures.a:93-160`).
 * Appends bytes; `picSize` is the live low word of the index (`10 + data`).
 */
export function StdPutPic(dataPtr: number[], byteCount: number): void {
  const s = save();
  if (!s) return;
  if (s.picIndex === 0) return; // dead picture
  const h = s.thePic;
  const n = byteCount | 0;
  for (let i = 0; i < n; i++) h.pic._data.push((dataPtr[i] ?? 0) & 0xff);
  s.picIndex += n;
  h.pic.picSize = s.picIndex | 0;
  if (s.picIndex > s.picMax) s.picMax = s.picIndex + 256;
}

function emit(bytes: ArrayLike<number>): void {
  const port = requirePort();
  const proc = port.grafProcs?.putPicProc ?? StdPutPic;
  const arr: number[] = [];
  for (let i = 0; i < bytes.length; i++) arr.push(bytes[i]! & 0xff);
  proc(arr, arr.length);
}

export function PutPicByte(b: number): void {
  emit([(b | 0) & 0xff]);
}

export function PutPicWord(w: number): void {
  const v = asInt16(w);
  emit([(v >> 8) & 0xff, v & 0xff]);
}

export function PutPicLong(l: number): void {
  const x = l | 0;
  PutPicWord((x >> 16) & 0xffff);
  PutPicWord(x & 0xffff);
}

export function PutPicData(data: ArrayLike<number>): void {
  emit(data);
}

export function PutPicPat(pat: Pattern): void {
  emit(pat);
}

export function DPutPicByte(op: number): void {
  PutPicByte(op);
}

function putPoint(pt: Point): void {
  PutPicWord(pt.v);
  PutPicWord(pt.h);
}

/** `PROCEDURE PutPicRect(opCode, r)` (`Pictures.a:1402-1437`). Same rect → opcode+8. */
export function PutPicRect(opCode: number, r: Rect): void {
  const s = save();
  if (!s) return;
  if (rectsEqual(r, s.picTheRect)) {
    DPutPicByte(opCode + 8);
    return;
  }
  s.picTheRect = cloneRect(r);
  DPutPicByte(opCode);
  PutPicWord(r.top);
  PutPicWord(r.left);
  PutPicWord(r.bottom);
  PutPicWord(r.right);
}

/** `PROCEDURE PutPicRgn` (`Pictures.a:1441-1458`) — rgnSize bytes of the record. */
export function PutPicRgn(rgn: RgnHandle): void {
  const size = rgn.rgn.rgnSize | 0;
  const out = new Uint8Array(Math.max(10, size));
  const b = rgn.rgn.rgnBBox;
  out[0] = (size >> 8) & 0xff;
  out[1] = size & 0xff;
  const words = [b.top, b.left, b.bottom, b.right];
  for (let i = 0; i < 4; i++) {
    const w = asInt16(words[i]!);
    out[2 + i * 2] = (w >> 8) & 0xff;
    out[3 + i * 2] = w & 0xff;
  }
  for (let i = 0; i < rgn.rgn.data.length && 10 + i * 2 + 1 < out.length; i++) {
    const w = asInt16(rgn.rgn.data[i]!);
    out[10 + i * 2] = (w >> 8) & 0xff;
    out[11 + i * 2] = w & 0xff;
  }
  PutPicData(out.subarray(0, size));
}

/** Same writer used for a polygon handle (`Polygons.a:43-44`). */
export function PutPicPoly(poly: PolyHandle): void {
  const p = poly.poly;
  const size = p.polySize | 0;
  const out = new Uint8Array(Math.max(10, size));
  out[0] = (size >> 8) & 0xff;
  out[1] = size & 0xff;
  const b = p.polyBBox;
  const header = [b.top, b.left, b.bottom, b.right];
  for (let i = 0; i < 4; i++) {
    const w = asInt16(header[i]!);
    out[2 + i * 2] = (w >> 8) & 0xff;
    out[3 + i * 2] = w & 0xff;
  }
  const n = Math.max(0, (size - 10) >> 2);
  for (let i = 0; i < n; i++) {
    const pt = p.polyPoints[i] ?? { v: 0, h: 0 };
    const v = asInt16(pt.v);
    const h = asInt16(pt.h);
    out[10 + i * 4] = (v >> 8) & 0xff;
    out[11 + i * 4] = v & 0xff;
    out[12 + i * 4] = (h >> 8) & 0xff;
    out[13 + i * 4] = h & 0xff;
  }
  PutPicData(out.subarray(0, size));
}

/** `PROCEDURE PutPicVerb` (`Pictures.a:1462-1552`). */
export function PutPicVerb(verb: number): void {
  const port = requirePort();
  const s = save();
  if (!s) return;
  if (verb === INVERT) return;
  if (verb === FILL) {
    if (patsEqual(port.fillPat, s.picFillPat)) return;
    s.picFillPat = new Uint8Array(port.fillPat);
    DPutPicByte(0x0a);
    PutPicPat(port.fillPat);
    return;
  }
  if (verb === ERASE) {
    if (patsEqual(port.bkPat, s.picBkPat)) return;
    s.picBkPat = new Uint8Array(port.bkPat);
    DPutPicByte(0x02);
    PutPicPat(port.bkPat);
    return;
  }
  if (verb === FRAME) {
    const sz = (asInt16(port.pnSize.v) << 16) | (asInt16(port.pnSize.h) & 0xffff);
    const old = (asInt16(s.picPnSize.v) << 16) | (asInt16(s.picPnSize.h) & 0xffff);
    if (sz !== old) {
      DPutPicByte(0x07);
      putPoint(port.pnSize);
      s.picPnSize = { h: port.pnSize.h, v: port.pnSize.v };
    }
  }
  if (verb === FRAME || verb === PAINT) {
    if (asInt16(port.pnMode) !== asInt16(s.picPnMode)) {
      DPutPicByte(0x08);
      PutPicWord(port.pnMode);
      s.picPnMode = port.pnMode;
    }
    if (!patsEqual(port.pnPat, s.picPnPat)) {
      s.picPnPat = new Uint8Array(port.pnPat);
      DPutPicByte(0x09);
      PutPicPat(port.pnPat);
    }
  }
}

/**
 * `PROCEDURE CheckPic` (`Pictures.a:1556-1653`).
 * True when `picSave` is set and `pnVis ≥ −1`.
 */
export function CheckPic(): boolean {
  const port = requirePort();
  const s = port.picSave;
  if (!s) return false;
  if (asInt16(port.pnVis) < -1) return false;

  if ((port.fgColor | 0) !== (s.picFgColor | 0)) {
    DPutPicByte(0x0e);
    PutPicLong(port.fgColor);
    s.picFgColor = port.fgColor | 0;
  }
  if ((port.bkColor | 0) !== (s.picBkColor | 0)) {
    DPutPicByte(0x0f);
    PutPicLong(port.bkColor);
    s.picBkColor = port.bkColor | 0;
  }

  const originH = asInt16(port.portRect.left);
  const originV = asInt16(port.portRect.top);
  if (originH !== asInt16(s.picOrigin.h) || originV !== asInt16(s.picOrigin.v)) {
    const dh = asInt16(originH - asInt16(s.picOrigin.h));
    const dv = asInt16(originV - asInt16(s.picOrigin.v));
    s.picOrigin = { h: originH, v: originV };
    DPutPicByte(0x0c);
    PutPicWord(dh);
    PutPicWord(dv);
  }

  if (!rgnsEqual(port.clipRgn, s.picClipRgn)) {
    DPutPicByte(0x01);
    PutPicRgn(port.clipRgn);
    cloneRegionInto(port.clipRgn.rgn, s.picClipRgn.rgn);
  }
  return true;
}

/**
 * `PROCEDURE StdComment` (`Pictures.a:16-64`). Records when `picSave` is
 * set; does not call CheckPic and ignores `pnVis`.
 */
export function StdComment(
  kind: number,
  dataSize: number,
  dataHandle: number[] | null
): void {
  if (!requirePort().picSave) return;
  if (dataSize <= 0) {
    PutPicByte(0xa0);
    PutPicWord(kind);
    return;
  }
  PutPicByte(0xa1);
  PutPicWord(kind);
  PutPicWord(dataSize);
  if (dataHandle) PutPicData(dataHandle.slice(0, dataSize));
}

export function freshClipRgn(): RgnHandle {
  return { rgn: emptyRegion() };
}

export { ptsEqual };
