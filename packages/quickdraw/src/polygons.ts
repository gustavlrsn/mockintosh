// Polygon routines — from QuickDraw.p Polygon Routines section
// and reference/QuickDraw/Polygons.a implementation.
//
// Polygons are recorded as a sequence of LineTo calls and then drawn
// using the same scanline rasterizer as regions.

import { Polygon, PolyHandle, Rect, Pattern, Point, cloneRect } from "./types";
import { globals } from "./globals";
import { drawHSpan, drawRectToPort } from "./bitblt";
import {
  patCopy,
  patXor,
  FRAME,
  PAINT,
  ERASE,
  INVERT,
  FILL,
} from "./constants";
import { StdLine } from "./lines";

// -------------------------------------------------------------------------
// OpenPoly / ClosePoly / KillPoly
// -------------------------------------------------------------------------

// FUNCTION OpenPoly: PolyHandle;
export function OpenPoly(): PolyHandle {
  const port = globals.thePort;
  const poly: Polygon = {
    polySize: 10,
    polyBBox: { top: 0, left: 0, bottom: 0, right: 0 },
    polyPoints: [],
  };
  const handle: PolyHandle = { poly };
  globals.thePoly = handle;
  if (port) port.polySave = handle;
  return handle;
}

// PROCEDURE ClosePoly;
export function ClosePoly(): void {
  const port = globals.thePort;
  if (!port) return;
  const h = globals.thePoly;
  if (!h) return;
  // Recompute bounding box
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
      bottom: maxV + 1,
      right: maxH + 1,
    };
  }
  port.polySave = null;
  globals.thePoly = null;
}

// PROCEDURE KillPoly(poly: PolyHandle);
export function KillPoly(_poly: PolyHandle): void {
  // GC handles memory in JS
}

// -------------------------------------------------------------------------
// Geometric transformations
// -------------------------------------------------------------------------

// PROCEDURE OffsetPoly(poly: PolyHandle; dh, dv: INTEGER);
export function OffsetPoly(poly: PolyHandle, dh: number, dv: number): void {
  poly.poly.polyBBox.top += dv;
  poly.poly.polyBBox.left += dh;
  poly.poly.polyBBox.bottom += dv;
  poly.poly.polyBBox.right += dh;
  for (const p of poly.poly.polyPoints) {
    p.h += dh;
    p.v += dv;
  }
}

// PROCEDURE MapPoly(poly: PolyHandle; fromRect, toRect: Rect);
export function MapPoly(poly: PolyHandle, fromRect: Rect, toRect: Rect): void {
  const fW = fromRect.right - fromRect.left;
  const fH = fromRect.bottom - fromRect.top;
  const tW = toRect.right - toRect.left;
  const tH = toRect.bottom - toRect.top;
  const mapH = (x: number) =>
    fW ? toRect.left + Math.round(((x - fromRect.left) * tW) / fW) : x;
  const mapV = (y: number) =>
    fH ? toRect.top + Math.round(((y - fromRect.top) * tH) / fH) : y;

  for (const p of poly.poly.polyPoints) {
    p.h = mapH(p.h);
    p.v = mapV(p.v);
  }
  poly.poly.polyBBox = {
    top: mapV(poly.poly.polyBBox.top),
    left: mapH(poly.poly.polyBBox.left),
    bottom: mapV(poly.poly.polyBBox.bottom),
    right: mapH(poly.poly.polyBBox.right),
  };
}

// -------------------------------------------------------------------------
// Polygon scanline rasterizer
// Converts polyPoints to a sorted list of scanline spans using
// the even-odd fill rule (same as original QuickDraw).
// -------------------------------------------------------------------------

function polyToScanlines(poly: Polygon): Map<number, number[]> {
  const pts = poly.polyPoints;
  if (pts.length < 2) return new Map();

  const map = new Map<number, number[]>();

  const addIntersection = (y: number, x: number) => {
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(x);
  };

  // Edge-scan: for each edge, record x-intersections at each scanline
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const minY = Math.min(p0.v, p1.v);
    const maxY = Math.max(p0.v, p1.v);
    if (minY === maxY) continue; // horizontal edges don't contribute

    for (let y = minY; y < maxY; y++) {
      const t = (y - p0.v) / (p1.v - p0.v);
      const x = p0.h + t * (p1.h - p0.h);
      addIntersection(y, x);
    }
  }

  // Sort each scanline's x values and pair them
  const result = new Map<number, number[]>();
  map.forEach((xs, y) => {
    const sorted = xs.slice().sort((a, b) => a - b);
    result.set(y, sorted);
  });
  return result;
}

// -------------------------------------------------------------------------
// Frame polygon (outline only, using LineTo for each edge)
// -------------------------------------------------------------------------

function framePolyImpl(poly: Polygon, port: import("./types").GrafPort): void {
  const pts = poly.polyPoints;
  if (pts.length < 2) return;

  const savedLoc = { h: port.pnLoc.h, v: port.pnLoc.v };
  for (let i = 0; i < pts.length - 1; i++) {
    port.pnLoc.h = pts[i].h;
    port.pnLoc.v = pts[i].v;
    StdLine(port, pts[i + 1]);
  }
  port.pnLoc.h = savedLoc.h;
  port.pnLoc.v = savedLoc.v;
}

// -------------------------------------------------------------------------
// Fill polygon
// -------------------------------------------------------------------------

function fillPolyImpl(
  poly: Polygon,
  pat: Pattern,
  mode: number,
  port: import("./types").GrafPort
): void {
  const scanlines = polyToScanlines(poly);
  scanlines.forEach((xs, y) => {
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = Math.round(xs[i]);
      const x1 = Math.round(xs[i + 1]);
      if (x0 < x1) drawHSpan(x0, x1, y, pat, mode, port);
    }
  });
}

// -------------------------------------------------------------------------
// Verb dispatch
// -------------------------------------------------------------------------

function callPoly(verb: number, poly: PolyHandle, fillPat?: Pattern): void {
  const port = globals.thePort;
  if (!port) return;
  if (port.grafProcs && port.grafProcs.polyProc) {
    if (fillPat) port.fillPat = new Uint8Array(fillPat);
    port.grafProcs.polyProc(verb as any, poly);
    return;
  }
  StdPoly(verb, poly, fillPat);
}

export function StdPoly(
  verb: number,
  poly: PolyHandle,
  fillPat?: Pattern
): void {
  const port = globals.thePort;
  if (!port) return;
  const p = poly.poly;

  if (verb === FRAME) {
    framePolyImpl(p, port);
    return;
  }

  let pat: Pattern;
  let mode: number;
  switch (verb) {
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
  fillPolyImpl(p, pat, mode, port);
}

// PROCEDURE FramePoly(poly: PolyHandle);
export function FramePoly(poly: PolyHandle): void {
  callPoly(FRAME, poly);
}
// PROCEDURE PaintPoly(poly: PolyHandle);
export function PaintPoly(poly: PolyHandle): void {
  callPoly(PAINT, poly);
}
// PROCEDURE ErasePoly(poly: PolyHandle);
export function ErasePoly(poly: PolyHandle): void {
  callPoly(ERASE, poly);
}
// PROCEDURE InvertPoly(poly: PolyHandle);
export function InvertPoly(poly: PolyHandle): void {
  callPoly(INVERT, poly);
}
// PROCEDURE FillPoly(poly: PolyHandle; pat: Pattern);
export function FillPoly(poly: PolyHandle, pat: Pattern): void {
  callPoly(FILL, poly, pat);
}
