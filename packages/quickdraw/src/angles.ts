/**
 * Angle–slope conversion — from `reference/QuickDraw/Angles.a`.
 *
 * SlopeFromAngle(angle) returns Fixed = -65536*Tan(angle); input is mod 180.
 * AngleFromSlope(slope) scans the SLOPE table and returns angle 0..180.
 * Used by DrawArc (ray clipping) and PtToAngle (aspect-correct angle).
 */

import type { Fixed } from "./fixmath";

// SLOPE table: 91 words for angles 0..90. Values from Angles.a lines 123–213.
// 68k signed 16-bit; we store as numbers and sign-extend when building Fixed.
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

// Byte table for angles 64..90 (SLOPE-91 in original). 27 bytes.
const SLOPE_BYTE: readonly number[] = [
  0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x03, 0x03, 0x03, 0x03,
  0x04, 0x04, 0x04, 0x05, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0b, 0x0e, 0x13, 0x1c,
  0x39, 0xff,
];

/**
 * SlopeFromAngle(angle: INTEGER): Fixed.
 * Fixed-point slope = -65536*Tan(angle). Input angle is treated MOD 180.
 */
export function SlopeFromAngle(angle: number): Fixed {
  let a = angle % 180;
  if (a < 0) a += 180;
  let negate = false;
  if (a > 90) {
    a = 180 - a;
    negate = true;
  }
  // Build 32-bit result: high byte, second byte, then word from SLOPE_WORD
  let highByte = 0x80;
  let secondByte = 0x00;
  if (a < 45) {
    // leave highByte=0x80, secondByte=0
  } else {
    secondByte = 1;
    if (a >= 64) {
      secondByte = SLOPE_BYTE[a - 64];
    }
  }
  const slopeWord = SLOPE_WORD[a];
  const lowWord = slopeWord & 0xffff;
  let result: number = (highByte << 24) | (secondByte << 16) | lowWord;
  result = result | 0;
  // BCLR #7,(SP): clear bit 7 of high byte; if was set, negate
  const hadSign = (result & 0x80000000) !== 0;
  result &= 0x7fffffff;
  if (hadSign) result = -result | 0;
  return result as Fixed;
}

/**
 * AngleFromSlope(slope: Fixed): INTEGER.
 * Scans slope table for angle and returns angle 0..180.
 */
export function AngleFromSlope(slope: Fixed): number {
  let s = slope | 0;
  const wasNeg = s < 0;
  if (wasNeg) s = -s | 0;
  s = (s - 500) | 0;
  let i = -1;
  for (;;) {
    i += 1;
    const tableSlope = i <= 90 ? SlopeFromAngle(i) : 0x7fffffff;
    if (s <= tableSlope) break;
  }
  return wasNeg ? i : 180 - i;
}
