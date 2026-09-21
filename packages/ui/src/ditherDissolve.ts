/**
 * Bayer dissolve between two unpacked 1-bit frames (`0` paper, `1` ink,
 * `width` bytes per row — same contract as `<bitmap>`).
 */

/** Classic 4×4 ordered dither, values in (0, 1). */
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function bayerThreshold(x: number, y: number): number {
  return (BAYER4[((y & 3) << 2) | (x & 3)]! + 0.5) / 16;
}

/**
 * Shared ink stays; source-only fades out; dest-only fades in.
 * `t` is 0 (from) … 1 (to).
 */
export function paintDitherDissolve(
  out: Uint8Array,
  from: Uint8Array,
  to: Uint8Array,
  width: number,
  height: number,
  t: number,
): void {
  const progress = Math.min(1, Math.max(0, t));
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const i = row + x;
      const a = from[i]!;
      const b = to[i]!;
      if (a && b) {
        out[i] = 1;
        continue;
      }
      const th = bayerThreshold(x, y);
      out[i] = (a && th >= progress) || (b && th < progress) ? 1 : 0;
    }
  }
}
