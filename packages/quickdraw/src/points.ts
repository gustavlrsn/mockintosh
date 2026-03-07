/**
 * Point calculation routines — from `QuickDraw.p` Point Calculations section.
 *
 * All functions operate on the mutable {@link Point} type (pass by reference,
 * matching the original Pascal VAR parameters).
 */

import { Point } from "./types";
import { globals } from "./globals";

// -------------------------------------------------------------------------
// Point construction and equality
// -------------------------------------------------------------------------

/**
 * Set the `h` and `v` fields of `pt` in place.
 * `PROCEDURE SetPt(VAR pt: Point; h, v: INTEGER)`.
 */
export function SetPt(pt: Point, h: number, v: number): void {
  pt.h = h;
  pt.v = v;
}

/**
 * Return `true` if `pt1` and `pt2` have identical coordinates.
 * `FUNCTION EqualPt(pt1, pt2: Point): BOOLEAN`.
 */
export function EqualPt(pt1: Point, pt2: Point): boolean {
  return pt1.h === pt2.h && pt1.v === pt2.v;
}

// -------------------------------------------------------------------------
// Point arithmetic
// -------------------------------------------------------------------------

/**
 * Add `src` to `dst` in place: `dst := dst + src`.
 * `PROCEDURE AddPt(src: Point; VAR dst: Point)`.
 */
export function AddPt(src: Point, dst: Point): void {
  dst.v += src.v;
  dst.h += src.h;
}

/**
 * Subtract `src` from `dst` in place: `dst := dst - src`.
 * `PROCEDURE SubPt(src: Point; VAR dst: Point)`.
 */
export function SubPt(src: Point, dst: Point): void {
  dst.v -= src.v;
  dst.h -= src.h;
}

// -------------------------------------------------------------------------
// Coordinate conversion
// -------------------------------------------------------------------------

/**
 * Convert `pt` from local port coordinates to global (screen) coordinates
 * by subtracting the current port's bitmap origin.
 *
 * `PROCEDURE LocalToGlobal(VAR pt: Point)`.
 */
export function LocalToGlobal(pt: Point): void {
  const port = globals.thePort;
  if (!port) return;
  pt.v -= port.portBits.bounds.top;
  pt.h -= port.portBits.bounds.left;
}

/**
 * Convert `pt` from global (screen) coordinates to local port coordinates
 * by adding the current port's bitmap origin.
 *
 * `PROCEDURE GlobalToLocal(VAR pt: Point)`.
 */
export function GlobalToLocal(pt: Point): void {
  const port = globals.thePort;
  if (!port) return;
  pt.v += port.portBits.bounds.top;
  pt.h += port.portBits.bounds.left;
}

// -------------------------------------------------------------------------
// Point mapping
// -------------------------------------------------------------------------

/**
 * Scale `pt` proportionally from `fromRect` dimensions to `toRect` dimensions.
 *
 * The scaling is applied about the origin (not the rect's origin), so this
 * is a pure scaling operation rather than a full affine map.
 * Use {@link MapPt} when you also need coordinate translation.
 *
 * `PROCEDURE ScalePt(VAR pt: Point; fromRect, toRect: Rect)`.
 */
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

/**
 * Map `pt` from the coordinate space of `fromRect` to the coordinate space
 * of `toRect`, preserving the relative position within each rect.
 *
 * Equivalent to a proportional scaling plus translation:
 * `pt' = toRect.origin + (pt - fromRect.origin) * (toRect.size / fromRect.size)`.
 *
 * `PROCEDURE MapPt(VAR pt: Point; fromRect, toRect: Rect)`.
 */
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
