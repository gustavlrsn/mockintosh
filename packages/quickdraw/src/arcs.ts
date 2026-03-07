/**
 * Arc, Oval, and RoundRect drawing — from `QuickDraw.p` and
 * `reference/QuickDraw/DrawArc.a`.
 *
 * All shapes are rasterized using a midpoint ellipse algorithm that closely
 * matches the original `DrawArc.a` "oval state record" approach.  Shapes
 * can be drawn as outlines (FRAME) or solid fills (PAINT/ERASE/INVERT/FILL).
 *
 * ## Angle convention
 * QuickDraw measures angles in degrees with **0° at 12 o'clock, increasing
 * clockwise**.  A negative `arcAngle` sweeps counter-clockwise.
 */

import { Rect, Pattern, GrafPort, cloneRect } from "./types";
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
import { StdLine } from "./lines";

// -------------------------------------------------------------------------
// Core scanline arc/oval rasterizer
// Matches DrawArc.a's "oval state record" approach.
//
// Fills between two ellipses (outer and inner) for hollow shapes,
// or a single ellipse for solid shapes.
// startAngle and arcAngle control the angular sweep.
// -------------------------------------------------------------------------

// Generate scanline spans for an ellipse bounded by r.
// Returns: array of {y, x0, x1} sorted top to bottom.
function ellipseSpans(r: Rect): Array<{ y: number; x0: number; x1: number }> {
  const cx = (r.left + r.right) / 2;
  const cy = (r.top + r.bottom) / 2;
  const a = (r.right - r.left) / 2;
  const b = (r.bottom - r.top) / 2;

  if (a <= 0 || b <= 0) return [];

  const spans: Array<{ y: number; x0: number; x1: number }> = [];

  // Midpoint ellipse algorithm — integer arithmetic
  let x = 0;
  let y = Math.round(b);
  let a2 = a * a;
  let b2 = b * b;
  let fa2 = 4 * a2;
  let fb2 = 4 * b2;
  let sigma = Math.round(2 * b2 + a2 * (1 - 2 * b));

  const addSpan = (row: number, hw: number) => {
    const y0 = Math.floor(cy + row);
    const y1 = Math.floor(cy - row);
    const x0 = Math.floor(cx - hw);
    const x1 = Math.ceil(cx + hw);
    if (y0 >= r.top && y0 < r.bottom) spans.push({ y: y0, x0, x1 });
    if (y1 !== y0 && y1 >= r.top && y1 < r.bottom)
      spans.push({ y: y1, x0, x1 });
  };

  while (b2 * x <= a2 * y) {
    addSpan(y, x);
    if (sigma >= 0) {
      sigma += fa2 * (1 - y);
      y--;
    }
    sigma += b2 * (4 * x + 6);
    x++;
  }

  sigma = Math.round(2 * a2 + b2 * (1 - 2 * a));
  x = Math.round(a);
  y = 0;
  while (a2 * y <= b2 * x) {
    addSpan(y, x);
    if (sigma >= 0) {
      sigma += fb2 * (1 - x);
      x--;
    }
    sigma += a2 * (4 * y + 6);
    y++;
  }

  spans.sort((a, b) => a.y - b.y);
  return spans;
}

// Convert angle (degrees, 0=12-o-clock, clockwise) to unit direction
// QuickDraw convention: 0° = up (12-o-clock), increases clockwise
function angleToVec(deg: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad), y: Math.sin(rad) };
}

// Test whether a point (dx, dy) relative to ellipse centre is within the
// angular range [startAngle, startAngle+arcAngle].
// QuickDraw: 0° = up (−y direction), clockwise.
function inArcSector(
  dx: number,
  dy: number,
  startAngle: number,
  arcAngle: number
): boolean {
  if (arcAngle === 0) return false;
  if (Math.abs(arcAngle) >= 360) return true;

  let angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  const start = ((startAngle % 360) + 360) % 360;
  const sweep = Math.abs(arcAngle);
  let end = (start + sweep) % 360;

  if (arcAngle < 0) {
    const s = (start - sweep + 360) % 360;
    end = start;
    if (s <= end) return angle >= s && angle <= end;
    return angle >= s || angle <= end;
  }
  if (start <= end) return angle >= start && angle <= end;
  return angle >= start || angle <= end;
}

// -------------------------------------------------------------------------
// Solid oval fill (paint/erase/invert/fill verbs)
// -------------------------------------------------------------------------

