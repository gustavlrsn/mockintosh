/**
 * Packed 1-bit pixel storage — the one place that knows the bit layout.
 *
 * A {@link BitMap} stores 8 pixels per byte, most-significant bit leftmost,
 * `1` = black, rows `rowBytes` bytes apart (`rowBytes` even and
 * `≥ ceil(width / 8)`, exactly as `GrafTypes.a` / `BitBlt.a` lay it out).
 * This is the original Macintosh layout, and also what 1-bit displays and
 * ESC/POS printers consume, so a screen or a page can be handed to hardware
 * without conversion.
 *
 * Every other module reads and writes pixels through these helpers; nothing
 * else indexes `baseAddr` directly.
 */
import { makeRect, type BitMap } from "./types";

/**
 * Row stride for a `width`-pixel bitmap: rounded up to a whole 16-bit word,
 * as `BitBlt.a` moves words and Inside Macintosh requires `rowBytes` even.
 */
export function rowBytesFor(width: number): number {
  return ((width + 15) >> 4) << 1;
}

/** Allocate a white `width` × `height` bitmap with bounds at the origin. */
export function newBitMap(width: number, height: number): BitMap {
  const w = Math.max(0, width | 0);
  const h = Math.max(0, height | 0);
  const rowBytes = rowBytesFor(w);
  return { baseAddr: new Uint8Array(rowBytes * h), rowBytes, bounds: makeRect(0, 0, h, w) };
}

export function bitMapWidth(bm: BitMap): number {
  return bm.bounds.right - bm.bounds.left;
}

export function bitMapHeight(bm: BitMap): number {
  return bm.bounds.bottom - bm.bounds.top;
}

/**
 * Read the pixel at `(h, v)` in `bm`'s coordinate space. No bounds check —
 * callers clip first; use {@link bmGetPixel} for a checked read.
 */
export function getBit(bm: BitMap, h: number, v: number): 0 | 1 {
  const x = h - bm.bounds.left;
  const byte = bm.baseAddr[(v - bm.bounds.top) * bm.rowBytes + (x >> 3)];
  return ((byte >> (7 - (x & 7))) & 1) as 0 | 1;
}

/** Write pixel `(h, v)`; any non-zero `value` is black. No bounds check. */
export function setBit(bm: BitMap, h: number, v: number, value: number): void {
  const x = h - bm.bounds.left;
  const i = (v - bm.bounds.top) * bm.rowBytes + (x >> 3);
  const mask = 0x80 >> (x & 7);
  if (value & 1) bm.baseAddr[i] |= mask;
  else bm.baseAddr[i] &= ~mask;
}

/** Set every pixel to white. */
export function clearBitMap(bm: BitMap): void {
  bm.baseAddr.fill(0);
}

// ---------------------------------------------------------------------------
// Byte-wide row operations
//
// `BitBlt.a` never touched pixels one at a time: it combined whole words of
// source and destination under edge masks. These are the equivalents; the
// shape and copy routines use them for every span that has no complex clip
// region, and fall back to `getBit`/`setBit` only where a region mask or a
// scale factor makes the pixels genuinely independent.
// ---------------------------------------------------------------------------

/**
 * Combine `src` into `dst[i]` under `mask` with a QuickDraw transfer mode.
 * `mode & 4` (the "not" variants) inverts the source first; `mode & 3` picks
 * copy / or / xor / bic. Pattern modes (8–15) behave as their `mode & 7`.
 */
export function combineByte(dst: Uint8Array, i: number, src: number, mask: number, mode: number): void {
  const s = (mode & 4 ? src ^ 0xff : src) & mask;
  switch (mode & 3) {
    case 0:
      dst[i] = (dst[i] & ~mask) | s;
      return;
    case 1:
      dst[i] |= s;
      return;
    case 2:
      dst[i] ^= s;
      return;
    default:
      dst[i] &= ~s;
  }
}

/**
 * The 8 pattern pixels that land in a destination byte of `bm`, for a
 * pattern row `patRow` (`pat[y & 7]`). Patterns tile in the bitmap's
 * coordinate space, so when `bounds.left` is not a multiple of 8 the row
 * byte must be rotated to line up with the storage bytes.
 */
export function alignPatternRow(patRow: number, bm: BitMap): number {
  const rot = bm.bounds.left & 7;
  return rot === 0 ? patRow : ((patRow << rot) | (patRow >> (8 - rot))) & 0xff;
}

