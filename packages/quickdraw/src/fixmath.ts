/**
 * Fixed-point math and bit-manipulation utilities — from `GrafUtil.p`.
 *
 * All function signatures match the original Pascal signatures exactly.
 * `Fixed` is a 16.16 signed fixed-point number stored as a 32-bit integer:
 * the high 16 bits are the integer part and the low 16 bits are the
 * fractional part.
 */

/** A 16.16 signed fixed-point number stored as a 32-bit integer. */
export type Fixed = number;

/**
 * 64-bit integer split into two 32-bit halves.
 * Returned by {@link LongMul}.
 */
export interface Int64Bit {
  /** High 32 bits (sign-extended). */
  hiLong: number;
  /** Low 32 bits (unsigned). */
  loLong: number;
}

// -------------------------------------------------------------------------
// Bit manipulation
// -------------------------------------------------------------------------

/**
 * Bitwise AND of two unsigned 32-bit integers.
 * Result is always non-negative (treated as unsigned).
 */
export function BitAnd(long1: number, long2: number): number {
  return (long1 & long2) >>> 0;
}

/**
 * Bitwise OR of two unsigned 32-bit integers.
 * Result is always non-negative (treated as unsigned).
 */
export function BitOr(long1: number, long2: number): number {
  return (long1 | long2) >>> 0;
}

/**
 * Bitwise XOR of two unsigned 32-bit integers.
 * Result is always non-negative (treated as unsigned).
 */
export function BitXor(long1: number, long2: number): number {
  return (long1 ^ long2) >>> 0;
}

/**
 * Bitwise NOT of an unsigned 32-bit integer.
 * Result is always non-negative (treated as unsigned).
 */
export function BitNot(long: number): number {
  return ~long >>> 0;
}

/**
 * Shift `long` left by `count` positions (positive) or right by `-count`
 * positions (negative, logical/unsigned shift).
 *
 * `FUNCTION BitShift(long: LongInt; count: INTEGER): LongInt`.
 */
export function BitShift(long: number, count: number): number {
  if (count > 0) return (long << count) >>> 0;
  if (count < 0) return (long >>> -count) >>> 0;
  return long >>> 0;
}

/**
 * Test a single bit in a byte array.
 *
 * `bitNum` is counted from the MSB of the byte at `bytePtr[0]`:
 * `bitNum = 0` is the most-significant bit of byte 0.
 *
 * `FUNCTION BitTst(bytePtr: QDPtr; bitNum: LongInt): BOOLEAN`.
 */
export function BitTst(bytePtr: Uint8Array, bitNum: number): boolean {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7); // bit 0 of bitNum = MSB of byte
  return ((bytePtr[byteIndex] >> bitIndex) & 1) === 1;
}

/**
 * Set a single bit in a byte array to 1 (MSB-first addressing).
 * `PROCEDURE BitSet(bytePtr: QDPtr; bitNum: LongInt)`.
 */
export function BitSet(bytePtr: Uint8Array, bitNum: number): void {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7);
  bytePtr[byteIndex] |= 1 << bitIndex;
}

/**
 * Clear a single bit in a byte array to 0 (MSB-first addressing).
 * `PROCEDURE BitClr(bytePtr: QDPtr; bitNum: LongInt)`.
 */
export function BitClr(bytePtr: Uint8Array, bitNum: number): void {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7);
  bytePtr[byteIndex] &= ~(1 << bitIndex);
}

// -------------------------------------------------------------------------
// Long math
// -------------------------------------------------------------------------

/**
 * 32×32 → 64-bit multiply (unsigned), returned as `{ hiLong, loLong }`.
 * Uses `BigInt` internally to avoid JavaScript precision loss.
 *
 * `PROCEDURE LongMul(a, b: LongInt; VAR result: Int64Bit)`.
 */
export function LongMul(a: number, b: number): Int64Bit {
  // Use BigInt for correct 64-bit result
  const result = BigInt(a) * BigInt(b);
  const mask32 = 0xffffffffn;
  return {
    hiLong: Number((result >> 32n) & mask32) | 0,
    loLong: Number(result & mask32) | 0,
  };
}

// -------------------------------------------------------------------------
// Fixed-point arithmetic
// -------------------------------------------------------------------------

/**
 * Multiply two 16.16 Fixed-point values: `(a × b) >> 16`.
 * `FUNCTION FixMul(a, b: Fixed): Fixed`.
 */
export function FixMul(a: Fixed, b: Fixed): Fixed {
  const result = (BigInt(a | 0) * BigInt(b | 0)) >> 16n;
  return Number(result) | 0;
}

/**
 * Create a Fixed-point value from an integer ratio: `(numer << 16) / denom`.
 * Returns `±0x7FFFFFFF` on division by zero.
 *
 * `FUNCTION FixRatio(numer, denom: INTEGER): Fixed`.
 */
export function FixRatio(numer: number, denom: number): Fixed {
  if (denom === 0) return numer >= 0 ? 0x7fffffff : -0x80000000;
  return ((numer << 16) / denom) | 0;
}

/**
 * Extract the integer (high 16-bit) part of a Fixed value.
 * `FUNCTION HiWord(x: LongInt): INTEGER`.
 */
export function HiWord(x: Fixed): number {
  return (x >> 16) & 0xffff;
}

/**
 * Extract the fractional (low 16-bit) part of a Fixed value.
 * `FUNCTION LoWord(x: LongInt): INTEGER`.
 */
export function LoWord(x: Fixed): number {
  return x & 0xffff;
}

/**
 * Round a Fixed-point value to the nearest integer.
 * `FUNCTION FixRound(x: Fixed): INTEGER`.
 */
export function FixRound(x: Fixed): number {
  return ((x + 0x8000) >> 16) | 0;
}
