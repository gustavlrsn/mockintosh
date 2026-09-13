/**
 * Rect → inversion points — `reference/QuickDraw/Rects.a:610-671`.
 *
 * Four points: top-left, top-right, bottom-left, bottom-right.
 */

import type { Point, Rect } from "./types";
import { asInt16 } from "./fixmath";

/**
 * `PROCEDURE PutRect(r: Rect; bufHandle: Handle; VAR index, size)`
 * (`Rects.a:610-671`), appending the four inversion points to `dst`.
 */
export function PutRect(r: Rect, dst: Point[]): void {
  const top = asInt16(r.top);
  const left = asInt16(r.left);
  const bottom = asInt16(r.bottom);
  const right = asInt16(r.right);
  dst.push({ v: top, h: left }); // Rects.a:665 TOPLEFT
  dst.push({ v: top, h: right }); // Rects.a:666-667 top-right
  dst.push({ v: bottom, h: left }); // Rects.a:668-669 bottom-left
  dst.push({ v: bottom, h: right }); // Rects.a:670 BOTRIGHT
}
