/**
 * Play a region into a scanline buffer — from `SeekRgn.a` / `GrafTypes.a`.
 *
 * Forward play XORs each row's `[left,right)` spans into `scanBuf`, trimmed
 * to `[minH, maxH)`. Backward seeks reset the buffer and replay from the top.
 */

import { asInt16 } from "./fixmath";
import { RGN_END, type RegionData } from "./regionTypes";
import { growUint16 } from "./scratch";

/**
 * Byte size of a region state record. `GrafTypes.a:190-201`.
 *
 * Layout: rgnPtr, dataPtr, scanBuf, scanSize, thisV, nextV, minH, maxH, leftH.
 */
export const RGNREC = 22;

/**
 * Region playback state (`RGNREC` fields). `GrafTypes.a:190-201`.
 */
export interface RGNREC {
  rgnPtr: RegionData;
  /** Index of the next unread word in `rgnPtr.data`. */
  dataPtr: number;
  /** Word-wide XOR buffer (`scanSize+1` longs = `2*(scanSize+1)` words). */
  scanBuf: Uint16Array;
  /** `#longs - 1` in `scanBuf`. `SeekRgn.a:35-36`. */
  scanSize: number;
  thisV: number;
  nextV: number;
  minH: number;
  maxH: number;
  leftH: number;
}

/**
 * Right-edge masks, bit 15 = leftmost pixel of the word. `Util.a:266-269`.
 * SeekRgn uses `NOT MaskTab[left&15]` as the left mask and `MaskTab[right&15]`
 * as the right mask (`SeekRgn.a:130-142`).
 */
const MASKTAB = [
  0x0000, 0x8000, 0xc000, 0xe000, 0xf000, 0xf800, 0xfc00, 0xfe00, 0xff00, 0xff80,
  0xffc0, 0xffe0, 0xfff0, 0xfff8, 0xfffc, 0xfffe,
];

function rgnWord(data: Int16Array, i: number): number {
  return i < data.length ? data[i]! | 0 : RGN_END;
}

function clearScan(state: RGNREC): void {
  state.scanBuf.fill(0);
}

function fillInit(
  rgn: RegionData,
  state: RGNREC,
  minH: number,
  maxH: number,
  bufLeft: number
): void {
  state.rgnPtr = rgn;
  state.minH = minH | 0;
  state.maxH = maxH | 0;
  state.leftH = bufLeft | 0;
  state.thisV = -32767;
  state.nextV = rgn.rgnBBox.top | 0;
  state.dataPtr = 0;
  // width = maxH - leftH; scanSize = width/32 (#longs - 1). SeekRgn.a:34-36
  const width = ((maxH | 0) - (bufLeft | 0)) & 0xffff;
  state.scanSize = width >>> 5;
  state.scanBuf = growUint16(state.scanBuf, (state.scanSize + 1) * 2);
}

/**
 * `InitRgn` — install clip bounds, reset thisV/nextV/dataPtr, allocate a
 * cleared scan buffer. `SeekRgn.a:11-41`.
 *
 * Short form `(rgn, minH, maxH)` sets `bufLeft := minH` and returns a new
 * record (`Regions.a:972-975`).
 */
export function InitRgn(rgn: RegionData, minH: number, maxH: number): RGNREC;
export function InitRgn(
  rgn: RegionData,
  state: RGNREC,
  minH: number,
  maxH: number,
  bufLeft: number
): void;
export function InitRgn(
  rgn: RegionData,
  stateOrMinH: RGNREC | number,
  minHOrMaxH: number,
  maxH?: number,
  bufLeft?: number
): RGNREC | void {
  if (typeof stateOrMinH === "number") {
    const state = {
      rgnPtr: rgn,
      dataPtr: 0,
      scanBuf: new Uint16Array(0),
      scanSize: 0,
      thisV: 0,
      nextV: 0,
      minH: 0,
      maxH: 0,
      leftH: 0,
    };
    fillInit(rgn, state, stateOrMinH, minHOrMaxH, stateOrMinH);
    return state;
  }
  fillInit(rgn, stateOrMinH, minHOrMaxH, maxH ?? minHOrMaxH, bufLeft ?? minHOrMaxH);
}

/**
 * XOR `[left, right)` (already relative to `leftH`) into `scanBuf`.
 * `SeekRgn.a:128-179`.
 */
function xorSpan(state: RGNREC, left: number, right: number): void {
  const buf = state.scanBuf;
  const leftMask = ~MASKTAB[left & 0xf]! & 0xffff;
  const rightMask = MASKTAB[right & 0xf]!;
  const leftWord = left >>> 4;
  let wordCount = (right >>> 4) - leftWord;
  let p = leftWord;

  if (wordCount <= 0) {
    // Left and right in one word. SeekRgn.a:162-164
    buf[p] = (buf[p]! ^ (leftMask & rightMask)) & 0xffff;
    return;
  }

  // Left word, then full words, then right mask. SeekRgn.a:171-179
  buf[p] = (buf[p]! ^ leftMask) & 0xffff;
  p++;
  wordCount -= 2;
  while (wordCount > 0) {
    // NOT.L — invert two whole words. SeekRgn.a:173
    buf[p] = ~buf[p]! & 0xffff;
    p++;
    buf[p] = ~buf[p]! & 0xffff;
    p++;
    wordCount -= 2;
  }
  if (wordCount === 0) {
    buf[p] = ~buf[p]! & 0xffff;
    p++;
  }
  buf[p] = (buf[p]! ^ rightMask) & 0xffff;
}

/**
 * Play one region row (H pairs until 32767) into `scanBuf`.
 * Returns the data index of the next V. `SeekRgn.a:107-183`.
 */
function playRow(state: RGNREC, i: number): number {
  const data = state.rgnPtr.data;
  const minH = state.minH;
  const maxH = state.maxH;
  const leftH = state.leftH;

  for (;;) {
    const left0 = rgnWord(data, i++);
    if (left0 === RGN_END) return i;
    const right0 = rgnWord(data, i++);
    // Trim / reject against [minH, maxH). SeekRgn.a:111-120
    if (right0 <= minH || left0 >= maxH) continue;
    let left = left0;
    let right = right0;
    if (left < minH) left = minH;
    if (right > maxH) right = maxH;
    left = asInt16(left - leftH);
    right = asInt16(right - leftH);
    xorSpan(state, left & 0xffff, right & 0xffff);
  }
}

/**
 * `SeekRgn(rgnState, vert)` — play forward, or reset-and-replay backward,
 * until `scanBuf` holds the bitmap for `vert`.
 * Returns 1 if the buffer changed, 0 if it was already current. `SeekRgn.a:45-188`.
 */
export function SeekRgn(state: RGNREC, vert: number): number {
  const v = vert | 0;
  // Already in [thisV, nextV). SeekRgn.a:67-72
  if (v >= state.nextV) {
    /* DOWN */
  } else if (v < state.thisV) {
    // Reset and replay from the top. SeekRgn.a:79-89
    clearScan(state);
    state.nextV = state.rgnPtr.rgnBBox.top | 0;
    state.thisV = -32767;
    state.dataPtr = 0;
    if (v < state.nextV) return 1;
  } else {
    return 0;
  }

  // WHILE desired >= NEXTV DO bump down. SeekRgn.a:96-185
  let i = state.dataPtr;
  const data = state.rgnPtr.data;
  for (;;) {
    state.thisV = rgnWord(data, i++);
    i = playRow(state, i);
    state.dataPtr = i;
    state.nextV = rgnWord(data, i);
    if (v < state.nextV) break;
  }
  return 1;
}
