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

import { Rect, Pattern, GrafPort } from "./types";
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
import { SlopeFromAngle, AngleFromSlope } from "./angles";
import { FixMul, FixRatio, LongMul } from "./fixmath";
import type { Fixed } from "./fixmath";

// -------------------------------------------------------------------------
// Oval state record (DrawArc.a InitOval/BumpOval)
// -------------------------------------------------------------------------

const ONEHALF: Fixed = 0x00008000;

export interface OvalRec {
  ovalTop: number;
  ovalBot: number;
  ovalY: number;
  rsqysq: number;
  squareHi: number;
  squareLo: number;
  oddNumHi: number;
  oddNumLo: number;
  oddBumpHi: number;
  oddBumpLo: number;
  leftEdge: Fixed;
  rightEdge: Fixed;
  oneHalf: Fixed;
}

export function initOval(
  dstRect: Rect,
  ovalWidth: number,
  ovalHeight: number,
  oval: OvalRec
): void {
  oval.ovalTop = dstRect.top;
  oval.ovalBot = dstRect.bottom;
  if (ovalWidth < 0) ovalWidth = 0;
  if (ovalHeight < 0) ovalHeight = 0;
  const dstWidth = dstRect.right - dstRect.left;
  const dstHeight = dstRect.bottom - dstRect.top;
  if (ovalWidth > dstWidth) ovalWidth = dstWidth;
  if (ovalHeight > dstHeight) ovalHeight = dstHeight;

  const centerH = (dstRect.left + dstRect.right) >> 1;
  let leftEdge: Fixed = (centerH << 16) | 0;
  let rightEdge: Fixed = (centerH << 16) | 0;
  rightEdge = (rightEdge + ONEHALF) | 0;
  oval.leftEdge = leftEdge;
  oval.rightEdge = rightEdge;
  oval.oneHalf = ONEHALF;

  oval.ovalY = 1 - ovalHeight;
  oval.rsqysq = 2 * ovalHeight - 1;
  oval.squareHi = 0;
  oval.squareLo = 0;

  const aspect = FixRatio(ovalHeight, ovalWidth);
  const { hiLong: oddHi, loLong: oddLo } = LongMul(aspect, aspect);
  oval.oddNumHi = oddHi;
  oval.oddNumLo = oddLo;
  const hiCarry = oddLo >>> 0 >= 0x80000000 ? 1 : 0;
  oval.oddBumpLo = (oddLo << 1) | 0;
  oval.oddBumpHi = ((oddHi << 1) + hiCarry) | 0;
}

export function bumpOval(oval: OvalRec, vert: number): void {
  if (vert < oval.ovalTop || vert >= oval.ovalBot) return;
  const ovalY = oval.ovalY;
  oval.ovalY += 2;
  let rsqysq = oval.rsqysq;
  let squareHi = oval.squareHi;
  let squareLo = oval.squareLo;
  let oddNumHi = oval.oddNumHi;
  let oddNumLo = oval.oddNumLo;
  const oddBumpHi = oval.oddBumpHi;
  const oddBumpLo = oval.oddBumpLo;
  let leftEdge = oval.leftEdge;
  let rightEdge = oval.rightEdge;

  while (squareHi < rsqysq) {
    rightEdge = (rightEdge + ONEHALF) | 0;
    leftEdge = (leftEdge - ONEHALF) | 0;
    const sumLo = (squareLo + oddNumLo) | 0;
    const carry = (squareLo >>> 0) + (oddNumLo >>> 0) > 0xffffffff ? 1 : 0;
    squareLo = sumLo;
    squareHi = (squareHi + oddNumHi + carry) | 0;
    const oddSumLo = (oddNumLo + oddBumpLo) | 0;
    const oddCarry = (oddNumLo >>> 0) + (oddBumpLo >>> 0) > 0xffffffff ? 1 : 0;
    oddNumLo = oddSumLo;
    oddNumHi = (oddNumHi + oddBumpHi + oddCarry) | 0;
  }
  while (squareHi > rsqysq) {
    rightEdge = (rightEdge - ONEHALF) | 0;
    leftEdge = (leftEdge + ONEHALF) | 0;
    oddNumLo = (oddNumLo - oddBumpLo) | 0;
    const oddBorrow = oddNumLo >>> 0 < oddBumpLo >>> 0 ? 1 : 0;
    oddNumHi = (oddNumHi - oddBumpHi - oddBorrow) | 0;
    squareLo = (squareLo - oddNumLo) | 0;
    const sqBorrow = squareLo >>> 0 < oddNumLo >>> 0 ? 1 : 0;
    squareHi = (squareHi - oddNumHi - sqBorrow) | 0;
  }

  const oy1 = ovalY + 1;
  rsqysq = (rsqysq - 4 * oy1) | 0;
  oval.rsqysq = rsqysq;
  oval.squareHi = squareHi;
  oval.squareLo = squareLo;
  oval.oddNumHi = oddNumHi;
  oval.oddNumLo = oddNumLo;
  oval.leftEdge = leftEdge;
  oval.rightEdge = rightEdge;
}

