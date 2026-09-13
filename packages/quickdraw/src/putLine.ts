/**
 * Line → inversion points — `reference/QuickDraw/PutLine.a`.
 *
 * Vertical lines are ignored. The path is the 1-pixel centre line (not the
 * pen-sized slab). Horizontal lines contribute their two endpoints.
 */

import type { Point } from "./types";
import { asInt16, FixRatio, HiWord, type Fixed } from "./fixmath";

/**
 * `PROCEDURE PutLine(pt1, pt2: Point; dst: Handle; VAR index, bufMax)`
 * (`PutLine.a:11-202`), writing `{v,h}` inversion points into `dst`.
 */
export function PutLine(pt1: Point, pt2: Point, dst: Point[]): void {
  const h1 = asInt16(pt1.h);
  const h2 = asInt16(pt2.h);
  if (h1 === h2) return; // PutLine.a:37-40 — vertical ignored

  let v1 = asInt16(pt1.v);
  let v2 = asInt16(pt2.v);

  if (v1 === v2) {
    dst.push({ v: v1, h: h1 }); // PutLine.a:94-97
    dst.push({ v: v2, h: h2 });
    return;
  }

  let topV = v1;
  let topH = h1;
  let botV = v2;
  let botH = h2;
  if (v2 < v1) {
    topV = v2; // PutLine.a:108-111
    topH = h2;
    botV = v1;
    botH = h1;
  }

  const slope = FixRatio(asInt16(botH - topH), asInt16(botV - topV));

  // horiz = topH + 1/2 + slope/2 (`PutLine.a:131-139`).
  let horiz: Fixed = ((topH << 16) | 0x8000) | 0;
  horiz = (horiz + (slope >> 1)) | 0;

  if (slope >= 0) {
    if (slope < 0x00010000) {
      horiz = (horiz + slope) | 0; // PutLine.a:146-148
    }
  } else if (slope < -0x10000) {
    horiz = (horiz + 0x00010000) | 0; // PutLine.a:151-153
  }

  let oldH = topH;
  let v = topV;
  while (v !== botV) {
    const hInt = HiWord(horiz);
    if (hInt !== oldH) {
      dst.push({ v, h: oldH }); // PutLine.a:167-171
      oldH = hInt;
      dst.push({ v, h: oldH });
    }
    v = asInt16(v + 1);
    horiz = (horiz + slope) | 0;
  }

  if (oldH !== botH) {
    dst.push({ v, h: oldH }); // PutLine.a:183-188
    dst.push({ v, h: botH });
  }
}
