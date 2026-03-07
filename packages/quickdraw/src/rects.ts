// Rectangle routines — QuickDraw.p Rectangle Calculations +
// Graphical Operations on Rectangles sections, with Rects.a implementation.

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

export function EqualRect(rect1: Rect, rect2: Rect): boolean {
  return (
    rect1.top === rect2.top &&
    rect1.left === rect2.left &&
    rect1.bottom === rect2.bottom &&
    rect1.right === rect2.right
  );
}

// A rect is empty if it has no interior (width or height <= 0)
export function EmptyRect(r: Rect): boolean {
  return r.top >= r.bottom || r.left >= r.right;
}

export function PtInRect(pt: Point, r: Rect): boolean {
  return pt.v >= r.top && pt.v < r.bottom && pt.h >= r.left && pt.h < r.right;
}

// -------------------------------------------------------------------------
// Transformations (in-place)
// -------------------------------------------------------------------------

export function OffsetRect(r: Rect, dh: number, dv: number): void {
  r.top += dv;
  r.left += dh;
  r.bottom += dv;
  r.right += dh;
}

export function InsetRect(r: Rect, dh: number, dv: number): void {
  r.top += dv;
  r.left += dh;
  r.bottom -= dv;
  r.right -= dh;
}

// -------------------------------------------------------------------------
// Boolean operations
// -------------------------------------------------------------------------

// Compute intersection of src1 and src2 into dstRect.
// Returns true if intersection is non-empty.
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

// Compute bounding box union of src1 and src2 into dstRect
export function UnionRect(src1: Rect, src2: Rect, dstRect: Rect): void {
  dstRect.top = Math.min(src1.top, src2.top);
  dstRect.left = Math.min(src1.left, src2.left);
  dstRect.bottom = Math.max(src1.bottom, src2.bottom);
  dstRect.right = Math.max(src1.right, src2.right);
}

// -------------------------------------------------------------------------
// Mapping
// -------------------------------------------------------------------------

// Map r from fromRect coordinates to toRect coordinates
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

// Build the smallest rect enclosing pt1 and pt2
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

// The actual rasterizer (called by the bottleneck or directly)
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

// PROCEDURE FrameRect(r: Rect);
export function FrameRect(r: Rect): void {
  callRect(FRAME, r);
}
// PROCEDURE PaintRect(r: Rect);
export function PaintRect(r: Rect): void {
  callRect(PAINT, r);
}
// PROCEDURE EraseRect(r: Rect);
export function EraseRect(r: Rect): void {
  callRect(ERASE, r);
}
// PROCEDURE InvertRect(r: Rect);
export function InvertRect(r: Rect): void {
  callRect(INVERT, r);
}
// PROCEDURE FillRect(r: Rect; pat: Pattern);
export function FillRect(r: Rect, pat: Pattern): void {
  callRect(FILL, r, pat);
}