function fillOval(r: Rect, pat: Pattern, mode: number, port: GrafPort): void {
  const spans = ellipseSpans(r);
  // Collect one span per row (widest)
  const rowSpan = new Map<number, { x0: number; x1: number }>();
  for (const s of spans) {
    const cur = rowSpan.get(s.y);
    if (!cur || s.x1 - s.x0 > cur.x1 - cur.x0) rowSpan.set(s.y, s);
  }
  rowSpan.forEach(({ x0, x1 }, y) => {
    drawHSpan(x0, x1, y, pat, mode, port);
  });
}

// -------------------------------------------------------------------------
// Hollow oval outline (frame verb)
// -------------------------------------------------------------------------

function frameOval(r: Rect, port: GrafPort): void {
  const pw = Math.max(1, port.pnSize.h);
  const ph = Math.max(1, port.pnSize.v);
  const outer = r;
  const inner = {
    top: r.top + ph,
    left: r.left + pw,
    bottom: r.bottom - ph,
    right: r.right - pw,
  };

  const outerSpans = ellipseSpans(outer);
  const innerSpans = ellipseSpans(inner);

  const innerMap = new Map<number, { x0: number; x1: number }>();
  for (const s of innerSpans) {
    const cur = innerMap.get(s.y);
    if (!cur || s.x1 - s.x0 > cur.x1 - cur.x0) innerMap.set(s.y, s);
  }

  const outerMap = new Map<number, { x0: number; x1: number }>();
  for (const s of outerSpans) {
    const cur = outerMap.get(s.y);
    if (!cur || s.x1 - s.x0 > cur.x1 - cur.x0) outerMap.set(s.y, s);
  }

  outerMap.forEach(({ x0: ox0, x1: ox1 }, y) => {
    const inn = innerMap.get(y);
    if (!inn || inner.top > r.bottom || inner.left >= inner.right) {
      drawHSpan(ox0, ox1, y, port.pnPat, port.pnMode, port);
    } else {
      const { x0: ix0, x1: ix1 } = inn;
      if (ox0 < ix0) drawHSpan(ox0, ix0, y, port.pnPat, port.pnMode, port);
      if (ix1 < ox1) drawHSpan(ix1, ox1, y, port.pnPat, port.pnMode, port);
    }
  });
}

// -------------------------------------------------------------------------
// Arc rasterizer
// Clips ellipse spans to the angular sector [startAngle, arcAngle].
// -------------------------------------------------------------------------

function fillArcSector(
  r: Rect,
  startAngle: number,
  arcAngle: number,
  hollow: boolean,
  pat: Pattern,
  mode: number,
  port: GrafPort
): void {
  const cx = (r.left + r.right) / 2;
  const cy = (r.top + r.bottom) / 2;
  const pw = Math.max(1, port.pnSize.h);
  const ph = Math.max(1, port.pnSize.v);

  const outer = r;
  const inner = hollow
    ? {
        top: r.top + ph,
        left: r.left + pw,
        bottom: r.bottom - ph,
        right: r.right - pw,
      }
    : null;

  const outerSpans = ellipseSpans(outer);
  const innerSpans =
    inner && inner.right > inner.left && inner.bottom > inner.top
      ? ellipseSpans(inner)
      : [];

  const innerMap = new Map<number, { x0: number; x1: number }>();
  for (const s of innerSpans) {
    const cur = innerMap.get(s.y);
    if (!cur || s.x1 - s.x0 > cur.x1 - cur.x0) innerMap.set(s.y, s);
  }

  const outerMap = new Map<number, { x0: number; x1: number }>();
  for (const s of outerSpans) {
    const cur = outerMap.get(s.y);
    if (!cur || s.x1 - s.x0 > cur.x1 - cur.x0) outerMap.set(s.y, s);
  }

  outerMap.forEach(({ x0: ox0, x1: ox1 }, y) => {
    const inn = innerMap.get(y);
    const iy = y + 0.5;

    // For each x in the outer row, check if it's in the sector
    const lo = inn ? inn.x0 : Math.round(cx);
    const hi = inn ? inn.x1 : Math.round(cx);

    // Left arc band
    let runStart = -1;
    for (let x = ox0; x < (inn ? lo : ox1); x++) {
      if (inArcSector(x + 0.5 - cx, iy - cy, startAngle, arcAngle)) {
        if (runStart < 0) runStart = x;
      } else {
        if (runStart >= 0) {
          drawHSpan(runStart, x, y, pat, mode, port);
          runStart = -1;
        }
      }
    }
    if (runStart >= 0) drawHSpan(runStart, inn ? lo : ox1, y, pat, mode, port);

    if (inn) {
      // Right arc band
      runStart = -1;
      for (let x = hi; x < ox1; x++) {
        if (inArcSector(x + 0.5 - cx, iy - cy, startAngle, arcAngle)) {
          if (runStart < 0) runStart = x;
        } else {
          if (runStart >= 0) {
            drawHSpan(runStart, x, y, pat, mode, port);
            runStart = -1;
          }
        }
      }
      if (runStart >= 0) drawHSpan(runStart, ox1, y, pat, mode, port);
    }
  });
}