/**
 * Apply `srcByte` (already aligned with {@link alignPatternRow}) to the
 * pixels `[h0, h1)` of row `v` with transfer `mode`. No bounds check —
 * callers clip first.
 */
export function fillRowBits(bm: BitMap, v: number, h0: number, h1: number, srcByte: number, mode: number): void {
  if (h1 <= h0) return;
  const d = bm.baseAddr;
  const row = (v - bm.bounds.top) * bm.rowBytes;
  const b0 = h0 - bm.bounds.left;
  const b1 = h1 - bm.bounds.left - 1; // last pixel, inclusive
  const first = row + (b0 >> 3);
  const last = row + (b1 >> 3);
  const firstMask = 0xff >> (b0 & 7);
  const lastMask = (0xff << (7 - (b1 & 7))) & 0xff;
  if (first === last) {
    combineByte(d, first, srcByte, firstMask & lastMask, mode);
    return;
  }
  combineByte(d, first, srcByte, firstMask, mode);
  for (let i = first + 1; i < last; i++) combineByte(d, i, srcByte, 0xff, mode);
  combineByte(d, last, srcByte, lastMask, mode);
}

/**
 * Transfer `width` pixels of row `sv` of `src` starting at `sh`, to row `dv`
 * of `dst` starting at `dh`, with transfer `mode`. Handles any bit shift
 * between source and destination. The source span must lie inside `src`'s
 * bounds; the destination span inside `dst`'s. Safe for self-copies within
 * a row (the source bits are read before any destination byte is written).
 */
export function blitRowBits(
  src: BitMap,
  sv: number,
  sh: number,
  dst: BitMap,
  dv: number,
  dh: number,
  width: number,
  mode: number
): void {
  if (width <= 0) return;
  const D = dst.baseAddr;
  const dRow = (dv - dst.bounds.top) * dst.rowBytes;
  const b0 = dh - dst.bounds.left;
  const b1 = b0 + width - 1;
  const first = b0 >> 3;
  const last = b1 >> 3;
  const firstMask = 0xff >> (b0 & 7);
  const lastMask = (0xff << (7 - (b1 & 7))) & 0xff;

  // Source row, as a snapshot when it is also the destination row so a
  // shifted copy cannot feed on its own output.
  const sRow = (sv - src.bounds.top) * src.rowBytes;
  const sameRow = src.baseAddr === D && sRow === dRow;
  const S = sameRow ? src.baseAddr.slice(sRow, sRow + src.rowBytes) : src.baseAddr;
  const sBase = sameRow ? 0 : sRow;
  // Source bit offset (within its row) that lines up with destination bit `8 * first`.
  const delta = sh - src.bounds.left - b0;

  for (let k = first; k <= last; k++) {
    const p = k * 8 + delta; // source bit index within the row; may be negative or past the end
    const byteIdx = sBase + (p >> 3);
    const shift = p & 7;
    // Two source bytes cover any 8-bit window. Bits read from outside the
    // row are always under a cleared mask bit, since the span is in bounds.
    const s =
      shift === 0
        ? S[byteIdx] | 0
        : ((((S[byteIdx] | 0) << 8) | (S[byteIdx + 1] | 0)) >> (8 - shift)) & 0xff;
    const mask = (k === first ? firstMask : 0xff) & (k === last ? lastMask : 0xff);
    combineByte(D, dRow + k, s, mask, mode);
  }
}

/**
 * Pack a 1-byte-per-pixel buffer (`0` = white, non-zero = black; rows
 * `stride` bytes apart) into a new bitmap. Sprites, camera frames and
 * decoded images arrive in this form.
 */
export function bitMapFromPixels(
  pixels: Uint8Array,
  width: number,
  height: number,
  stride: number = width
): BitMap {
  const bm = newBitMap(width, height);
  for (let y = 0; y < height; y++) {
    const src = y * stride;
    const dst = y * bm.rowBytes;
    for (let x = 0; x < width; x++) {
      if (pixels[src + x]) bm.baseAddr[dst + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return bm;
}

/** Unpack `bm` to 1 byte per pixel (`0` / `1`), row-major, `width` pixels per row. */
export function pixelsFromBitMap(bm: BitMap): Uint8Array {
  const w = bitMapWidth(bm);
  const h = bitMapHeight(bm);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const src = y * bm.rowBytes;
    const dst = y * w;
    for (let x = 0; x < w; x++) {
      out[dst + x] = (bm.baseAddr[src + (x >> 3)] >> (7 - (x & 7))) & 1;
    }
  }
  return out;
}
