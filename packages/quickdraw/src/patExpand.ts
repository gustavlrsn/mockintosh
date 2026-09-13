/**
 * PatExpand — expand an 8-byte pattern, honouring patAlign and patStretch.
 * `Util.a:284-404`.
 *
 * Returns an 8- or 16-row aligned pattern plus `sampleExpanded(h,v)`, which
 * is pixel-identical to the original 16-long table written into destination
 * storage (the longs are the same byte repeated, or a 16-bit stretch doubled).
 */
import type { BitMap, Pattern, Point } from "./types";
import { asInt16 } from "./fixmath";

/** Nibble → doubled byte. `Util.a:395-396`. */
const STRETCH = [
  0x00, 0x03, 0x0c, 0x0f, 0x30, 0x33, 0x3c, 0x3f, 0xc0, 0xc3, 0xcc, 0xcf, 0xf0, 0xf3, 0xfc, 0xff,
];

/** Nibble → thin-doubled byte (extra white dots). `Util.a:400-401`. */
const THINSTR = [
  0x00, 0x01, 0x04, 0x05, 0x10, 0x11, 0x14, 0x15, 0x40, 0x41, 0x44, 0x45, 0x50, 0x51, 0x54, 0x55,
];

export interface ExpandedPattern {
  /** 8 or 16 rows of packed pattern (MSB leftmost), storage-aligned. */
  rows: Uint16Array;
  /** Period in pixels: 8 (normal) or 16 (stretch ±2). */
  width: 8 | 16;
  /** 8 or 16. */
  height: 8 | 16;
  /** Pixel at destination local `(h, v)`. */
  sampleExpanded: (h: number, v: number) => 0 | 1;
}

function rolByte(b: number, n: number): number {
  n &= 7;
  if (n === 0) return b & 0xff;
  return ((b << n) | (b >> (8 - n))) & 0xff;
}

/**
 * Expand `pat` the way `PatExpand` writes 16 longs. `Util.a:284-388`.
 *
 * `D2` in the original is `dstBits.bounds.left` (global-local offset) plus
 * `patAlign.h`, then treated mod 8. `invert` is D7 = −1 (XOR $FF) or 0.
 */
export function PatExpand(
  pat: Pattern,
  dstBits: BitMap,
  patAlign: Point,
  patStretch: number,
  invert: boolean
): ExpandedPattern {
  const inv = invert ? 0xff : 0;
  // Vertical: if patAlign.v mod 8 ≠ 0, start into a doubled copy. Util.a:313-321
  const vOff = patAlign.v & 7;
  const src = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const b = (pat[i] ?? 0) & 0xff;
    src[i] = b;
    src[i + 8] = b;
  }
  // D2 := (bounds.left + patAlign.h) mod 8. Util.a:323-325
  const rot = (dstBits.bounds.left + patAlign.h) & 7;
  const stretch = asInt16(patStretch);
  const left = dstBits.bounds.left | 0;

  const rows = new Uint16Array(16);
  let width: 8 | 16 = 8;
  let height: 8 | 16 = 8;

  if (stretch === 2) {
    // Double each bit H and V. Util.a:353-366
    width = 16;
    height = 16;
    for (let i = 0; i < 8; i++) {
      const b = rolByte((src[vOff + i]! ^ inv) & 0xff, rot);
      const word = ((STRETCH[b >> 4]! << 8) | STRETCH[b & 0xf]!) & 0xffff;
      rows[i * 2] = word;
      rows[i * 2 + 1] = word;
    }
  } else if (stretch === -2) {
    // Thin double: extra white rows. Util.a:373-385
    width = 16;
    height = 16;
    for (let i = 0; i < 8; i++) {
      const b = rolByte((src[vOff + i]! ^ inv) & 0xff, rot);
      const word = ((THINSTR[b >> 4]! << 8) | THINSTR[b & 0xf]!) & 0xffff;
      rows[i * 2] = word;
      rows[i * 2 + 1] = 0; // CLR.L second long. Util.a:384
    }
  } else {
    // Normal: byte × 4 as a long, duplicate 8 scans later. Util.a:338-345
    width = 8;
    height = 16;
    for (let i = 0; i < 8; i++) {
      const b = rolByte((src[vOff + i]! ^ inv) & 0xff, rot);
      const word = ((b << 8) | b) & 0xffff;
      rows[i] = word;
      rows[i + 8] = word;
    }
  }

  const sampleExpanded = (h: number, v: number): 0 | 1 => {
    const row = rows[v & 15]!;
    const s = (h - left) | 0;
    if (width === 8) return ((row >>> (8 + (7 - (s & 7)))) & 1) as 0 | 1;
    return ((row >>> (15 - (s & 15))) & 1) as 0 | 1;
  };

  return { rows, width, height, sampleExpanded };
}
