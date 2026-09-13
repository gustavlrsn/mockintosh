/**
 * Oval / RoundRect / Arc bottlenecks — `Ovals.a`, `RRects.a`, `Arcs.a`.
 *
 * Each `Std*` writes picture/region later (Phase 5) and then calls
 * `DrawArc` once. FRAME is hollow; every other verb is solid.
 * Mode and pattern come from `PushVerb` (`Rects.a:69-104`).
 *
 * Angles are degrees, 0° at 12 o'clock, increasing clockwise.
 */

import type { GrafPort, Pattern, Rect } from "./types";
import { globals, requirePort } from "./globals";
import { asInt16 } from "./fixmath";
import { ERASE, FILL, FRAME, INVERT, PAINT } from "./constants";
import { DrawArc } from "./drawArc";
import { PushVerb } from "./rects";
import { PutOval } from "./putOval";
import {
  CheckPic,
  PutPicByte,
  PutPicRect,
  PutPicVerb,
  PutPicWord,
} from "./picSave";

export { PtToAngle } from "./angles";

function ovalSize(r: Rect): { ovWd: number; ovHt: number } {
  return {
    ovWd: asInt16(asInt16(r.right) - asInt16(r.left)),
    ovHt: asInt16(asInt16(r.bottom) - asInt16(r.top)),
  };
}

function writeFillPat(port: GrafPort, fillPat?: Pattern): void {
  if (fillPat) port.fillPat = new Uint8Array(fillPat);
}

/**
 * `PROCEDURE StdOval(verb: GrafVerb; r: Rect)` (`Ovals.a:15-80`).
 * `ovWd/ovHt` are the dest rect's width and height.
 */
export function StdOval(verb: number, r: Rect, fillPat?: Pattern): void {
  const port = requirePort();
  writeFillPat(port, fillPat);
  if (CheckPic()) {
    PutPicVerb(verb);
    PutPicRect(0x50 + verb, r);
  }
  const { ovWd, ovHt } = ovalSize(r);
  if (verb === FRAME && port.rgnSave) {
    if (!globals.rgnBuf) globals.rgnBuf = [];
    PutOval(r, ovWd, ovHt, globals.rgnBuf);
  }
  const { mode, pat } = PushVerb(verb);
  DrawArc(r, verb === FRAME, ovWd, ovHt, mode, pat, 0, 360);
}

function callOval(verb: number, r: Rect, fillPat?: Pattern): void {
  const port = requirePort();
  writeFillPat(port, fillPat);
  if (port.grafProcs?.ovalProc) {
    port.grafProcs.ovalProc(verb as 0 | 1 | 2 | 3 | 4, r);
    return;
  }
  StdOval(verb, r);
}

/** Draw the outline of the oval bounded by `r`. `PROCEDURE FrameOval`. */
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

/**
 * `PROCEDURE StdRRect(verb; r; ovWd, ovHt)` (`RRects.a:19-87`).
 * One `DrawArc` pass; corner diameters are the caller’s oval size.
 */
export function StdRRect(
  verb: number,
  r: Rect,
  ovWd: number,
  ovHt: number,
  fillPat?: Pattern
): void {
  const port = requirePort();
  writeFillPat(port, fillPat);
  if (CheckPic()) {
    PutPicVerb(verb);
    const s = port.picSave!;
    const ov = { h: asInt16(ovWd), v: asInt16(ovHt) };
    if (asInt16(s.picOvSize.h) !== ov.h || asInt16(s.picOvSize.v) !== ov.v) {
      s.picOvSize = ov;
      PutPicByte(0x0b);
      PutPicWord(ov.v);
      PutPicWord(ov.h);
    }
    PutPicRect(0x40 + verb, r);
  }
  if (verb === FRAME && port.rgnSave) {
    if (!globals.rgnBuf) globals.rgnBuf = [];
    PutOval(r, ovWd, ovHt, globals.rgnBuf);
  }
  const { mode, pat } = PushVerb(verb);
  DrawArc(r, verb === FRAME, ovWd, ovHt, mode, pat, 0, 360);
}

function callRRect(
  verb: number,
  r: Rect,
  ovWd: number,
  ovHt: number,
  fillPat?: Pattern
): void {
  const port = requirePort();
  writeFillPat(port, fillPat);
  if (port.grafProcs?.rRectProc) {
    port.grafProcs.rRectProc(verb as 0 | 1 | 2 | 3 | 4, r, ovWd, ovHt);
    return;
  }
  StdRRect(verb, r, ovWd, ovHt);
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

/**
 * `PROCEDURE StdArc(verb; r; startAngle, arcAngle)` (`Arcs.a:17-81`).
 * Oval size is the dest rect; FRAME is hollow.
 */
export function StdArc(
  verb: number,
  r: Rect,
  startAngle: number,
  arcAngle: number,
  fillPat?: Pattern
): void {
  const port = requirePort();
  writeFillPat(port, fillPat);
  if (CheckPic()) {
    PutPicVerb(verb);
    PutPicRect(0x60 + verb, r);
    PutPicWord(startAngle);
    PutPicWord(arcAngle);
  }
  const { ovWd, ovHt } = ovalSize(r);
  const { mode, pat } = PushVerb(verb);
  DrawArc(r, verb === FRAME, ovWd, ovHt, mode, pat, startAngle, arcAngle);
}

function callArc(
  verb: number,
  r: Rect,
  startAngle: number,
  arcAngle: number,
  fillPat?: Pattern
): void {
  const port = requirePort();
  writeFillPat(port, fillPat);
  if (port.grafProcs?.arcProc) {
    port.grafProcs.arcProc(verb as 0 | 1 | 2 | 3 | 4, r, startAngle, arcAngle);
    return;
  }
  StdArc(verb, r, startAngle, arcAngle);
}

/** Draw the outline of an arc of the oval bounded by `r`. `PROCEDURE FrameArc`. */
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
