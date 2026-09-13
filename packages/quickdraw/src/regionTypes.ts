/**
 * Packed XOR-delta region encoding — the original QuickDraw region format
 * from `PackRgn.a:13-19` / `GrafTypes.a:118-123`.
 *
 * A region is rectangular iff `rgnSize === 10` (header only: size + bbox).
 * Complex regions append a stream `V H…H 32767 … 32767` in `data`.
 */

import type { Rect } from "./types";

/** Row / region terminator. `PackRgn.a:17-19`. */
export const RGN_END = 32767;

/**
 * Packed region: 10-byte header plus optional inversion-point stream.
 * `rgnSize` is the exact byte length (`10 + 2 * data.length`).
 */
export interface RegionData {
  rgnSize: number;
  rgnBBox: Rect;
  data: Int16Array;
}

/** `rgnSize == 10` ⇔ rectangular (no data, or empty data). `GrafTypes.a:121`. */
export function isRectRgn(rgn: { rgnSize: number }): boolean {
  return rgn.rgnSize === 10;
}
