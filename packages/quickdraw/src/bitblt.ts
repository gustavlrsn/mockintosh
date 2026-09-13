/**
 * Per-pixel BitBlt oracle (`BitBltSlow`) and pattern sampler.
 * The live engine is `bitBltCore.ts` / `rgnBlt.ts`.
 */

import type { BitMap, Pattern, Rect } from "./types";
import { getBit, setBit } from "./packedBits";

export function samplePattern(pat: Pattern, x: number, y: number): number {
  const row = pat[y & 7];
  const bit = 7 - (x & 7);
  return (row >> bit) & 1;
}

function applyMode(mode: number, src: number, dst: number): number {
  const s = mode & 4 ? 1 - src : src;
  switch (mode & 3) {
    case 0:
      return s;
    case 1:
      return s | dst;
    case 2:
      return s ^ dst;
    case 3:
      return (1 - s) & dst;
    default:
      return s;
  }
}

/**
 * Reference per-pixel form of `BitBlt`. Tests compare the transcribed
 * engine against this. Extents follow `dstRect` (`BitBlt.a:102-105`).
 */
export function BitBltSlow(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  mode: number,
  pat: Pattern
): void {
  if ((mode << 16) >> 16 < 0) return;
  const width = dstRect.right - dstRect.left;
  const height = dstRect.bottom - dstRect.top;
  if (width <= 0 || height <= 0) return;
  const usePattern = (mode & 8) !== 0;

  for (let row = 0; row < height; row++) {
    const sy = srcRect.top + row;
    const dy = dstRect.top + row;
    for (let col = 0; col < width; col++) {
      const sx = srcRect.left + col;
      const dx = dstRect.left + col;
      const src = usePattern ? samplePattern(pat, dx, dy) : getBit(srcBits, sx, sy);
      const dst = getBit(dstBits, dx, dy);
      setBit(dstBits, dx, dy, applyMode(mode, src, dst));
    }
  }
}
