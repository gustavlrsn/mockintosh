// Fixed-point math and bit utilities from GrafUtil.p
// All functions match the original Pascal signatures exactly.

// Fixed is a 16.16 signed fixed-point number stored as a 32-bit integer
export type Fixed = number;

// Int64Bit: used as result of LongMul
export interface Int64Bit {
  hiLong: number;
  loLong: number;
}

// -------------------------------------------------------------------------
// Bit manipulation
// -------------------------------------------------------------------------

export function BitAnd(long1: number, long2: number): number {
  return (long1 & long2) >>> 0;
}

export function BitOr(long1: number, long2: number): number {
  return (long1 | long2) >>> 0;
}

export function BitXor(long1: number, long2: number): number {
  return (long1 ^ long2) >>> 0;
}

export function BitNot(long: number): number {
  return ~long >>> 0;
}

// Positive count = shift left; negative count = logical shift right
export function BitShift(long: number, count: number): number {
  if (count > 0) return (long << count) >>> 0;
  if (count < 0) return (long >>> -count) >>> 0;
  return long >>> 0;
}

// Test bit bitNum (counted from MSB of byte at bytePtr[floor(bitNum/8)])
// bitNum 0 = MSB of byte 0
export function BitTst(bytePtr: Uint8Array, bitNum: number): boolean {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7); // bit 0 of bitNum = MSB of byte
  return ((bytePtr[byteIndex] >> bitIndex) & 1) === 1;
}

export function BitSet(bytePtr: Uint8Array, bitNum: number): void {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7);
  bytePtr[byteIndex] |= 1 << bitIndex;
}

export function BitClr(bytePtr: Uint8Array, bitNum: number): void {
  const byteIndex = (bitNum / 8) | 0;
  const bitIndex = 7 - (bitNum & 7);
  bytePtr[byteIndex] &= ~(1 << bitIndex);
}

// -------------------------------------------------------------------------
// Long math
// -------------------------------------------------------------------------

// 32x32 -> 64 bit multiply (unsigned)
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

// 16.16 fixed-point multiply: (a * b) >> 16
export function FixMul(a: Fixed, b: Fixed): Fixed {
  const result = (BigInt(a | 0) * BigInt(b | 0)) >> 16n;
  return Number(result) | 0;
}

// Create a Fixed from numer/denom (numer << 16) / denom
export function FixRatio(numer: number, denom: number): Fixed {
  if (denom === 0) return numer >= 0 ? 0x7fffffff : -0x80000000;
  return ((numer << 16) / denom) | 0;
}

// High 16 bits of a Fixed (the integer part, signed)
export function HiWord(x: Fixed): number {
  return (x >> 16) & 0xffff;
}

// Low 16 bits of a Fixed (the fractional part)
export function LoWord(x: Fixed): number {
  return x & 0xffff;
}

// Round a Fixed to the nearest integer
export function FixRound(x: Fixed): number {
  return ((x + 0x8000) >> 16) | 0;
}
