/**
 * Miscellaneous utility routines — from `QuickDraw.p` / `Util.a`.
 */

import { globals, requirePort } from "./globals";
import { getBit } from "./packedBits";
import { asInt16 } from "./fixmath";
import { HideCursor, ShowCursor } from "./cursors";

/**
 * Read a single pixel from the current port at `(h, v)` in local coords.
 * `HideCursor` / `ShowCursor` around the read (`Util.a:489-507`).
 * Bounds-checked (returns white outside) — §4.4 memory safety.
 * `FUNCTION GetPixel(h, v: INTEGER): BOOLEAN`.
 */
export function GetPixel(h: number, v: number): boolean {
  HideCursor();
  try {
    const bm = requirePort().portBits;
    if (
      v < bm.bounds.top ||
      v >= bm.bounds.bottom ||
      h < bm.bounds.left ||
      h >= bm.bounds.right
    ) {
      return false;
    }
    return getBit(bm, h, v) === 1;
  } finally {
    ShowCursor();
  }
}

/**
 * Park–Miller `randSeed := (randSeed × 16807) MOD 2147483647`, transcribed
 * from the 16-bit-word decomposition in `Util.a:119-178`. The low word
 * `−32768` is replaced with `0`.
 */
export function Random(): number {
  const A = 16807;
  const P = 0x7fffffff;
  const seed = globals.randSeed | 0;
  const lo = seed & 0xffff;
  const hi = (seed >>> 16) & 0xffff;
  const xalo = Math.imul(A, lo) >>> 0;
  const fhi = (Math.imul(A, hi) + (xalo >>> 16)) >>> 0;
  const k = ((fhi << 1) >>> 16) & 0xffff;
  let next = (xalo & 0xffff) - P + ((fhi & 0x7fff) << 16) + k;
  if (next < 0) next += P;
  globals.randSeed = next | 0;
  const result = asInt16(next);
  return result === -32768 ? 0 : result;
}

/**
 * Write hex digit pairs from string `s` into byte array `thingPtr`.
 *
 * Each pair of characters in `s` is interpreted as a hexadecimal byte and
 * written to successive positions in `thingPtr`.  Useful for initialising
 * cursor and pattern data from hex literal strings.
 *
 * `PROCEDURE StuffHex(thingPtr: QDPtr; s: Str255)` from `Util.a`.
 *
 * @example
 * ```ts
 * const pat = new Uint8Array(8);
 * StuffHex(pat, 'AA55AA55AA55AA55'); // 50% gray
 * ```
 */
export function StuffHex(thingPtr: Uint8Array, s: string): void {
  for (let i = 0; i < s.length - 1; i += 2) {
    const hi = parseInt(s[i], 16);
    const lo = parseInt(s[i + 1], 16);
    const byteIdx = i >> 1;
    if (byteIdx < thingPtr.length) {
      thingPtr[byteIdx] = (hi << 4) | lo;
    }
  }
}

/**
 * Set the foreground colour of the current port.
 * `PROCEDURE ForeColor(color: LongInt)` — use the `*Color` constants
 * (`blackColor`, `whiteColor`, etc.) from `constants.ts`.
 */
export function ForeColor(color: number): void {
  requirePort().fgColor = color;
}

/**
 * Set the background colour of the current port.
 * `PROCEDURE BackColor(color: LongInt)`.
 */
export function BackColor(color: number): void {
  requirePort().bkColor = color;
}

/**
 * Select which colour bit plane to render into.
 * `PROCEDURE ColorBit(whichBit: INTEGER)` — used for colour separations
 * on colour QuickDraw systems.  Has no effect in 1-bpp mode.
 */
export function ColorBit(whichBit: number): void {
  requirePort().colrBit = whichBit;
}
