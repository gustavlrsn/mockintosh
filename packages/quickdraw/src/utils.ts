/**
 * Miscellaneous utility routines — from `QuickDraw.p` Misc Utility Routines
 * section and `reference/QuickDraw/Util.a`.
 */

import { globals } from "./globals";
import { bmGetPixel } from "./bitblt";

/**
 * Read a single pixel from the current port at `(h, v)`.
 * Returns `true` if the pixel is black (value `1`), `false` if white or
 * out of bounds.
 * `FUNCTION GetPixel(h, v: INTEGER): BOOLEAN`.
 */
export function GetPixel(h: number, v: number): boolean {
  const port = globals.thePort;
  if (!port) return false;
  return bmGetPixel(port.portBits, h, v) === 1;
}

/**
 * Return a pseudo-random signed 16-bit integer and advance `globals.randSeed`.
 *
 * Uses the Park-Miller multiplicative congruential generator:
 * `randSeed := (randSeed × 16807) MOD 2147483647`
 * implemented via Schrage's method to avoid 32-bit overflow.
 *
 * `FUNCTION Random: INTEGER` from `reference/QuickDraw/Util.a`.
 */
export function Random(): number {
  const A = 16807;
  const M = 2147483647; // 2^31 - 1
  const seed = globals.randSeed;

  // Schrage's method for overflow-free computation
  const q = (M / A) | 0;
  const r = M % A;
  const hi = (seed / q) | 0;
  const lo = seed % q;
  let next = A * lo - r * hi;
  if (next <= 0) next += M;
  globals.randSeed = next;

  // Return as signed 16-bit integer (low word)
  const result = next & 0xffff;
  return result >= 0x8000 ? result - 0x10000 : result;
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
  const port = globals.thePort;
  if (!port) return;
  port.fgColor = color;
}

/**
 * Set the background colour of the current port.
 * `PROCEDURE BackColor(color: LongInt)`.
 */
export function BackColor(color: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.bkColor = color;
}

/**
 * Select which colour bit plane to render into.
 * `PROCEDURE ColorBit(whichBit: INTEGER)` — used for colour separations
 * on colour QuickDraw systems.  Has no effect in 1-bpp mode.
 */
export function ColorBit(whichBit: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.colrBit = whichBit;
}
