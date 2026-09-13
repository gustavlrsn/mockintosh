/**
 * Rectangle routines — from `QuickDraw.p` Rectangle Calculations and
 * Graphical Operations on Rectangles sections, with `Rects.a` implementation.
 *
 * ## Drawing verbs
 * Each shape supports five operations controlled by a {@link GrafVerb}:
 * - **Frame** — draw the outline using the current pen size and pattern.
 * - **Paint** — fill the interior with the current pen pattern.
 * - **Erase** — fill the interior with the background pattern.
 * - **Invert** — XOR every pixel inside the shape.
 * - **Fill** — fill with an explicitly provided pattern.
 *
 * All graphical operations route through the port's `grafProcs` bottleneck
 * (if installed) before falling through to the `StdRect` rasterizer.
 */

import { Rect, Point, Pattern } from "./types";
import { globals, requirePort } from "./globals";
import { MapPt } from "./points";
import { asInt16 } from "./fixmath";
import { RgnBlt } from "./rgnBlt";
import { PutRect } from "./putRect";
import { CheckPic, PutPicRect, PutPicVerb } from "./picSave";
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
// Construction
// -------------------------------------------------------------------------

/**
 * Set all four fields of `r` in place.
 * `PROCEDURE SetRect(VAR r: Rect; left, top, right, bottom: INTEGER)`.
 */
export function SetRect(
  r: Rect,
  left: number,
  top: number,
  right: number,
  bottom: number
): void {
  r.top = top;
  r.left = left;
  r.bottom = bottom;
  r.right = right;
}

// -------------------------------------------------------------------------
// Predicates
// -------------------------------------------------------------------------

/**
 * Return `true` if all four edges of `rect1` and `rect2` are equal.
 * `FUNCTION EqualRect(rect1, rect2: Rect): BOOLEAN`.
 */
export function EqualRect(rect1: Rect, rect2: Rect): boolean {
  return (
    rect1.top === rect2.top &&
    rect1.left === rect2.left &&
    rect1.bottom === rect2.bottom &&
    rect1.right === rect2.right
  );
}

/**
 * Return `true` if `r` has no interior area (width or height ≤ 0).
 * `FUNCTION EmptyRect(r: Rect): BOOLEAN`.
 */
export function EmptyRect(r: Rect): boolean {
  return r.top >= r.bottom || r.left >= r.right;
}

/**
 * Return `true` if point `pt` lies inside `r` (half-open: includes top/left
 * edges, excludes bottom/right edges).
 * `FUNCTION PtInRect(pt: Point; r: Rect): BOOLEAN`.
 */
export function PtInRect(pt: Point, r: Rect): boolean {
  return pt.v >= r.top && pt.v < r.bottom && pt.h >= r.left && pt.h < r.right;
}

// -------------------------------------------------------------------------
// Transformations (in-place)
// -------------------------------------------------------------------------

/**
 * Translate `r` by `(dh, dv)` pixels in place.
 * `PROCEDURE OffsetRect(VAR r: Rect; dh, dv: INTEGER)`.
 */
export function OffsetRect(r: Rect, dh: number, dv: number): void {
  r.top += dv;
  r.left += dh;
  r.bottom += dv;
  r.right += dh;
}

/**
 * Shrink (or grow) `r` by `dh` pixels on each side horizontally and `dv`
 * pixels on each side vertically.  Positive values make `r` smaller.
 * `PROCEDURE InsetRect(VAR r: Rect; dh, dv: INTEGER)`.
 */
export function InsetRect(r: Rect, dh: number, dv: number): void {
  r.top += dv;
  r.left += dh;
  r.bottom -= dv;
  r.right -= dh;
}

// -------------------------------------------------------------------------
// Boolean operations
// -------------------------------------------------------------------------

/**
 * Compute the intersection of `src1` and `src2`, storing the result in
 * `dstRect`.  Returns `true` if the intersection is non-empty.
 *
 * If the rects do not overlap, `dstRect` is set to `{0,0,0,0}` and the
 * function returns `false`.
 *
 * `FUNCTION SectRect(src1, src2: Rect; VAR dstRect: Rect): BOOLEAN`.
 */