function fixedToInt(x: Fixed): number {
  return x >> 16;
}

// -------------------------------------------------------------------------
// DrawArc-style scanline loop (oval + optional arc rays)
// -------------------------------------------------------------------------

function drawArcLoop(
  r: Rect,
  ovalWidth: number,
  ovalHeight: number,
  hollow: boolean,
  arcAngle: number,
  startAngle: number,
  stopAngle: number,
  pat: Pattern,
  mode: number,
  port: GrafPort
): void {
  const minRect = r;
  const outerOval: OvalRec = {
    ovalTop: 0,
    ovalBot: 0,
    ovalY: 0,
    rsqysq: 0,
    squareHi: 0,
    squareLo: 0,
    oddNumHi: 0,
    oddNumLo: 0,
    oddBumpHi: 0,
    oddBumpLo: 0,
    leftEdge: 0,
    rightEdge: 0,
    oneHalf: ONEHALF,
  };
  initOval(r, ovalWidth, ovalHeight, outerOval);

  let innerOval: OvalRec | null = null;
  if (hollow) {
    const pw = Math.max(1, port.pnSize.h);
    const ph = Math.max(1, port.pnSize.v);
    const innerTop = r.top + ph;
    const innerBottom = r.bottom - ph;
    const innerLeft = r.left + pw;
    const innerRight = r.right - pw;
    if (innerLeft < innerRight && innerTop < innerBottom) {
      innerOval = {
        ovalTop: innerTop,
        ovalBot: innerBottom,
        ovalY: 0,
        rsqysq: 0,
        squareHi: 0,
        squareLo: 0,
        oddNumHi: 0,
        oddNumLo: 0,
        oddBumpHi: 0,
        oddBumpLo: 0,
        leftEdge: 0,
        rightEdge: 0,
        oneHalf: ONEHALF,
      };
      initOval(
        {
          top: innerTop,
          left: innerLeft,
          bottom: innerBottom,
          right: innerRight,
        },
        Math.max(0, ovalWidth - 2 * pw),
        Math.max(0, ovalHeight - 2 * ph),
        innerOval
      );
    }
  }

  const width = r.right - r.left;
  const height = r.bottom - r.top;
  const midVert = (r.top + r.bottom) >> 1;
  const midHoriz = (r.left + r.right) >> 1;
  const skipTop = outerOval.ovalTop + (ovalHeight >> 1);
  const skipBot = r.bottom - r.top - ovalHeight + skipTop;

  let line1: Fixed = 0;
  let line2: Fixed = 0;
  let slope1: Fixed = 0;
  let slope2: Fixed = 0;
  let flag1 = 0;
  let flag2 = 0;
  let skipFlag = false;
  const isArc = arcAngle < 360;

  if (isArc) {
    const aspect = FixRatio(width, height);
    slope1 = FixMul(SlopeFromAngle(startAngle), aspect);
    slope2 = FixMul(SlopeFromAngle(stopAngle), aspect);
    const midH64 = (midHoriz << 16) | 0;
    const halfHt = height >> 1;
    line1 = (midH64 - slope1 * halfHt) | 0;
    line2 = (midH64 - slope2 * halfHt) | 0;
    flag1 = startAngle < 180 ? startAngle - 90 : -(270 - startAngle);
    flag2 = stopAngle < 180 ? stopAngle - 90 : -(270 - stopAngle);
    if (arcAngle > 180) {
      skipFlag = false;
    } else if (arcAngle < 180) {
      skipFlag = flag1 >= 0 && flag2 >= 0;
    } else {
      skipFlag = startAngle === 90;
    }
  }

  let vert = outerOval.ovalTop;
  const bottom = outerOval.ovalBot;

  while (vert < bottom) {
    const doBump = vert < skipTop || vert >= skipBot;
    if (doBump) {
      bumpOval(outerOval, vert);
      if (innerOval) bumpOval(innerOval, vert);
    }

    if (isArc && vert === midVert) {
      flag1 = -flag1;
      flag2 = -flag2;
      skipFlag = false;
      if (arcAngle > 180) {
      } else if (arcAngle < 180) {
        if (flag1 >= 0 && flag2 >= 0) break;
      } else {
        if (startAngle === 270) break;
      }
      const t1 = line1;
      line1 = line2;
      line2 = t1;
      const t2 = slope1;
      slope1 = slope2;
      slope2 = t2;
    }

    if (vert < minRect.top || skipFlag) {
      line1 = (line1 + slope1) | 0;
      line2 = (line2 + slope2) | 0;
      vert++;
      continue;
    }

    let outerLeft = fixedToInt(outerOval.leftEdge);
    let outerRight = fixedToInt(outerOval.rightEdge);
    const line1Int = fixedToInt(line1);
    const line2Int = fixedToInt(line2);

    if (isArc) {
      if (flag1 < 0 && line1Int > outerLeft) outerLeft = line1Int;
      if (flag2 < 0 && line2Int < outerRight) outerRight = line2Int;
    }

    if (!isArc) {
      if (!innerOval) {
        if (outerLeft < outerRight)
          drawHSpan(outerLeft, outerRight, vert, pat, mode, port);
      } else {
        const il = fixedToInt(innerOval.leftEdge);
        const ir = fixedToInt(innerOval.rightEdge);
        if (outerLeft < il) drawHSpan(outerLeft, il, vert, pat, mode, port);
        if (ir < outerRight) drawHSpan(ir, outerRight, vert, pat, mode, port);
      }
    } else {
      if (!innerOval) {
        if (outerLeft < outerRight) {
          drawHSpan(outerLeft, outerRight, vert, pat, mode, port);
        } else if (flag1 < 0 && flag2 < 0 && arcAngle > 180) {
          const oL = fixedToInt(outerOval.leftEdge);
          const oR = fixedToInt(outerOval.rightEdge);
          drawHSpan(oL, outerRight, vert, pat, mode, port);
          drawHSpan(outerLeft, oR, vert, pat, mode, port);
        }
      } else {
        let innerLeft = fixedToInt(innerOval.leftEdge);
        let innerRight = fixedToInt(innerOval.rightEdge);
        if (flag2 < 0 && line2Int < innerLeft) innerLeft = line2Int;
        if (flag1 < 0 && line1Int > innerRight) innerRight = line1Int;
        if (outerLeft < outerRight) {
          drawHSpan(outerLeft, innerLeft, vert, pat, mode, port);
          drawHSpan(innerRight, outerRight, vert, pat, mode, port);
        } else if (flag1 < 0 && flag2 < 0 && arcAngle > 180) {
          if (innerLeft === outerRight) {
            drawHSpan(
              fixedToInt(innerOval.leftEdge),
              innerLeft,
              vert,
              pat,
              mode,
              port
            );
          }
          drawHSpan(
            fixedToInt(outerOval.leftEdge),
            innerLeft,
            vert,
            pat,
            mode,
            port
          );
          drawHSpan(
            innerRight,
            fixedToInt(outerOval.rightEdge),
            vert,
            pat,
            mode,
            port
          );
        }
      }
    }

    line1 = (line1 + slope1) | 0;
    line2 = (line2 + slope2) | 0;
    vert++;
  }
}

