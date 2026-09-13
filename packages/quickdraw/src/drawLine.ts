/**
 * Slanted-line slab rasteriser — `reference/QuickDraw/DrawLine.a`.
 *
 * `pnVis` is tested here only (`Lines.a:72` / `DrawLine.a:69-70`); `DoLine`
 * records into poly/rgn regardless. Mode outside 8..15 draws nothing.
 * Pen size ≤ 0 draws nothing on the slanted path. H/V lines are one rect.
 */

import type { Pattern, Point, Rect } from "./types";
import { globals, requirePort } from "./globals";
import { asInt16, FixMul, FixRatio, HiWord, type Fixed } from "./fixmath";
import { ColorMap } from "./colorMap";
import { drawRectRgnBlt, drawSlab } from "./drawArc";
import { rsect } from "./bitBltCore";

/** Mode 8..15 (`DrawLine.a:78-81`). */
function isPatMode(mode: number): boolean {
  return (mode & ~7) === 8;
}

/**
 * `slope * discard` as in the clipped-top adjust (`DrawLine.a:331-338`):
 * `MULS` of slope.hi (SWAP/CLR) plus `MULU` of slope.lo.
 */
function slopeTimesDiscard(slope: Fixed, discard: number): Fixed {
  const n = discard & 0xffff;
  const hiPart = (HiWord(slope) * asInt16(n)) | 0;
  const shifted = (hiPart & 0xffff) << 16;
  const loPart = ((slope & 0xffff) * n) >>> 0;
  return (shifted + loPart) | 0;
}

/**
 * `PROCEDURE DRAWLINE(P1, P2: POINT)` (`DrawLine.a:14-526`).
 * Does not update `pnLoc` — that is `DoLine`.
 */
export function DrawLine(p1: Point, p2: Point): void {
  const port = requirePort();
  if (port.pnVis < 0) return; // DrawLine.a:69-70
  if (!isPatMode(port.pnMode)) return; // DrawLine.a:78-81

  let mode = port.pnMode;
  let pat: Pattern = port.pnPat;
  if (port.colrBit !== 0) {
    const mapped = ColorMap(mode, pat); // DrawLine.a:88-94
    mode = mapped.mode;
    pat = mapped.pat;
  }

  const v1 = asInt16(p1.v);
  const h1 = asInt16(p1.h);
  const v2 = asInt16(p2.v);
  const h2 = asInt16(p2.h);
  const pnH = asInt16(port.pnSize.h);
  const pnV = asInt16(port.pnSize.v);

  // Bounding box of the two points, then +pen (`DrawLine.a:112-121`).
  let boxTop = v1 < v2 ? v1 : v2;
  let boxBot = v1 < v2 ? v2 : v1;
  let boxLeft = h1 < h2 ? h1 : h2;
  let boxRight = h1 < h2 ? h2 : h1;
  boxRight = (boxRight + pnH) | 0;
  boxBot = (boxBot + pnV) | 0;
  const lineRect: Rect = {
    top: boxTop,
    left: boxLeft,
    bottom: boxBot,
    right: boxRight,
  };

  const minRect = rsect([
    lineRect,
    port.portBits.bounds,
    port.clipRgn.rgn.rgnBBox,
    port.visRgn.rgn.rgnBBox,
  ]);
  if (!minRect) return; // DrawLine.a:129-136 — no portRect

  if (h1 === h2 || v1 === v2) {
    // H/V: one RgnBlt of minRect (`DrawLine.a:195-230`).
    drawRectRgnBlt(minRect, port.pnMode, port.pnPat);
    return;
  }

  // Sort by v, top → bottom (`DrawLine.a:238-240`).
  let topV = v2;
  let topH = h2;
  let botV = v1;
  let botH = h1;
  if (v1 < v2) {
    topV = v1;
    topH = h1;
    botV = v2;
    botH = h2;
  }

  const clip = port.clipRgn.rgn.rgnBBox;
  if (((botV + pnV) | 0) <= clip.top) return; // DrawLine.a:241-243
  if (topV >= clip.bottom) return; // DrawLine.a:244-245

  // LEFTEDGE = h1 + 1/2; RIGHTEDGE = LEFTEDGE + pnSize.h (`DrawLine.a:253-258`).
  let leftEdge: Fixed = ((topH << 16) | 0x8000) | 0;
  let rightEdge: Fixed = leftEdge;
  if (pnH <= 0) return; // DrawLine.a:256-257
  rightEdge = (rightEdge + (pnH << 16)) | 0;
  if (pnV <= 0) return; // DrawLine.a:259-260

  const slope = FixRatio(asInt16(botH - topH), asInt16(botV - topV));
  const adjust = FixMul((pnV << 16) | 0, slope); // DrawLine.a:279-284

  const halfSlope = slope >> 1; // ASR.L #1 (`DrawLine.a:290`)
  leftEdge = (leftEdge + halfSlope) | 0;
  rightEdge = (rightEdge + halfSlope) | 0;

  if (slope >= 0) {
    leftEdge = (leftEdge - adjust) | 0;
    if (slope >= 0x00010000) {
      rightEdge = (rightEdge - 0x10000) | 0; // LESSV1 (`DrawLine.a:303`)
    } else {
      leftEdge = (leftEdge + slope) | 0; // MOREV1 (`DrawLine.a:300`)
    }
  } else {
    rightEdge = (rightEdge - adjust) | 0;
    if (slope < -0x10000) {
      leftEdge = (leftEdge + 0x10000) | 0; // LESSV2 (`DrawLine.a:319`)
    } else {
      rightEdge = (rightEdge + slope) | 0; // MOREV2 (`DrawLine.a:316`)
    }
  }

  if (minRect.top !== lineRect.top) {
    const discard = asInt16(minRect.top - lineRect.top);
    const delta = slopeTimesDiscard(slope, discard);
    leftEdge = (leftEdge + delta) | 0;
    rightEdge = (rightEdge + delta) | 0;
  }

  for (let vert = minRect.top; vert < minRect.bottom; vert++) {
    drawSlab(HiWord(leftEdge), HiWord(rightEdge), vert, mode, pat);
    leftEdge = (leftEdge + slope) | 0;
    rightEdge = (rightEdge + slope) | 0;
  }
}