export function SectRect(src1: Rect, src2: Rect, dstRect: Rect): boolean {
  dstRect.top = Math.max(src1.top, src2.top);
  dstRect.left = Math.max(src1.left, src2.left);
  dstRect.bottom = Math.min(src1.bottom, src2.bottom);
  dstRect.right = Math.min(src1.right, src2.right);
  if (dstRect.top >= dstRect.bottom || dstRect.left >= dstRect.right) {
    dstRect.top = 0;
    dstRect.left = 0;
    dstRect.bottom = 0;
    dstRect.right = 0;
    return false;
  }
  return true;
}

/**
 * Compute the smallest bounding box that contains both `src1` and `src2`,
 * storing the result in `dstRect`.
 * `PROCEDURE UnionRect(src1, src2: Rect; VAR dstRect: Rect)`.
 */
export function UnionRect(src1: Rect, src2: Rect, dstRect: Rect): void {
  dstRect.top = Math.min(src1.top, src2.top);
  dstRect.left = Math.min(src1.left, src2.left);
  dstRect.bottom = Math.max(src1.bottom, src2.bottom);
  dstRect.right = Math.max(src1.right, src2.right);
}

// -------------------------------------------------------------------------
// Mapping
// -------------------------------------------------------------------------

/**
 * Map `r` from the coordinate space of `fromRect` to the coordinate space
 * of `toRect`, scaling and translating all four edges proportionally.
 * `PROCEDURE MapRect(VAR r: Rect; fromRect, toRect: Rect)`.
 */
export function MapRect(r: Rect, fromRect: Rect, toRect: Rect): void {
  // Pictures.a:1798-1803 — MapPt × 2 (topLeft, then botRight).
  const topLeft = { v: r.top, h: r.left };
  const botRight = { v: r.bottom, h: r.right };
  MapPt(topLeft, fromRect, toRect);
  MapPt(botRight, fromRect, toRect);
  r.top = topLeft.v;
  r.left = topLeft.h;
  r.bottom = botRight.v;
  r.right = botRight.h;
}

// -------------------------------------------------------------------------
// Construction from points
// -------------------------------------------------------------------------

/**
 * Build the smallest rect that encloses both `pt1` and `pt2`, storing the
 * result in `dstRect`.
 * `PROCEDURE Pt2Rect(pt1, pt2: Point; VAR dstRect: Rect)`.
 */
export function Pt2Rect(pt1: Point, pt2: Point, dstRect: Rect): void {
  dstRect.top = Math.min(pt1.v, pt2.v);
  dstRect.left = Math.min(pt1.h, pt2.h);
  dstRect.bottom = Math.max(pt1.v, pt2.v);
  dstRect.right = Math.max(pt1.h, pt2.h);
}

// -------------------------------------------------------------------------
// Graphical operations on rectangles (from QuickDraw.p lines 288-292)
// Each routes through thePort's grafProcs if available, else StdRect.
// -------------------------------------------------------------------------

// Internal: dispatch to grafProcs or StdRect
function callRect(verb: number, r: Rect, fillPat?: Pattern): void {
  const port = requirePort();
  if (fillPat) port.fillPat = new Uint8Array(fillPat);
  if (port.grafProcs?.rectProc) {
    port.grafProcs.rectProc(verb as 0 | 1 | 2 | 3 | 4, r);
    return;
  }
  StdRect(verb as 0 | 1 | 2 | 3 | 4, r);
}

/**
 * `PUSH A MODE AND A PATTERN, BASED ON VERB` (`Rects.a:69-104`).
 * FRAME and PAINT share `pnMode`/`pnPat`; hollow is chosen by the caller.
 */
export function PushVerb(verb: number): { mode: number; pat: Pattern } {
  const port = requirePort();
  if (verb <= PAINT) return { mode: port.pnMode, pat: port.pnPat };
  if (verb < INVERT) return { mode: patCopy, pat: port.bkPat };
  if (verb === INVERT) return { mode: patXor, pat: globals.black };
  return { mode: patCopy, pat: port.fillPat };
}

