/**
 * Unpack a region to an inversion-point list — from `PutRgn.a`.
 */

import type { Point } from "./types";
import { RGN_END, isRectRgn, type RegionData } from "./regionTypes";

/**
 * `PROCEDURE PutRgn(Rgn: RgnHandle; bufHandle: Handle; VAR index,size: INTEGER)`.
 * Appends inversion points to `dst`. `PutRgn.a:4-72`.
 */
export function PutRgn(rgn: RegionData, dst: Point[]): void {
  // Rectangular: copy bbox topleft and botright only. PutRgn.a:53-57
  if (isRectRgn(rgn)) {
    const b = rgn.rgnBBox;
    dst.push({ v: b.top | 0, h: b.left | 0 });
    dst.push({ v: b.bottom | 0, h: b.right | 0 });
    return;
  }

  // Complex: each row `V H…H 32767` becomes (V,H) pairs. PutRgn.a:60-69
  const data = rgn.data;
  let i = 0;
  while (i < data.length) {
    // MOVE.L (A0)+ — vert and first horiz. PutRgn.a:61
    const v = data[i++] | 0;
    if (v === RGN_END) break;
    let h = data[i++] | 0;
    for (;;) {
      dst.push({ v, h });
      h = data[i++] | 0;
      dst.push({ v, h });
      h = data[i++] | 0;
      if (h === RGN_END) break;
    }
    if ((data[i] | 0) === RGN_END) break;
  }
}
