/**
 * Line drawing routines — from `QuickDraw.p` Line Routines section and
 * `reference/QuickDraw/Lines.a` / `DrawLine.a` implementations.
 *
 * QuickDraw lines are drawn with the **pen**: a rectangular stamp of size
 * `pnSize` filled with `pnPat`, applied at every pixel along the Bresenham
 * path.  The pen must be visible (`pnVis >= 0`) for pixels to appear.
 */

import { Point, PenState, Pattern, GrafPort } from "./types";
import { globals } from "./globals";
import { drawPixelToPort, drawRectToPort } from "./bitblt";

// -------------------------------------------------------------------------
// Pen visibility
// -------------------------------------------------------------------------

/**
 * Decrement the pen visibility counter.  When `pnVis < 0` the pen is
 * invisible and line/move operations update the position without drawing.
 * `PROCEDURE HidePen`.
 */
export function HidePen(): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnVis--;
}

/**
 * Increment the pen visibility counter.  The pen becomes visible when
 * `pnVis >= 0`.  `PROCEDURE ShowPen`.
 */
export function ShowPen(): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnVis++;
}

// -------------------------------------------------------------------------
// Pen state inquiry / modification
// -------------------------------------------------------------------------

/**
 * Copy the current pen position into `pt`.
 * `PROCEDURE GetPen(VAR pt: Point)`.
 */
export function GetPen(pt: Point): void {
  const port = globals.thePort;
  if (!port) return;
  pt.h = port.pnLoc.h;
  pt.v = port.pnLoc.v;
}

/**
 * Save the complete pen state (location, size, mode, pattern) into `pnState`.
 * `PROCEDURE GetPenState(VAR pnState: PenState)`.
 */
export function GetPenState(pnState: PenState): void {
  const port = globals.thePort;
  if (!port) return;
  pnState.pnLoc = { h: port.pnLoc.h, v: port.pnLoc.v };
  pnState.pnSize = { h: port.pnSize.h, v: port.pnSize.v };
  pnState.pnMode = port.pnMode;
  pnState.pnPat = new Uint8Array(port.pnPat);
}

/**
 * Restore the pen state previously saved by {@link GetPenState}.
 * `PROCEDURE SetPenState(pnState: PenState)`.
 */
export function SetPenState(pnState: PenState): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnLoc = { h: pnState.pnLoc.h, v: pnState.pnLoc.v };
  port.pnSize = { h: pnState.pnSize.h, v: pnState.pnSize.v };
  port.pnMode = pnState.pnMode;
  port.pnPat = new Uint8Array(pnState.pnPat);
}

/**
 * Set the pen size to `width × height` pixels.
 * `PROCEDURE PenSize(width, height: INTEGER)`.
 */
export function PenSize(width: number, height: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnSize.h = width;
  port.pnSize.v = height;
}

/**
 * Set the pen transfer mode (e.g. `patCopy`, `patXor`).
 * `PROCEDURE PenMode(mode: INTEGER)`.
 */
export function PenMode(mode: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnMode = mode;
}

/**
 * Set the pen pattern.
 * `PROCEDURE PenPat(pat: Pattern)`.
 */
export function PenPat(pat: Pattern): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnPat = new Uint8Array(pat);
}

/**
 * Reset the pen to its default state: 1×1 pixels, `patCopy` mode, black
 * pattern.  `PROCEDURE PenNormal`.
 */
export function PenNormal(): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnSize = { h: 1, v: 1 };
  port.pnMode = 8; // patCopy
  port.pnPat = new Uint8Array(globals.black);
}

// -------------------------------------------------------------------------
// Movement
// -------------------------------------------------------------------------

/**
 * Move the pen to absolute position `(h, v)` **without drawing**.
 * `PROCEDURE MoveTo(h, v: INTEGER)`.
 */
export function MoveTo(h: number, v: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnLoc.h = h;
  port.pnLoc.v = v;
}

/**
 * Move the pen by `(dh, dv)` relative to its current position, without
 * drawing.  `PROCEDURE Move(dh, dv: INTEGER)`.
 */
export function Move(dh: number, dv: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.pnLoc.h += dh;
  port.pnLoc.v += dv;
}

// -------------------------------------------------------------------------
// Line drawing
// -------------------------------------------------------------------------

/**
 * Draw a line from the current pen position to `(h, v)`, then move the pen
 * to `(h, v)`.
 *
 * Routes through the port's `grafProcs.lineProc` bottleneck if installed,
 * otherwise calls {@link StdLine}.
 *
 * `PROCEDURE LineTo(h, v: INTEGER)`.
 */
export function LineTo(h: number, v: number): void {
  const port = globals.thePort;
  if (!port) return;

  // Route through grafProcs bottleneck if installed
  if (port.grafProcs && port.grafProcs.lineProc) {
    const saved = { h: port.pnLoc.h, v: port.pnLoc.v };
    port.grafProcs.lineProc({ h, v });
    port.pnLoc.h = h;
    port.pnLoc.v = v;
    return;
  }

  StdLine(port, { h, v });
}

/**
 * Draw a line of length `(dh, dv)` from the current pen position.
 * `PROCEDURE Line(dh, dv: INTEGER)`.
 */
export function Line(dh: number, dv: number): void {
  const port = globals.thePort;
  if (!port) return;
  LineTo(port.pnLoc.h + dh, port.pnLoc.v + dv);
}

// -------------------------------------------------------------------------
// StdLine — actual Bresenham line rasterizer
// -------------------------------------------------------------------------

/**
 * Default line rasterizer — draws a Bresenham line from `port.pnLoc` to
 * `newPt` using the current pen size, pattern and mode, then updates
 * `port.pnLoc`.
 *
 * If `port.pnVis < 0` the pen is hidden: the position is updated but no
 * pixels are written.
 *
 * Matches the behaviour of `reference/QuickDraw/DrawLine.a`.
 *
 * @param port   The port to draw into.
 * @param newPt  The destination point.
 */
export function StdLine(port: GrafPort, newPt: Point): void {
  if (port.pnVis < 0) {
    port.pnLoc.h = newPt.h;
    port.pnLoc.v = newPt.v;
    return;
  }

  const x0 = port.pnLoc.h;
  const y0 = port.pnLoc.v;
  const x1 = newPt.h;
  const y1 = newPt.v;
  const pw = Math.max(1, port.pnSize.h);
  const ph = Math.max(1, port.pnSize.v);

  drawBresenhamLine(x0, y0, x1, y1, pw, ph, port);

  port.pnLoc.h = x1;
  port.pnLoc.v = y1;
}

// Bresenham integer line algorithm — matches the original DrawLine.a behaviour
function drawBresenhamLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  pw: number,
  ph: number,
  port: GrafPort
): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  const drawPen = (px: number, py: number) => {
    drawRectToPort(px, py, px + pw, py + ph, port.pnPat, port.pnMode, port);
  };

  while (true) {
    drawPen(x, y);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}
