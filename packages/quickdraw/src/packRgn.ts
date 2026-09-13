/**
 * Pack a sorted inversion-point list into a region — from `PackRgn.a`.
 *
 * Output form (`PackRgn.a:13-19`):
 *   rgnSize, rgnBBox, then `V H…H 32767` rows, terminated by `V=32767`.
 * `rgnSize == 10` ⇔ rectangular (no data / empty data).
 */

import type { Point } from "./types";
import { RGN_END, type RegionData } from "./regionTypes";

/**
 * `PROCEDURE PackRgn(srcHandle: Handle; nPoints: INTEGER; dstRgn: RgnHandle)`.
 * Writes `rgnSize`, `rgnBBox`, and `data` into `dst`. `PackRgn.a:4-154`.
 */
export function PackRgn(src: Point[], dst: RegionData): void;
export function PackRgn(src: Point[], nPoints: number, dst: RegionData): void;
export function PackRgn(
  src: Point[],
  nPointsOrDst: number | RegionData,
  dstArg?: RegionData
): void {
  const nPoints = typeof nPointsOrDst === "number" ? nPointsOrDst : src.length;
  const dst = typeof nPointsOrDst === "number" ? dstArg! : nPointsOrDst;
  let rgnSize = 10;
  let top = 0;
  let left = 0;
  let bottom = 0;
  let right = 0;
  let data: Int16Array = new Int16Array(0);

  // PackRgn.a:54-59 — <4 empty, ==4 rectangular
  if (nPoints > 4) {
    const first = src[0]!;
    const last = src[nPoints - 1]!;
    top = first.v | 0;
    let minH = first.h | 0;
    let maxH = minH;
    // Scan every point for bbox left/right. PackRgn.a:70-81
    for (let i = 0; i < nPoints; i++) {
      const h = src[i]!.h | 0;
      if (h < minH) minH = h;
      else if (h > maxH) maxH = h;
    }
    left = minH;
    right = maxH;
    bottom = last.v | 0;

    // Pack rows: V H…H 32767, then final V=32767. PackRgn.a:108-122
    const words: number[] = [];
    let v = src[0]!.v | 0;
    words.push(v);
    words.push(src[0]!.h | 0);
    for (let i = 1; i < nPoints; i++) {
      const pv = src[i]!.v | 0;
      const ph = src[i]!.h | 0;
      if (pv !== v) {
        words.push(RGN_END);
        v = pv;
        words.push(v);
      }
      words.push(ph);
    }
    words.push(RGN_END);
    words.push(RGN_END);
    data = Int16Array.from(words);
    rgnSize = 10 + data.length * 2;
  } else if (nPoints === 4) {
    // BBox = first topleft, fourth botright. PackRgn.a:57-58
    const a = src[0]!;
    const b = src[3]!;
    top = a.v | 0;
    left = a.h | 0;
    bottom = b.v | 0;
    right = b.h | 0;
  }
  // nPoints < 4: empty (0,0,0,0), rgnSize 10. PackRgn.a:51-56

  dst.rgnSize = rgnSize;
  dst.rgnBBox.top = top;
  dst.rgnBBox.left = left;
  dst.rgnBBox.bottom = bottom;
  dst.rgnBBox.right = right;
  dst.data = data;
}
