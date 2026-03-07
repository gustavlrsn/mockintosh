// Miscellaneous utility routines — from QuickDraw.p Misc Utility Routines section

import { globals } from "./globals";

// FUNCTION GetPixel(h, v: INTEGER): BOOLEAN;
export function GetPixel(h: number, v: number): boolean {
  const port = globals.thePort;
  if (!port) return false;
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const idx = v * rowBytes + h;
  if (idx < 0 || idx >= pixels.length) return false;
  return pixels[idx] === 1;
}

// FUNCTION Random: INTEGER;
// Park-Miller multiplicative congruential generator (from Util.a)
// randSeed := (randSeed * 16807) MOD 2147483647
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

// PROCEDURE StuffHex(thingPtr: QDPtr; s: Str255);
// Writes hex digits from string s into the byte array thingPtr
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

// PROCEDURE ForeColor(color: LongInt);
export function ForeColor(color: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.fgColor = color;
}

// PROCEDURE BackColor(color: LongInt);
export function BackColor(color: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.bkColor = color;
}

// PROCEDURE ColorBit(whichBit: INTEGER);
export function ColorBit(whichBit: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.colrBit = whichBit;
}
