/**
 * Line drawing routines — from `QuickDraw.p` Line Routines section and
 * `reference/QuickDraw/Lines.a` / `DrawLine.a` implementations.
 *
 * QuickDraw lines are drawn with the **pen**: a rectangular stamp of size
 * `pnSize` filled with `pnPat`, applied at every pixel along the Bresenham
 * path.  The pen must be visible (`pnVis >= 0`) for pixels to appear.
 */

import { Point, PenState, Pattern } from "./types";
import { globals, requirePort } from "./globals";
import { asInt16 } from "./fixmath";
import { DrawLine } from "./drawLine";
import { PutLine } from "./putLine";
import {
  CheckPic,
  PutPicByte,
  PutPicVerb,
  PutPicWord,
  ptsEqual,
} from "./picSave";
import { FRAME } from "./constants";

function fitsSignedByte(n: number): boolean {
  const w = asInt16(n);
  return ((w << 24) >> 24) === w;
}

// -------------------------------------------------------------------------
// Pen visibility
// -------------------------------------------------------------------------

/**
 * Decrement the pen visibility counter.  When `pnVis < 0` the pen is
 * invisible and line/move operations update the position without drawing.
 * `PROCEDURE HidePen`.
 */
export function HidePen(): void {
  const port = requirePort();
  port.pnVis--;
}

/**
 * Increment the pen visibility counter.  The pen becomes visible when
 * `pnVis >= 0`.  `PROCEDURE ShowPen`.
 */
export function ShowPen(): void {
  const port = requirePort();
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
  const port = requirePort();
  pt.h = port.pnLoc.h;
  pt.v = port.pnLoc.v;
}

/**
 * Save the complete pen state (location, size, mode, pattern) into `pnState`.
 * `PROCEDURE GetPenState(VAR pnState: PenState)`.
 */
export function GetPenState(pnState: PenState): void {
  const port = requirePort();
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
  const port = requirePort();
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
  const port = requirePort();
  port.pnSize.h = width;
  port.pnSize.v = height;
}

/**
 * Set the pen transfer mode (e.g. `patCopy`, `patXor`).
 * `PROCEDURE PenMode(mode: INTEGER)`.
 */
export function PenMode(mode: number): void {
  const port = requirePort();
  port.pnMode = mode;
}

/**
 * Set the pen pattern.
 * `PROCEDURE PenPat(pat: Pattern)`.
 */
export function PenPat(pat: Pattern): void {
  const port = requirePort();
  port.pnPat = new Uint8Array(pat);
}

/**
 * Reset the pen to its default state: 1×1 pixels, `patCopy` mode, black
 * pattern.  `PROCEDURE PenNormal`.
 */
export function PenNormal(): void {
  const port = requirePort();
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
  const port = requirePort();
  port.pnLoc.h = h;
  port.pnLoc.v = v;
}

/**
 * Move the pen by `(dh, dv)` relative to its current position, without
 * drawing.  `PROCEDURE Move(dh, dv: INTEGER)`.
 */
export function Move(dh: number, dv: number): void {
  const port = requirePort();
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
  const port = requirePort();
  if (port.grafProcs?.lineProc) {
    port.grafProcs.lineProc({ h, v });
    return;
  }
  StdLine({ h, v });
}

/**
 * Draw a line of length `(dh, dv)` from the current pen position.
 * `PROCEDURE Line(dh, dv: INTEGER)`.
 */
export function Line(dh: number, dv: number): void {
  const port = requirePort();
  LineTo(port.pnLoc.h + dh, port.pnLoc.v + dv);
}

// -------------------------------------------------------------------------
// StdLine — actual Bresenham line rasterizer
// -------------------------------------------------------------------------

/**
 * `PROCEDURE StdLine(newPt: Point)` (`Lines.a:19-93`).
 * Records `$20–$23` when a picture is open, then {@link DoLine}.
 */
export function StdLine(newPt: Point): void {
  const port = requirePort();
  if (CheckPic()) {
    const s = port.picSave!;
    PutPicVerb(FRAME);
    let op = 0x20;
    if (ptsEqual(port.pnLoc, s.picPnLoc)) op += 1;
    const dh = asInt16(newPt.h - port.pnLoc.h);
    const dv = asInt16(newPt.v - port.pnLoc.v);
    if (fitsSignedByte(dh) && fitsSignedByte(dv)) op += 2;
    PutPicByte(op);
    if ((op & 1) === 0) {
      PutPicWord(port.pnLoc.v);
      PutPicWord(port.pnLoc.h);
    }
    if (op & 2) {
      PutPicByte(dh);
      PutPicByte(dv);
    } else {
      PutPicWord(newPt.v);
      PutPicWord(newPt.h);
    }
    s.picPnLoc = { h: newPt.h, v: newPt.v };
  }
  DoLine(newPt);
}

/**
 * `PROCEDURE DoLine(newPt: Point)` (`Lines.a:159-213`).
 * Poly/rgn append, then {@link DrawLine}, then `pnLoc := newPt`.
 * Called by {@link StdLine} and by `FrPoly` (so framing a poly into a
 * picture does not emit `$20–$23` per edge).
 */
export function DoLine(newPt: Point): void {
  const port = requirePort();
  const from = { h: port.pnLoc.h, v: port.pnLoc.v };
  if (port.polySave && globals.thePoly) {
    const p = globals.thePoly.poly;
    if ((p.polySize | 0) === 10) {
      p.polyPoints.push({ h: from.h, v: from.v });
      p.polySize = 14;
    }
    p.polyPoints.push({ h: newPt.h, v: newPt.v });
    p.polySize = (p.polySize | 0) + 4;
  } else if (port.rgnSave) {
    if (!globals.rgnBuf) globals.rgnBuf = [];
    PutLine(from, newPt, globals.rgnBuf);
  }
  DrawLine(from, newPt);
  port.pnLoc.h = newPt.h;
  port.pnLoc.v = newPt.v;
}
