/**
 * Point calculation routines — from `QuickDraw.p` and `Pictures.a` SCALE1/MAP1.
 */

import { Point, Rect } from "./types";
import { requirePort } from "./globals";
import { mulDivU16 } from "./fixmath";

/**
 * Set the `h` and `v` fields of `pt` in place.
 * `PROCEDURE SetPt(VAR pt: Point; h, v: INTEGER)`.
 */
export function SetPt(pt: Point, h: number, v: number): void {
  pt.h = h;
  pt.v = v;
}

/** `FUNCTION EqualPt(pt1, pt2: Point): BOOLEAN`. */
export function EqualPt(pt1: Point, pt2: Point): boolean {
  return pt1.h === pt2.h && pt1.v === pt2.v;
}

/** `PROCEDURE AddPt(src: Point; VAR dst: Point)`. */
export function AddPt(src: Point, dst: Point): void {
  dst.v += src.v;
  dst.h += src.h;
}

/** `PROCEDURE SubPt(src: Point; VAR dst: Point)`. */
export function SubPt(src: Point, dst: Point): void {
  dst.v -= src.v;
  dst.h -= src.h;
}

/** `PROCEDURE LocalToGlobal(VAR pt: Point)` (`GrafAsm.a:218-248`). */
export function LocalToGlobal(pt: Point): void {
  const port = requirePort();
  pt.v -= port.portBits.bounds.top;
  pt.h -= port.portBits.bounds.left;
}

/** `PROCEDURE GlobalToLocal(VAR pt: Point)` (`GrafAsm.a:234-248`). */
export function GlobalToLocal(pt: Point): void {
  const port = requirePort();
  pt.v += port.portBits.bounds.top;
  pt.h += port.portBits.bounds.left;
}

/**
 * SCALE1 (`Pictures.a:1694-1718`): skip if from==to; input ≤0 → 0;
 * `(x·to + from/2) div from`, **minimum 1**.
 */
function scale1(coord: number, fromSize: number, toSize: number): number {
  if (fromSize === toSize) return coord;
  if (coord <= 0) return 0;
  const rounded = mulDivU16(coord, toSize, fromSize, fromSize >> 1);
  return rounded === 0 ? 1 : rounded;
}

/**
 * Scale `pt` about the origin from `fromRect` size to `toRect` size.
 * `PROCEDURE ScalePt(VAR pt: Point; fromRect, toRect: Rect)`.
 */
export function ScalePt(pt: Point, fromRect: Rect, toRect: Rect): void {
  const fW = fromRect.right - fromRect.left;
  const fH = fromRect.bottom - fromRect.top;
  const tW = toRect.right - toRect.left;
  const tH = toRect.bottom - toRect.top;
  pt.h = scale1(pt.h, fW, tW);
  pt.v = scale1(pt.v, fH, tH);
}

/**
 * MAP1 (`Pictures.a:1759-1785`): skip if from==to; magnitude rounded
 * half-away-from-zero via unsigned mul/div, then the original sign restored.
 */
function map1(coord: number, fromOrigin: number, fromSize: number, toOrigin: number, toSize: number): number {
  let rel = coord - fromOrigin;
  if (fromSize !== toSize) {
    const denom2 = fromSize >> 1;
    const neg = rel < 0;
    if (neg) rel = -rel;
    rel = mulDivU16(rel, toSize, fromSize, denom2);
    if (neg) rel = -rel;
  }
  return rel + toOrigin;
}

/**
 * Map `pt` from `fromRect`'s coordinate space into `toRect`'s.
 * `PROCEDURE MapPt(VAR pt: Point; fromRect, toRect: Rect)`.
 */
export function MapPt(pt: Point, fromRect: Rect, toRect: Rect): void {
  pt.v = map1(pt.v, fromRect.top, fromRect.bottom - fromRect.top, toRect.top, toRect.bottom - toRect.top);
  pt.h = map1(pt.h, fromRect.left, fromRect.right - fromRect.left, toRect.left, toRect.right - toRect.left);
}
