// Point calculation routines (from QuickDraw.p Point Calculations section)

import { Point } from "./types";
import { globals } from "./globals";

// -------------------------------------------------------------------------
// Point construction and equality
// -------------------------------------------------------------------------

export function SetPt(pt: Point, h: number, v: number): void {
  pt.h = h;
  pt.v = v;
}

export function EqualPt(pt1: Point, pt2: Point): boolean {
  return pt1.h === pt2.h && pt1.v === pt2.v;
}

// -------------------------------------------------------------------------
// Point arithmetic
// -------------------------------------------------------------------------

// dst := dst + src
export function AddPt(src: Point, dst: Point): void {
  dst.v += src.v;
  dst.h += src.h;
}

// dst := dst - src
export function SubPt(src: Point, dst: Point): void {
  dst.v -= src.v;
  dst.h -= src.h;
}

// -------------------------------------------------------------------------
// Coordinate conversion
// -------------------------------------------------------------------------

// Convert local port coordinates to global (screen) coordinates
export function LocalToGlobal(pt: Point): void {
  const port = globals.thePort;
  if (!port) return;
  pt.v -= port.portBits.bounds.top;
  pt.h -= port.portBits.bounds.left;
}

// Convert global (screen) coordinates to local port coordinates
export function GlobalToLocal(pt: Point): void {
  const port = globals.thePort;
  if (!port) return;
  pt.v += port.portBits.bounds.top;
  pt.h += port.portBits.bounds.left;
}

// -------------------------------------------------------------------------
// Point mapping
// -------------------------------------------------------------------------

// Scale pt proportionally from fromRect to toRect
export function ScalePt(
  pt: Point,
  fromRect: { top: number; left: number; bottom: number; right: number },
  toRect: { top: number; left: number; bottom: number; right: number }
): void {
  const fW = fromRect.right - fromRect.left;
  const fH = fromRect.bottom - fromRect.top;
  const tW = toRect.right - toRect.left;
  const tH = toRect.bottom - toRect.top;
  if (fW !== 0) pt.h = Math.round((pt.h * tW) / fW);
  if (fH !== 0) pt.v = Math.round((pt.v * tH) / fH);
}

// Map pt from fromRect coordinate space to toRect coordinate space
export function MapPt(
  pt: Point,
  fromRect: { top: number; left: number; bottom: number; right: number },
  toRect: { top: number; left: number; bottom: number; right: number }
): void {
  const fW = fromRect.right - fromRect.left;
  const fH = fromRect.bottom - fromRect.top;
  const tW = toRect.right - toRect.left;
  const tH = toRect.bottom - toRect.top;

  const relH = pt.h - fromRect.left;
  const relV = pt.v - fromRect.top;

  pt.h = toRect.left + (fW !== 0 ? Math.round((relH * tW) / fW) : 0);
  pt.v = toRect.top + (fH !== 0 ? Math.round((relV * tH) / fH) : 0);
}
