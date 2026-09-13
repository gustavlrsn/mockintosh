/**
 * Sort and cull inversion points — from `SortPoints.a`.
 *
 * `SortPoints` is the non-recursive quicksort of Wirth,
 * *Algorithms + Data Structures = Programs* p.80 (`SortPoints.a:20`).
 * Order is increasing `(v, h)`.
 */

import type { Point } from "./types";

/**
 * `PROCEDURE SortPoints(ptBuf: PointsPtr; ptCount: INTEGER)`.
 * In-place non-recursive quicksort of `ptBuf[0..ptCount)`.
 * `SortPoints.a:10-123`.
 */
export function SortPoints(ptBuf: Point[], ptCount: number = ptBuf.length): void {
  // SortPoints.a:37 — do nothing if no points
  if (ptCount <= 0) return;

  // Explicit partition stack (left, right index pairs). SortPoints.a:43-44
  const stack: number[] = [];
  let left = 0;
  let right = ptCount - 1;
  stack.push(left, right);

  while (stack.length > 0) {
    // POPNXT — SortPoints.a:47
    right = stack.pop()!;
    left = stack.pop()!;

    // SPLIT — SortPoints.a:50
    split: for (;;) {
      let i = left;
      let j = right;
      // Midptr: ((left+right)/2) on a 4-byte-aligned buffer. SortPoints.a:55-62
      const mid = (left + right) >> 1;
      const midH = ptBuf[mid]!.h | 0;
      const midV = ptBuf[mid]!.v | 0;

      // SCAN until IPtr > JPtr. SortPoints.a:64-105
      scan: for (;;) {
        // WHILE IPTR^ < MIDPT DO BUMP IPTR. SortPoints.a:68-75
        for (;;) {
          const p = ptBuf[i]!;
          if ((p.v | 0) < midV) {
            i++;
            continue;
          }
          if ((p.v | 0) > midV) break;
          if ((p.h | 0) < midH) {
            i++;
            continue;
          }
          break;
        }
        // WHILE JPTR^ > MIDPT DO BUMP JPTR. SortPoints.a:81-88
        for (;;) {
          const p = ptBuf[j]!;
          if ((p.v | 0) > midV) {
            j--;
            continue;
          }
          if ((p.v | 0) < midV) break;
          if ((p.h | 0) > midH) {
            j--;
            continue;
          }
          break;
        }
        // if IPtr <= JPtr then swap and bump. SortPoints.a:93-99
        if (i > j) break scan;
        const tmp = ptBuf[i]!;
        ptBuf[i] = ptBuf[j]!;
        ptBuf[j] = tmp;
        i++;
        j--;
        // NOSWAP: repeat until IPtr > JPtr. SortPoints.a:104-105
        if (i > j) break scan;
      }

      // IF i < right then stack the right partition. SortPoints.a:110-112
      if (i < right) {
        stack.push(i, right);
      }
      // RIGHTPTR := JPTR; partition left in place. SortPoints.a:114-117
      right = j;
      if (left >= right) break split;
    }
  }
}

/**
 * `PROCEDURE CullPoints(ptBuf: PointsPtr; VAR ptCount: INTEGER)`.
 * Cancel adjacent duplicate pairs. Returns the updated count.
 * `SortPoints.a:129-172`.
 */
export function CullPoints(ptBuf: Point[], ptCount: number = ptBuf.length): number {
  // SortPoints.a:147 — do nothing if no points
  if (ptCount <= 0) {
    ptBuf.length = ptCount;
    return ptCount;
  }

  let src = 0;
  const last = ptCount - 1;
  let dst = 0;

  // WHILE SRCPTR < LASTPTR. SortPoints.a:164-165
  while (src < last) {
    const cur = ptBuf[src]!;
    const nxt = ptBuf[src + 1]!;
    // Same V.H long → delete both. SortPoints.a:160-162
    if ((cur.v | 0) === (nxt.v | 0) && (cur.h | 0) === (nxt.h | 0)) {
      src += 2;
    } else {
      ptBuf[dst++] = cur;
      src += 1;
    }
  }
  // Finish the last point if src landed on it. SortPoints.a:166-167
  if (src === last) {
    ptBuf[dst++] = ptBuf[src]!;
  }
  ptBuf.length = dst;
  return dst;
}