// -------------------------------------------------------------------------
// Verb dispatch helpers
// -------------------------------------------------------------------------

function verbPat(
  verb: number,
  port: GrafPort,
  fillPat?: Pattern
): { pat: Pattern; mode: number } {
  switch (verb) {
    case PAINT:
      return { pat: port.pnPat, mode: port.pnMode };
    case ERASE:
      return { pat: port.bkPat, mode: patCopy };
    case INVERT:
      return { pat: globals.black, mode: patXor };
    case FILL:
      return { pat: fillPat ?? port.fillPat, mode: patCopy };
    default:
      return { pat: port.pnPat, mode: port.pnMode }; // FRAME
  }
}

/**
 * Compute the angle in QuickDraw convention (0° = up, clockwise) from the
 * centre of `r` to point `pt`, and store the result (rounded to the nearest
 * degree) in `angle.value`.
 *
 * `PROCEDURE PtToAngle(r: Rect; pt: Point; VAR angle: INTEGER)`.
 */

export function PtToAngle(
  r: Rect,
  pt: { v: number; h: number },
  angle: { value: number }
): void {
  const cx = (r.left + r.right) / 2;
  const cy = (r.top + r.bottom) / 2;
  const dx = pt.h - cx;
  const dy = pt.v - cy;
  let deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  angle.value = Math.round(deg);
}

// -------------------------------------------------------------------------
// OVAL routines
// -------------------------------------------------------------------------

function callOval(verb: number, r: Rect, fillPat?: Pattern): void {
  const port = globals.thePort;
  if (!port) return;
  if (port.grafProcs && port.grafProcs.ovalProc) {
    if (fillPat) port.fillPat = new Uint8Array(fillPat);
    port.grafProcs.ovalProc(verb as any, r);
    return;
  }
  StdOval(verb, r, fillPat);
}

export function StdOval(verb: number, r: Rect, fillPat?: Pattern): void {
  const port = globals.thePort;
  if (!port) return;
  if (verb === FRAME) {
    frameOval(r, port);
    return;
  }
  const { pat, mode } = verbPat(verb, port, fillPat);
  fillOval(r, pat, mode, port);
}

export function FrameOval(r: Rect): void {
  callOval(FRAME, r);
}
/** Fill the oval bounded by `r` with the current pen pattern. `PROCEDURE PaintOval`. */
export function PaintOval(r: Rect): void {
  callOval(PAINT, r);
}
/** Fill the oval bounded by `r` with the background pattern. `PROCEDURE EraseOval`. */
export function EraseOval(r: Rect): void {
  callOval(ERASE, r);
}
/** Invert every pixel inside the oval bounded by `r`. `PROCEDURE InvertOval`. */
export function InvertOval(r: Rect): void {
  callOval(INVERT, r);
}
/**
 * Fill the oval bounded by `r` with the explicit pattern `pat`.
 * `PROCEDURE FillOval(r: Rect; pat: Pattern)`.
 */
export function FillOval(r: Rect, pat: Pattern): void {
  callOval(FILL, r, pat);
}

// -------------------------------------------------------------------------
// ARC routines
// -------------------------------------------------------------------------

/**
 * Draw the outline of an arc of the oval bounded by `r`.
 *
 * `startAngle` is the starting angle in degrees (0° = 12 o'clock,
 * clockwise).  `arcAngle` is the sweep in degrees; negative values sweep
 * counter-clockwise.
 *
 * `PROCEDURE FrameArc(r: Rect; startAngle, arcAngle: INTEGER)`.
 */
function callArc(
  verb: number,
  r: Rect,
  startAngle: number,
  arcAngle: number,
  fillPat?: Pattern
): void {
  const port = globals.thePort;
  if (!port) return;
  if (port.grafProcs && port.grafProcs.arcProc) {
    if (fillPat) port.fillPat = new Uint8Array(fillPat);
    port.grafProcs.arcProc(verb as any, r, startAngle, arcAngle);
    return;
  }
  StdArc(verb, r, startAngle, arcAngle, fillPat);
}

