/**
 * Polygon routines — `Polygons.a`.
 *
 * FRAME → `FrPoly` (`MoveTo` first point, `DoLine` the rest, pen stays).
 * Other verbs → `RSect` of bbox/vis/clip, then `DrawPoly` =
 * `OpenRgn; FrPoly; DoLine(p0); CloseRgn; DrawRgn`.
 */

import type { Pattern, Point, PolyHandle, Polygon, Rect } from "./types";
import { globals, requirePort } from "./globals";
import { asInt16 } from "./fixmath";
import { DoLine, HidePen, MoveTo, ShowPen } from "./lines";
import { EmptyRect, MapRect, OffsetRect, PushVerb } from "./rects";
import { MapPt } from "./points";
import { CloseRgn, DrawRgn, NewRgn, OpenRgn } from "./regions";
import { rsect } from "./bitBltCore";
import { ERASE, FILL, FRAME, INVERT, PAINT } from "./constants";
import { CheckPic, PutPicByte, PutPicPoly, PutPicVerb } from "./picSave";

export function OpenPoly(): PolyHandle {
  const port = requirePort();
  HidePen();
  const poly: Polygon = {
    polySize: 10,
    polyBBox: { top: 0, left: 0, bottom: 0, right: 0 },
    polyPoints: [],
  };
  const handle: PolyHandle = { poly };
  globals.thePoly = handle;
  port.polySave = true;
  return handle;
}

export function ClosePoly(): void {
  const port = requirePort();
  const h = globals.thePoly;
  if (!h) return;
  if (h.poly.polyPoints.length > 0) {
    let minH = Infinity,
      maxH = -Infinity,
      minV = Infinity,
      maxV = -Infinity;
    for (const p of h.poly.polyPoints) {
      if (p.h < minH) minH = p.h;
      if (p.h > maxH) maxH = p.h;
      if (p.v < minV) minV = p.v;
      if (p.v > maxV) maxV = p.v;
    }
    h.poly.polyBBox = {
      top: minV,
      left: minH,
      bottom: maxV,
      right: maxH,
    };
    h.poly.polySize = 10 + 4 * h.poly.polyPoints.length;
  }
  port.polySave = false;
  globals.thePoly = null;
  ShowPen();
}

export function KillPoly(_poly: PolyHandle): void {}

export function OffsetPoly(poly: PolyHandle, dh: number, dv: number): void {
  OffsetRect(poly.poly.polyBBox, dh, dv);
  for (const p of poly.poly.polyPoints) {
    p.h = asInt16(p.h + dh);
    p.v = asInt16(p.v + dv);
  }
}

export function MapPoly(poly: PolyHandle, fromRect: Rect, toRect: Rect): void {
  for (const p of poly.poly.polyPoints) MapPt(p, fromRect, toRect);
  MapRect(poly.poly.polyBBox, fromRect, toRect);
}

function polyPoints(poly: Polygon): Point[] {
  const n = (asInt16(poly.polySize) - 10) >> 2;
  if (n <= 0) return [];
  return poly.polyPoints.slice(0, n);
}

/** `PROCEDURE FrPoly` (`Polygons.a:342-372`). Pen is left at the last vertex. */
export function FrPoly(poly: PolyHandle): void {
  const pts = polyPoints(poly.poly);
  if (pts.length === 0) return;
  MoveTo(pts[0]!.h, pts[0]!.v);
  for (let i = 1; i < pts.length; i++) DoLine(pts[i]!);
}

/** `PROCEDURE DrawPoly` (`Polygons.a:376-413`). */
export function DrawPoly(poly: PolyHandle, mode: number, pat: Pattern): void {
  const port = requirePort();
  if (asInt16(port.pnVis) < 0) return;
  const pts = polyPoints(poly.poly);
  OpenRgn();
  FrPoly(poly);
  if (pts.length > 0) DoLine(pts[0]!);
  const temp = NewRgn();
  CloseRgn(temp);
  DrawRgn(temp, mode, pat);
}

function callPoly(verb: number, poly: PolyHandle, fillPat?: Pattern): void {
  const port = requirePort();
  if (fillPat) port.fillPat = new Uint8Array(fillPat);
  if (port.grafProcs?.polyProc) {
    port.grafProcs.polyProc(verb as 0 | 1 | 2 | 3 | 4, poly);
    return;
  }
  StdPoly(verb, poly);
}

/**
 * `PROCEDURE StdPoly(verb, poly)` (`Polygons.a:15-71`).
 */
export function StdPoly(verb: number, poly: PolyHandle, fillPat?: Pattern): void {
  const port = requirePort();
  if (fillPat) port.fillPat = new Uint8Array(fillPat);
  if (CheckPic()) {
    PutPicVerb(verb);
    PutPicByte(0x70 + verb);
    PutPicPoly(poly);
  }
  if (verb === FRAME) {
    FrPoly(poly);
    return;
  }
  if (
    !rsect([poly.poly.polyBBox, port.visRgn.rgn.rgnBBox, port.clipRgn.rgn.rgnBBox])
  ) {
    return;
  }
  if (EmptyRect(poly.poly.polyBBox)) return;
  const { mode, pat } = PushVerb(verb);
  DrawPoly(poly, mode, pat);
}

export function FramePoly(poly: PolyHandle): void {
  callPoly(FRAME, poly);
}
export function PaintPoly(poly: PolyHandle): void {
  callPoly(PAINT, poly);
}
export function ErasePoly(poly: PolyHandle): void {
  callPoly(ERASE, poly);
}
export function InvertPoly(poly: PolyHandle): void {
  callPoly(INVERT, poly);
}
export function FillPoly(poly: PolyHandle, pat: Pattern): void {
  callPoly(FILL, poly, pat);
}
