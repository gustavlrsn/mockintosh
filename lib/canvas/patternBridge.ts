/**
 * patternBridge.ts
 *
 * Converts between BitCanvas patterns (64-byte flat arrays, 1 byte per pixel,
 * 8x8) and QuickDraw patterns (8-byte packed bitmaps, 1 bit per pixel, MSB=left).
 *
 * This is needed because BitCanvas uses an unpacked pixel-per-byte format
 * while QuickDraw uses the original Mac packed bit format.
 */

import { PatternName } from "./patterns";
import type { Pattern } from "@mockintosh/quickdraw";

/**
 * Convert a 64-byte flat pattern (1 byte per pixel) to an 8-byte QuickDraw
 * packed pattern (1 bit per pixel, MSB = leftmost pixel of each row).
 */
export function flatToQD(flat: Uint8Array): Pattern {
  const qd = new Uint8Array(8);
  for (let row = 0; row < 8; row++) {
    let byte = 0;
    for (let col = 0; col < 8; col++) {
      if (flat[row * 8 + col]) {
        byte |= 1 << (7 - col);
      }
    }
    qd[row] = byte;
  }
  return qd;
}

/**
 * Convert an 8-byte QuickDraw packed pattern to a 64-byte flat pattern.
 */
export function qdToFlat(qd: Pattern): Uint8Array {
  const flat = new Uint8Array(64);
  for (let row = 0; row < 8; row++) {
    const byte = qd[row];
    for (let col = 0; col < 8; col++) {
      flat[row * 8 + col] = (byte >> (7 - col)) & 1;
    }
  }
  return flat;
}

// Pre-computed QD versions of all named BitCanvas patterns
// These match the definitions in lib/canvas/patterns.ts

export const QD_PATTERNS: Record<PatternName, Pattern> = {
  black: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
  white: new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  // checkers: alternating pixels (same as QuickDraw gray)
  checkers: new Uint8Array([0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]),
  // darkCheckers: inverted checkers
  darkCheckers: new Uint8Array([
    0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa,
  ]),
  // stripes: alternating solid/empty rows
  stripes: new Uint8Array([0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00]),
  // gray25: 25% density
  gray25: new Uint8Array([0x88, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x22]),
  // gray50: 50% density (same as checkers)
  gray50: new Uint8Array([0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]),
  // gray75: 75% density
  gray75: new Uint8Array([0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd]),
};

/**
 * Get the QuickDraw Pattern for a named BitCanvas pattern.
 */
export function namedPatternToQD(name: PatternName): Pattern {
  return QD_PATTERNS[name];
}