/** `DrawRect` (`Rects.a:187-217`). `pnVis` gate, then `RgnBlt` (no `portRect`). */
function DrawRect(r: Rect, mode: number, pat: Pattern): void {
  const port = requirePort();
  if (asInt16(port.pnVis) < 0) return;
  RgnBlt(
    port.portBits,
    port.portBits,
    r,
    r,
    mode,
    pat,
    port.clipRgn,
    port.visRgn,
    globals.wideOpen
  );
}

/**
 * `FrRect` pinwheel (`Rects.a:243-301`). Raw 16-bit pen size; if
 * `h2≥h3 ∨ v2≥v3` the original rect is painted once. Otherwise top /
 * right / bottom / left slabs share edges so XOR does not cancel corners
 * (`right.bottom = v3`, not `v4`).
 */
function FrRect(r: Rect): void {
  const port = requirePort();
  if (port.pnVis < 0) return;
  const pw = asInt16(port.pnSize.h);
  const ph = asInt16(port.pnSize.v);
  const h1 = asInt16(r.left);
  const h2 = asInt16(h1 + pw);
  const h4 = asInt16(r.right);
  const h3 = asInt16(h4 - pw);
  const v1 = asInt16(r.top);
  const v2 = asInt16(v1 + ph);
  const v4 = asInt16(r.bottom);
  const v3 = asInt16(v4 - ph);
  if (h2 >= h3 || v2 >= v3) {
    DrawRect({ top: v1, left: h1, bottom: v4, right: h4 }, port.pnMode, port.pnPat);
    return;
  }
  DrawRect({ top: v1, left: h1, bottom: v2, right: h3 }, port.pnMode, port.pnPat);
  DrawRect({ top: v1, left: h3, bottom: v3, right: h4 }, port.pnMode, port.pnPat);
  DrawRect({ top: v3, left: h2, bottom: v4, right: h4 }, port.pnMode, port.pnPat);
  DrawRect({ top: v2, left: h1, bottom: v4, right: h2 }, port.pnMode, port.pnPat);
}

/**
 * Default rectangle rasterizer (`Rects.a:19-65`). FRAME → `FrRect`;
 * other verbs → `PushVerb` then `DrawRect`. Optional `fillPat` is copied
 * into `thePort.fillPat` first so `PushVerb` reads the port.
 */
export function StdRect(verb: number, r: Rect, fillPat?: Pattern): void {
  const port = requirePort();
  if (fillPat) port.fillPat = new Uint8Array(fillPat);
  if (CheckPic()) {
    PutPicVerb(verb);
    PutPicRect(0x30 + verb, r);
  }
  if (verb === FRAME) {
    if (port.rgnSave) {
      if (!globals.rgnBuf) globals.rgnBuf = [];
      PutRect(r, globals.rgnBuf);
    }
    FrRect(r);
    return;
  }
  const { mode, pat } = PushVerb(verb);
  DrawRect(r, mode, pat);
}

/** Draw the outline of `r` using the current pen. `PROCEDURE FrameRect`. */
export function FrameRect(r: Rect): void {
  callRect(FRAME, r);
}
/** Fill `r` with the current pen pattern. `PROCEDURE PaintRect`. */
export function PaintRect(r: Rect): void {
  callRect(PAINT, r);
}
/** Fill `r` with the background pattern. `PROCEDURE EraseRect`. */
export function EraseRect(r: Rect): void {
  callRect(ERASE, r);
}
/** Invert every pixel inside `r`. `PROCEDURE InvertRect`. */
export function InvertRect(r: Rect): void {
  callRect(INVERT, r);
}
/**
 * Fill `r` with the explicit pattern `pat`.
 * `PROCEDURE FillRect(r: Rect; pat: Pattern)`.
 */
export function FillRect(r: Rect, pat: Pattern): void {
  callRect(FILL, r, pat);
}