function fillOval(r: Rect, pat: Pattern, mode: number, port: GrafPort): void {
  const w = r.right - r.left;
  const h = r.bottom - r.top;
  if (w <= 0 || h <= 0) return;
  drawArcLoop(r, w, h, false, 360, 0, 360, pat, mode, port);
}

function frameOval(r: Rect, port: GrafPort): void {
  const w = r.right - r.left;
  const h = r.bottom - r.top;
  if (w <= 0 || h <= 0) return;
  drawArcLoop(r, w, h, true, 360, 0, 360, port.pnPat, port.pnMode, port);
}

function fillArcSector(
  r: Rect,
  startAngle: number,
  arcAngle: number,
  hollow: boolean,
  pat: Pattern,
  mode: number,
  port: GrafPort
): void {
  const w = r.right - r.left;
  const h = r.bottom - r.top;
  if (w <= 0 || h <= 0) return;
  let start = startAngle % 360;
  if (start < 0) start += 360;
  let stop = (start + arcAngle) % 360;
  if (stop < 0) stop += 360;
  drawArcLoop(r, w, h, hollow, arcAngle, start, stop, pat, mode, port);
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
 * centre of `r` to point `pt`, and store the result in `angle.value`.
 * Uses aspect-correct slope and AngleFromSlope table (Angles.a PtToAngle).
 *
 * `PROCEDURE PtToAngle(r: Rect; pt: Point; VAR angle: INTEGER)`.
 */
export function PtToAngle(
  r: Rect,
  pt: { v: number; h: number },
  angle: { value: number }
): void {
  const centerV = (r.top + r.bottom) >> 1;
  const centerH = (r.left + r.right) >> 1;
  const dv = pt.v - centerV;
  const dh = pt.h - centerH;
  if (dh === 0) {
    angle.value = dv <= 0 ? 0 : 180;
    return;
  }
  const slope = FixRatio(dh, dv);
  const height = r.bottom - r.top;
  const width = r.right - r.left;
  const aspect = FixRatio(height, width);
  const slope2 = FixMul(slope, aspect);
  let deg = AngleFromSlope(slope2);
  if (dh < 0) deg += 180;
  if (deg === 360) deg = 0;
  angle.value = deg;
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

  if (arcAngle === 0) return;
  let sa = startAngle;
  let aa = arcAngle;
  if (aa < 0) {
    sa += aa;
    aa = -aa;
  }
  if (aa >= 360) {
    if (hollow) frameOval(r, port);
    else fillOval(r, pat, mode, port);
    return;
  }
  fillArcSector(r, sa, aa, hollow, pat, mode, port);
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