export function StdArc(
  verb: number,
  r: Rect,
  startAngle: number,
  arcAngle: number,
  fillPat?: Pattern
): void {
  const port = globals.thePort;
  if (!port) return;
  const hollow = verb === FRAME;
  const { pat, mode } = verbPat(verb, port, fillPat);

  if (Math.abs(arcAngle) >= 360) {
    // Full circle — use oval routines
    if (hollow) frameOval(r, port);
    else fillOval(r, pat, mode, port);
    return;
  }

  fillArcSector(r, startAngle, arcAngle, hollow, pat, mode, port);
}

export function FrameArc(r: Rect, startAngle: number, arcAngle: number): void {
  callArc(FRAME, r, startAngle, arcAngle);
}
/** Fill an arc sector with the current pen pattern. `PROCEDURE PaintArc`. */
export function PaintArc(r: Rect, startAngle: number, arcAngle: number): void {
  callArc(PAINT, r, startAngle, arcAngle);
}
/** Fill an arc sector with the background pattern. `PROCEDURE EraseArc`. */
export function EraseArc(r: Rect, startAngle: number, arcAngle: number): void {
  callArc(ERASE, r, startAngle, arcAngle);
}
/** Invert every pixel inside an arc sector. `PROCEDURE InvertArc`. */
export function InvertArc(r: Rect, startAngle: number, arcAngle: number): void {
  callArc(INVERT, r, startAngle, arcAngle);
}
/** Fill an arc sector with an explicit pattern. `PROCEDURE FillArc`. */
export function FillArc(
  r: Rect,
  startAngle: number,
  arcAngle: number,
  pat: Pattern
): void {
  callArc(FILL, r, startAngle, arcAngle, pat);
}

// -------------------------------------------------------------------------
// ROUNDRECT routines
// A RoundRect is drawn as a rectangle with elliptical corners.
// Corner ellipses have diameter ovWd × ovHt.
// -------------------------------------------------------------------------

function rrectOuter(r: Rect): Rect {
  return r;
}

function frameRoundRectImpl(
  r: Rect,
  ovWd: number,
  ovHt: number,
  port: GrafPort
): void {
  const pw = Math.max(1, port.pnSize.h);
  const ph = Math.max(1, port.pnSize.v);
  const rx = Math.min(ovWd / 2, (r.right - r.left) / 2);
  const ry = Math.min(ovHt / 2, (r.bottom - r.top) / 2);

  // Corner ellipses (quarter arcs) in each corner
  const corners = [
    {
      r: {
        top: r.top,
        left: r.left,
        bottom: r.top + ovHt,
        right: r.left + ovWd,
      },
      start: 180,
      arc: 90,
    },
    {
      r: {
        top: r.top,
        left: r.right - ovWd,
        bottom: r.top + ovHt,
        right: r.right,
      },
      start: 270,
      arc: 90,
    },
    {
      r: {
        top: r.bottom - ovHt,
        left: r.right - ovWd,
        bottom: r.bottom,
        right: r.right,
      },
      start: 0,
      arc: 90,
    },
    {
      r: {
        top: r.bottom - ovHt,
        left: r.left,
        bottom: r.bottom,
        right: r.left + ovWd,
      },
      start: 90,
      arc: 90,
    },
  ];
  for (const c of corners) {
    fillArcSector(c.r, c.start, c.arc, true, port.pnPat, port.pnMode, port);
  }

  // Straight edges connecting corners
  const halfOvW = Math.floor(ovWd / 2);
  const halfOvH = Math.floor(ovHt / 2);
  // Top
  drawRectToPort(
    r.left + halfOvW,
    r.top,
    r.right - halfOvW,
    r.top + ph,
    port.pnPat,
    port.pnMode,
    port
  );
  // Bottom
  drawRectToPort(
    r.left + halfOvW,
    r.bottom - ph,
    r.right - halfOvW,
    r.bottom,
    port.pnPat,
    port.pnMode,
    port
  );
  // Left
  drawRectToPort(
    r.left,
    r.top + halfOvH,
    r.left + pw,
    r.bottom - halfOvH,
    port.pnPat,
    port.pnMode,
    port
  );
  // Right
  drawRectToPort(
    r.right - pw,
    r.top + halfOvH,
    r.right,
    r.bottom - halfOvH,
    port.pnPat,
    port.pnMode,
    port
  );
}

