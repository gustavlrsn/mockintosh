/**
 * Fixed-point math and bit-manipulation utilities — from `GrafUtil.p` /
 * `Util.a`. Signatures match the original Pascal. `Fixed` is a 16.16 signed
 * number stored as a 32-bit integer.
 */

import { QDError } from "./errors";

/** A 16.16 signed fixed-point number stored as a 32-bit integer. */
export type Fixed = number;

/**
 * 64-bit integer split into two 32-bit halves.
 * `PROCEDURE LongMul(a, b: LongInt; VAR result: Int64Bit)` — both halves
 * are signed 32-bit (the original `Int64Bit` is two `LongInt`s).
 */
export interface Int64Bit {
  /** High 32 bits (signed). */
  hiLong: number;
  /** Low 32 bits (signed). */
  loLong: number;
}

/** Sign-extend the low 16 bits of `x` to a signed INTEGER. */
export function asInt16(x: number): number {
  return (x << 16) >> 16;
}

// -------------------------------------------------------------------------
// Bit manipulation — 68k AND.L / OR.L / EOR.L / NOT.L are signed LongInt
// -------------------------------------------------------------------------

/** `FUNCTION BitAnd(long1, long2: LongInt): LongInt` (`Util.a:21-30`). */
export function BitAnd(long1: number, long2: number): number {
  return (long1 & long2) | 0;
}

/** `FUNCTION BitOr(long1, long2: LongInt): LongInt` (`Util.a:44-51`). */
export function BitOr(long1: number, long2: number): number {
  return (long1 | long2) | 0;
}

/** `FUNCTION BitXor(long1, long2: LongInt): LongInt` (`Util.a:34-41`). */
export function BitXor(long1: number, long2: number): number {
  return (long1 ^ long2) | 0;
}

/** `FUNCTION BitNot(long: LongInt): LongInt` (`Util.a:10-18`). */
export function BitNot(long: number): number {
  return ~long | 0;
}

/**
 * Shift `long` left by `count` (positive) or right by `-count` (negative,
 * logical). 68k `LSL.L`/`LSR.L` take the count modulo 64; a count ≥ 32
 * yields 0 (`Util.a:56-71`).
 */
export function BitShift(long: number, count: number): number {
  const x = long | 0;
  const n = count | 0;
  if (n > 0) {
    const c = n & 63;
    if (c >= 32) return 0;
    return (x << c) | 0;
  }
  if (n < 0) {
    const c = (-n) & 63;
    if (c >= 32) return 0;
    return (x >>> c) | 0;
  }
  return x;
}

/**
 * Test a single bit in a byte array. `bitNum` 0 is the MSB of `bytePtr[0]`.
 * `FUNCTION BitTst(bytePtr: QDPtr; bitNum: LongInt): BOOLEAN`.
 */
export function BitTst(bytePtr: Uint8Array, bitNum: number): boolean {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7);
  return ((bytePtr[byteIndex] >> bitIndex) & 1) === 1;
}

/** `PROCEDURE BitSet(bytePtr: QDPtr; bitNum: LongInt)`. */
export function BitSet(bytePtr: Uint8Array, bitNum: number): void {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7);
  bytePtr[byteIndex] |= 1 << bitIndex;
}

/** `PROCEDURE BitClr(bytePtr: QDPtr; bitNum: LongInt)`. */
export function BitClr(bytePtr: Uint8Array, bitNum: number): void {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7);
  bytePtr[byteIndex] &= ~(1 << bitIndex);
}

// -------------------------------------------------------------------------
// Long math
// -------------------------------------------------------------------------

/**
 * 32×32 → 64-bit signed multiply. Uses `BigInt` so the 64-bit product is
 * exact. `PROCEDURE LongMul(a, b: LongInt; VAR result: Int64Bit)`.
 */
export function LongMul(a: number, b: number): Int64Bit {
  const result = BigInt(a | 0) * BigInt(b | 0);
  const mask32 = 0xffffffffn;
  return {
    hiLong: Number((result >> 32n) & mask32) | 0,
    loLong: Number(result & mask32) | 0,
  };
}

// -------------------------------------------------------------------------
// Fixed-point arithmetic
// -------------------------------------------------------------------------

const MAX_FIXED = 0x7fffffff;
const MIN_FIXED = -0x80000000;

/**
 * Multiply two 16.16 Fixed values: `(a × b) >> 16`, saturating on overflow
 * as the ROM `_FixMul` trap does. `FUNCTION FixMul(a, b: Fixed): Fixed`.
 */
export function FixMul(a: Fixed, b: Fixed): Fixed {
  const result = (BigInt(a | 0) * BigInt(b | 0)) >> 16n;
  if (result > BigInt(MAX_FIXED)) return MAX_FIXED;
  if (result < BigInt(MIN_FIXED)) return MIN_FIXED;
  return Number(result) | 0;
}

/**
 * `(numer << 16) / denom`. Returns `±0x7FFFFFFF` / `−0x80000000` on
 * division by zero. `FUNCTION FixRatio(numer, denom: INTEGER): Fixed`.
 */
export function FixRatio(numer: number, denom: number): Fixed {
  if (denom === 0) return numer >= 0 ? MAX_FIXED : MIN_FIXED;
  return ((numer << 16) / denom) | 0;
}

/** High 16 bits as a signed INTEGER. `FUNCTION HiWord(x: LongInt): INTEGER`. */
export function HiWord(x: number): number {
  return (x | 0) >> 16;
}

/** Low 16 bits as a signed INTEGER. `FUNCTION LoWord(x: LongInt): INTEGER`. */
export function LoWord(x: number): number {
  return asInt16(x | 0);
}

/** Round a Fixed to the nearest integer. `FUNCTION FixRound(x: Fixed): INTEGER`. */
export function FixRound(x: Fixed): number {
  return ((x + 0x8000) >> 16) | 0;
}

/**
 * Unsigned 16-bit `MULU`/`DIVU` helper used by `SCALE1`/`MAP1`
 * (`Pictures.a:1694-1785`). `denom === 0` traps, matching the original.
 */
export function mulDivU16(numer: number, mul: number, denom: number, add: number): number {
  if (denom === 0) throw new QDError("QuickDraw: divide by zero");
  const n = numer & 0xffff;
  const m = mul & 0xffff;
  const d = denom & 0xffff;
  const a = add & 0xffff;
  return ((n * m + a) / d) | 0;
}
