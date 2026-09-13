/**
 * Angle–slope conversion — `reference/QuickDraw/Angles.a`.
 *
 * `SlopeFromAngle(angle)` returns Fixed = −65536·Tan(angle); input is MOD 180.
 * `AngleFromSlope(slope)` scans the same builder and returns 0..180.
 * `PtToAngle` is the aspect-correct arctan used by arc hit-testing.
 */

import type { Point, Rect } from "./types";
import { asInt16, FixMul, FixRatio, type Fixed } from "./fixmath";

// SLOPE word table for angles 0..90 (`Angles.a:123-213`).
const SLOPE_WORD: readonly number[] = [
  0x0000, 0x0478, 0x08f1, 0x0d6b, 0x11e7, 0x1666, 0x1ae8, 0x1f6f, 0x23fa,
  0x288c, 0x2d24, 0x31c3, 0x366a, 0x3b1a, 0x3fd4, 0x4498, 0x4968, 0x4e44,
  0x532e, 0x5826, 0x5d2d, 0x6245, 0x676e, 0x6caa, 0x71fb, 0x7760, 0x7cdc,
  0x8270, 0x881e, 0x8de7, 0x93cd, 0x99d2, 0x9ff7, 0xa640, 0xacad, 0xb341,
  0xb9ff, 0xc0e9, 0xc802, 0xcf4e, 0xd6cf, 0xde8a, 0xe681, 0xeeb9, 0xf737,
  0x0000, 0x0919, 0x1287, 0x1c51, 0x267f, 0x3117, 0x3c22, 0x47aa, 0x53b9,
  0x605b, 0x6d9b, 0x7b89, 0x8a35, 0x99af, 0xaa0e, 0xbb68, 0xcdd6, 0xe177,
  0xf66e, 0x0ce1, 0x24fe, 0x3efc, 0x5b19, 0x799f, 0x9ae7, 0xbf5b, 0xe77a,
  0x13e3, 0x4556, 0x7cc7, 0xbb68, 0x02c2, 0x54db, 0xb462, 0x2501, 0xabd9,
  0x5051, 0x1d88, 0x24f3, 0x83ad, 0x6e17, 0x4cf5, 0x14bd, 0xa2d7, 0x4a30,
  0xffff,
];

/**
 * Byte table for `MOVE.B SLOPE-91(D0),1(SP)` with D0 in 64..90
 * (`Angles.a:96-122`). Indexed as `SLOPE_BYTE[angle - 64]`.
 *
 * The leftover `.BYTE $01` at `Angles.a:95` sits at `SLOPE-28` and is never
 * read (earliest index is `SLOPE-27` at 64°). Byte[64] is therefore `$02`.
 */
const SLOPE_BYTE: readonly number[] = [
  0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, // 64..70
  0x03, 0x03, 0x03, 0x03, 0x03, // 71..75
  0x04, 0x04, 0x04, 0x05, 0x05, // 76..80
  0x06, 0x07, 0x08, 0x09, 0x0b, // 81..85
  0x0e, 0x13, 0x1c, 0x39, 0xff, // 86..90
];

/** INTEGER angle MOD 180 into 0..179 (`Angles.a:48-54`, DIVS #180). */
function mod180(angle: number): number {
  let a = asInt16(angle);
  a = a % 180;
  if (a < 0) a += 180;
  return a;
}

/**
 * Shared `A2SLOPE` builder (`Angles.a:55-72`).
 *
 * `seedHighWord` is `$8000` from `SlopeFromAngle` (`MOVE #$8000,(SP)`) or
 * `0` from `AngleFromSlope` (`CLR.L -(SP)`). Angles > 90 fold to 180−a and
 * force the seed to 0 (`CLR.W (SP)`), so 91..179 come out positive.
 */
function a2slope(angle0to179: number, seedHighWord: number): Fixed {
  let a = angle0to179;
  let hi = seedHighWord & 0xffff;
  if (a > 90) {
    hi = 0; // Angles.a:57 CLR.W (SP)
    a = 180 - a; // Angles.a:58-59
  }
  if (a >= 45) {
    hi = (hi + 1) & 0xffff; // Angles.a:62 ADD #1,(SP)
    if (a >= 64) {
      const b = SLOPE_BYTE[a - 64];
      hi = (hi & 0xff00) | (b & 0xff); // Angles.a:65 MOVE.B …,1(SP)
      if ((b & 0x80) !== 0) {
        hi = hi | 0x7f00; // Angles.a:67 OR.B #$7F,(SP) — 90°
      }
    }
  }
  const lo = SLOPE_WORD[a] & 0xffff;
  let result = ((hi << 16) | lo) | 0;
  // BCLR #7,(SP): clear bit 31; NEG.L if it was set (`Angles.a:70-72`).
  const hadSign = (result & 0x80000000) !== 0;
  result = (result & 0x7fffffff) | 0;
  if (hadSign) result = (-result) | 0;
  return result;
}

/**
 * Positive-magnitude slope used by `AngleFromSlope`'s table scan
 * (`Angles.a:22`, `CLR.L` then `A2SLOPE`). Same builder as `SlopeFromAngle`
 * but without the `$8000` sign seed, so 0..90 stay non-negative.
 */
function slopeMagnitude(angle0to179: number): Fixed {
  return a2slope(angle0to179, 0);
}

/**
 * `FUNCTION SlopeFromAngle(angle: INTEGER): Fixed` (`Angles.a:45-73`).
 */
export function SlopeFromAngle(angle: number): Fixed {
  return a2slope(mod180(angle), 0x8000);
}

/**
 * `FUNCTION AngleFromSlope(slope: Fixed): INTEGER` (`Angles.a:11-34`).
 * Compares `abs(slope) − 500` against `slopeMagnitude(i)` and returns
 * `i` when the input was negative, else `180 − i`.
 */
export function AngleFromSlope(slope: Fixed): number {
  let s = slope | 0;
  const wasNeg = s < 0; // SMI D2 (`Angles.a:12`)
  if (wasNeg) s = (-s) | 0;
  s = (s - 500) | 0; // Angles.a:15
  let i = -1;
  for (;;) {
    i += 1;
    const tableSlope = slopeMagnitude(i);
    if (s <= tableSlope) break; // CMP.L; BGT SCAN (`Angles.a:25-26`)
  }
  return wasNeg ? i : 180 - i; // Angles.a:27-31
}

/**
 * `PROCEDURE PtToAngle(r: Rect; pt: Point; VAR angle: INTEGER)`
 * (`Angles.a:217-289`).
 */
export function PtToAngle(
  r: Rect,
  pt: Point,
  angle: { value: number }
): void {
  const centerV = asInt16(asInt16(r.bottom) + asInt16(r.top)) >> 1; // Angles.a:236-238
  const dv = asInt16(asInt16(pt.v) - centerV);
  const centerH = asInt16(asInt16(r.right) + asInt16(r.left)) >> 1; // Angles.a:242-244
  const dh = asInt16(asInt16(pt.h) - centerH);
  if (dh === 0) {
    angle.value = dv <= 0 ? 0 : 180; // Angles.a:248-250
    return;
  }
  const slope = FixRatio(dh, dv);
  const height = asInt16(asInt16(r.bottom) - asInt16(r.top));
  const width = asInt16(asInt16(r.right) - asInt16(r.left));
  const aspect = FixRatio(height, width);
  const slope2 = FixMul(slope, aspect);
  let deg = AngleFromSlope(slope2);
  if (dh < 0) deg = asInt16(deg + 180); // Angles.a:281-282
  if (deg === 360) deg = 0; // Angles.a:283-285
  angle.value = deg;
}