function fillRoundRectImpl(
  r: Rect,
  ovWd: number,
  ovHt: number,
  pat: Pattern,
  mode: number,
  port: GrafPort
): void {
  const halfOvW = Math.floor(ovWd / 2);
  const halfOvH = Math.floor(ovHt / 2);

  // Fill the four corner arcs (solid quarter-ellipses)
  const corners = [
    {
      r: {
        top: r.top,
        left: r.left,
        bottom: r.top + ovHt,
        right: r.left + ovWd,
      },
      start: 180,
      arc: 90,
    },
    {
      r: {
        top: r.top,
        left: r.right - ovWd,
        bottom: r.top + ovHt,
        right: r.right,
      },
      start: 270,
      arc: 90,
    },
    {
      r: {
        top: r.bottom - ovHt,
        left: r.right - ovWd,
        bottom: r.bottom,
        right: r.right,
      },
      start: 0,
      arc: 90,
    },
    {
      r: {
        top: r.bottom - ovHt,
        left: r.left,
        bottom: r.bottom,
        right: r.left + ovWd,
      },
      start: 90,
      arc: 90,
    },
  ];
  for (const c of corners) {
    fillArcSector(c.r, c.start, c.arc, false, pat, mode, port);
  }

  // Fill the three central rectangles (cross)
  // Centre horizontal band
  drawRectToPort(
    r.left,
    r.top + halfOvH,
    r.right,
    r.bottom - halfOvH,
    pat,
    mode,
    port
  );
  // Top cap
  drawRectToPort(
    r.left + halfOvW,
    r.top,
    r.right - halfOvW,
    r.top + halfOvH,
    pat,
    mode,
    port
  );
  // Bottom cap
  drawRectToPort(
    r.left + halfOvW,
    r.bottom - halfOvH,
    r.right - halfOvW,
    r.bottom,
    pat,
    mode,
    port
  );
}

function callRRect(
  verb: number,
  r: Rect,
  ovWd: number,
  ovHt: number,
  fillPat?: Pattern
): void {
  const port = globals.thePort;
  if (!port) return;
  if (port.grafProcs && port.grafProcs.rRectProc) {
    if (fillPat) port.fillPat = new Uint8Array(fillPat);
    port.grafProcs.rRectProc(verb as any, r, ovWd, ovHt);
    return;
  }
  StdRRect(verb, r, ovWd, ovHt, fillPat);
}

/**
 * Default RoundRect rasterizer.  Called by the `Frame/Paint/…RoundRect`
 * family (or directly when bypassing the bottleneck).
 *
 * @param ovWd  Corner oval width (total diameter, not radius).
 * @param ovHt  Corner oval height.
 */
export function StdRRect(
  verb: number,
  r: Rect,
  ovWd: number,
  ovHt: number,
  fillPat?: Pattern
): void {
  const port = globals.thePort;
  if (!port) return;
  if (verb === FRAME) {
    frameRoundRectImpl(r, ovWd, ovHt, port);
    return;
  }
  const { pat, mode } = verbPat(verb, port, fillPat);
  fillRoundRectImpl(r, ovWd, ovHt, pat, mode, port);
}

/** Draw the outline of a round-cornered rectangle. `PROCEDURE FrameRoundRect`. */
export function FrameRoundRect(r: Rect, ovWd: number, ovHt: number): void {
  callRRect(FRAME, r, ovWd, ovHt);
}
/** Fill a round-cornered rectangle with the current pen pattern. `PROCEDURE PaintRoundRect`. */
export function PaintRoundRect(r: Rect, ovWd: number, ovHt: number): void {
  callRRect(PAINT, r, ovWd, ovHt);
}
/** Fill a round-cornered rectangle with the background pattern. `PROCEDURE EraseRoundRect`. */
export function EraseRoundRect(r: Rect, ovWd: number, ovHt: number): void {
  callRRect(ERASE, r, ovWd, ovHt);
}
/** Invert every pixel inside a round-cornered rectangle. `PROCEDURE InvertRoundRect`. */
export function InvertRoundRect(r: Rect, ovWd: number, ovHt: number): void {
  callRRect(INVERT, r, ovWd, ovHt);
}
/** Fill a round-cornered rectangle with an explicit pattern. `PROCEDURE FillRoundRect`. */
export function FillRoundRect(
  r: Rect,
  ovWd: number,
  ovHt: number,
  pat: Pattern
): void {
  callRRect(FILL, r, ovWd, ovHt, pat);
}
