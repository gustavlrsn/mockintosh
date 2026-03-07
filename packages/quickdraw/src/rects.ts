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

import { Rect, Point, Pattern, cloneRect } from "./types";
import { globals } from "./globals";
import { drawRectToPort, drawHSpan } from "./bitblt";
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
  const fW = fromRect.right - fromRect.left;
  const fH = fromRect.bottom - fromRect.top;
  const tW = toRect.right - toRect.left;
  const tH = toRect.bottom - toRect.top;

  if (fW !== 0) {
    r.left = toRect.left + Math.round(((r.left - fromRect.left) * tW) / fW);
    r.right = toRect.left + Math.round(((r.right - fromRect.left) * tW) / fW);
  }
  if (fH !== 0) {
    r.top = toRect.top + Math.round(((r.top - fromRect.top) * tH) / fH);
    r.bottom = toRect.top + Math.round(((r.bottom - fromRect.top) * tH) / fH);
  }
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
  const port = globals.thePort;
  if (!port) return;
  if (port.grafProcs && port.grafProcs.rectProc) {
    if (fillPat) port.fillPat = new Uint8Array(fillPat);
    port.grafProcs.rectProc(verb as any, r);
    return;
  }
  StdRect(verb as any, r, fillPat);
}

/**
 * Default rectangle rasterizer.  Draws `r` using the given `verb` into the
 * current port.  Called by the `Frame/Paint/…Rect` family, and also directly
 * when bypassing the bottleneck.
 *
 * @param verb     Drawing operation (FRAME=0, PAINT=1, ERASE=2, INVERT=3, FILL=4).
 * @param r        The rectangle to draw.
 * @param fillPat  Pattern to use for FILL; ignored for other verbs.
 */
export function StdRect(verb: number, r: Rect, fillPat?: Pattern): void {
  const port = globals.thePort;
  if (!port) return;
  if (r.top >= r.bottom || r.left >= r.right) return;

  switch (verb) {
    case FRAME: {
      const pw = Math.max(1, port.pnSize.h);
      const ph = Math.max(1, port.pnSize.v);
      // Top edge
      drawRectToPort(
        r.left,
        r.top,
        r.right,
        r.top + ph,
        port.pnPat,
        port.pnMode,
        port
      );
      // Bottom edge
      drawRectToPort(
        r.left,
        r.bottom - ph,
        r.right,
        r.bottom,
        port.pnPat,
        port.pnMode,
        port
      );
      // Left edge (avoid double-drawing corners)
      drawRectToPort(
        r.left,
        r.top + ph,
        r.left + pw,
        r.bottom - ph,
        port.pnPat,
        port.pnMode,
        port
      );
      // Right edge
      drawRectToPort(
        r.right - pw,
        r.top + ph,
        r.right,
        r.bottom - ph,
        port.pnPat,
        port.pnMode,
        port
      );
      break;
    }
    case PAINT:
      drawRectToPort(
        r.left,
        r.top,
        r.right,
        r.bottom,
        port.pnPat,
        port.pnMode,
        port
      );
      break;
    case ERASE:
      drawRectToPort(
        r.left,
        r.top,
        r.right,
        r.bottom,
        port.bkPat,
        patCopy,
        port
      );
      break;
    case INVERT:
      drawRectToPort(
        r.left,
        r.top,
        r.right,
        r.bottom,
        globals.black,
        patXor,
        port
      );
      break;
    case FILL: {
      const pat = fillPat ?? port.fillPat;
      drawRectToPort(r.left, r.top, r.right, r.bottom, pat, patCopy, port);
      break;
    }
  }
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
