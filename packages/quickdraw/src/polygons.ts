/**
 * Polygon routines — from `QuickDraw.p` Polygon Routines section and
 * `reference/QuickDraw/Polygons.a` implementation.
 *
 * Polygons are recorded as a sequence of {@link LineTo} calls bracketed by
 * {@link OpenPoly} and {@link ClosePoly}, then drawn with the `Frame/Paint/…Poly`
 * family.  Filling uses an even-odd scanline rasterizer that matches the
 * behaviour of the original QuickDraw.
 */

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

/**
 * Begin recording a polygon.  All subsequent {@link LineTo} calls add
 * vertices to the polygon instead of (or in addition to) drawing pixels.
 * Call {@link ClosePoly} to finalise.
 *
 * `FUNCTION OpenPoly: PolyHandle`.
 *
 * @returns A handle to the new polygon being recorded.
 */
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

/**
 * Finish recording the current polygon.  Recomputes the bounding box from
 * the accumulated vertices and clears `port.polySave`.
 * `PROCEDURE ClosePoly`.
 */
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

/**
 * Release a polygon handle.  In JS this is a no-op — the GC reclaims memory.
 * `PROCEDURE KillPoly(poly: PolyHandle)`.
 */
export function KillPoly(_poly: PolyHandle): void {
  // GC handles memory in JS
}

// -------------------------------------------------------------------------
// Geometric transformations
// -------------------------------------------------------------------------

/**
 * Translate all vertices of `poly` by `(dh, dv)` pixels and update the
 * bounding box.  `PROCEDURE OffsetPoly(poly: PolyHandle; dh, dv: INTEGER)`.
 */
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

/**
 * Map all vertices of `poly` from the coordinate space of `fromRect` to
 * `toRect`, proportionally scaling and translating each point.
 * `PROCEDURE MapPoly(poly: PolyHandle; fromRect, toRect: Rect)`.
 */
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

/**
 * Default polygon rasterizer.  Called by the `Frame/Paint/…Poly` family.
 *
 * @param verb     Drawing operation (FRAME=0, PAINT=1, ERASE=2, INVERT=3, FILL=4).
 * @param poly     The polygon to draw.
 * @param fillPat  Pattern to use for FILL; ignored for other verbs.
 */
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

/** Draw the outline of `poly` using the current pen. `PROCEDURE FramePoly`. */
export function FramePoly(poly: PolyHandle): void {
  callPoly(FRAME, poly);
}
/** Fill `poly` with the current pen pattern. `PROCEDURE PaintPoly`. */
export function PaintPoly(poly: PolyHandle): void {
  callPoly(PAINT, poly);
}
/** Fill `poly` with the background pattern. `PROCEDURE ErasePoly`. */
export function ErasePoly(poly: PolyHandle): void {
  callPoly(ERASE, poly);
}
/** Invert every pixel inside `poly`. `PROCEDURE InvertPoly`. */
export function InvertPoly(poly: PolyHandle): void {
  callPoly(INVERT, poly);
}
/** Fill `poly` with the explicit pattern `pat`. `PROCEDURE FillPoly`. */
export function FillPoly(poly: PolyHandle, pat: Pattern): void {
  callPoly(FILL, poly, pat);
}
