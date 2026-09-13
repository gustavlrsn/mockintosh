/**
 * StretchBits — scale a rectangle of bits through a 3-region clip.
 * `Stretch.a:6-1163`.
 *
 * ColorMap (pattern-bit → RgnBlt fill); same-size → RgnBlt; else vertical
 * DDA with `VERROR = −denom.v/2`, OR-merge on shrink, replicate on stretch,
 * horizontal STRETCH (`err = ratio/2`) / SHRINK (OR). Phase is anchored to
 * the unclipped `dstRect`. Table fast paths are omitted (pixel-identical
 * general DDA).
 */
import type { BitMap, Pattern, Rect, RgnHandle } from "./types";
import { isRectRgn } from "./regionTypes";
import { asInt16, FixRatio } from "./fixmath";
import { InitRgn, SeekRgn, type RGNREC } from "./seekRgn";
import { withCursorShield } from "./cursors";
import { ColorMap } from "./colorMap";
import { RgnBlt } from "./rgnBlt";
import { forMaskSpans, rsect, srcPixel, xorSlab } from "./bitBltCore";
import { applyBitRow } from "./packedBits";
import { acquireMaskWords, acquireStretchBufs, rgnSlots } from "./scratch";

const DUMMY_PAT: Pattern = new Uint8Array(8);

function and2(dst: Uint16Array, a: Uint16Array, b: Uint16Array, n: number): void {
  for (let i = 0; i < n; i++) dst[i] = (a[i]! & b[i]!) & 0xffff;
}

function and3(dst: Uint16Array, a: Uint16Array, b: Uint16Array, c: Uint16Array, n: number): void {
  for (let i = 0; i < n; i++) dst[i] = (a[i]! & b[i]! & c[i]!) & 0xffff;
}

function add16(a: number, b: number): number {
  return asInt16(a + b);
}

function add16c(a: number, b: number): { sum: number; carry: boolean } {
  const s = (a & 0xffff) + (b & 0xffff);
  return { sum: s & 0xffff, carry: s > 0xffff };
}

function seekMask(
  rectFlag: number,
  vert: number,
  maskBuf: Uint16Array,
  words: number,
  stateA: RGNREC,
  stateB: RGNREC,
  stateC: RGNREC
): Uint16Array {
  // Stretch.a:494-506 — same RECTJMP as RgnBlt
  switch (rectFlag) {
    case 2:
      SeekRgn(stateA, vert);
      return stateA.scanBuf;
    case 4:
      SeekRgn(stateB, vert);
      return stateB.scanBuf;
    case 8:
      SeekRgn(stateC, vert);
      return stateC.scanBuf;
    case 6: {
      const ca = SeekRgn(stateA, vert);
      const cb = SeekRgn(stateB, vert);
      if (ca | cb) and2(maskBuf, stateA.scanBuf, stateB.scanBuf, words);
      return maskBuf;
    }
    case 10: {
      const ca = SeekRgn(stateA, vert);
      const cc = SeekRgn(stateC, vert);
      if (ca | cc) and2(maskBuf, stateA.scanBuf, stateC.scanBuf, words);
      return maskBuf;
    }
    case 12: {
      const cb = SeekRgn(stateB, vert);
      const cc = SeekRgn(stateC, vert);
      if (cb | cc) and2(maskBuf, stateB.scanBuf, stateC.scanBuf, words);
      return maskBuf;
    }
    case 14: {
      const ca = SeekRgn(stateA, vert);
      const cb = SeekRgn(stateB, vert);
      const cc = SeekRgn(stateC, vert);
      if (ca | cb | cc) and3(maskBuf, stateA.scanBuf, stateB.scanBuf, stateC.scanBuf, words);
      return maskBuf;
    }
    default:
      return maskBuf;
  }
}

type RatioKind = "abort" | "copy" | "stretch" | "shrink";

/** SetupStretch. `Stretch.a:717-808`. Table cases fold into stretch/shrink. */
function setupStretch(numerH: number, denomH: number): { kind: RatioKind; fraction: number } {
  if (numerH <= 0 || denomH <= 0) return { kind: "abort", fraction: 0 }; // Stretch.a:737-740
  if (numerH === denomH) return { kind: "copy", fraction: 0 }; // Stretch.a:741-742
  if (numerH > denomH) {
    return { kind: "stretch", fraction: FixRatio(denomH, numerH) & 0xffff }; // Stretch.a:749-753
  }
  return { kind: "shrink", fraction: FixRatio(numerH, denomH) & 0xffff }; // Stretch.a:793-797
}

/**
 * General STRETCH: err = ratio/2, replicate the current src bit until
 * `err += ratio` carries. `Stretch.a:1125-1158`.
 */
function stretchRow(src: Uint8Array, dst: Uint8Array, ratio: number): void {
  if (ratio === 0) return; // ADD #0 never carries; original hangs. Stretch.a:1139
  let err = ratio >>> 1;
  let si = 0;
  let bit: 0 | 1 = (src[si++] ?? 0) as 0 | 1;
  for (let di = 0; di < dst.length; di++) {
    dst[di] = bit;
    const a = add16c(err, ratio);
    err = a.sum;
    if (a.carry) bit = (src[si++] ?? 0) as 0 | 1;
  }
}

/**
 * General SHRINK: OR src bits into the current dest bit until
 * `err += ratio` carries. `Stretch.a:1095-1117`.
 */
function shrinkRow(src: Uint8Array, dst: Uint8Array, ratio: number): void {
  if (ratio === 0) return; // ADD #0 never carries; original hangs. Stretch.a:1109
  let err = ratio >>> 1;
  let acc: 0 | 1 = 0;
  let di = 0;
  let si = 0;
  // Keep consuming src (0 after the buffer) until dest is full. Stretch.a:1101-1117
  while (di < dst.length) {
    if (src[si++]) acc = 1;
    const a = add16c(err, ratio);
    err = a.sum;
    if (a.carry) {
      dst[di++] = acc;
      acc = 0;
    }
  }
}

function copyRow(src: Uint8Array, dst: Uint8Array): void {
  dst.set(src.subarray(0, dst.length));
}

/**
 * `PROCEDURE StretchBits(srcBits, dstBits, srcRect, dstRect, mode, rgnA, rgnB, rgnC)`.
 * `Stretch.a:6-487`.
 */
export function StretchBits(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  mode: number,
  rgnA: RgnHandle,
  rgnB: RgnHandle,
  rgnC: RgnHandle
): void {
  const numerV = asInt16(dstRect.bottom - dstRect.top);
  const numerH = asInt16(dstRect.right - dstRect.left);
  const denomV = asInt16(srcRect.bottom - srcRect.top);
  const denomH = asInt16(srcRect.right - srcRect.left);

  // Long compare of (height,width). Stretch.a:89-115
  if (numerV === denomV && numerH === denomH) {
    RgnBlt(srcBits, dstBits, srcRect, dstRect, mode, DUMMY_PAT, rgnA, rgnB, rgnC);
    return;
  }

  const hz = setupStretch(numerH, denomH); // Stretch.a:120

  const mapped = ColorMap(mode, DUMMY_PAT); // Stretch.a:129-137
  if ((mapped.mode | 0) & 8) {
    RgnBlt(srcBits, dstBits, srcRect, dstRect, mapped.mode, mapped.pat, rgnA, rgnB, rgnC);
    return;
  }
  mode = mapped.mode;

  const minRect = rsect([
    dstRect,
    dstBits.bounds,
    rgnA.rgn.rgnBBox,
    rgnB.rgn.rgnBBox,
    rgnC.rgn.rgnBBox,
  ]);
  if (!minRect) return; // Stretch.a:160 → GOHOME, no ShowCursor

  withCursorShield(minRect, { v: dstBits.bounds.top, h: dstBits.bounds.left }, () => {
    stretchLoop(
      srcBits,
      dstBits,
      srcRect,
      dstRect,
      minRect,
      mode,
      numerV,
      numerH,
      denomV,
      denomH,
      hz,
      rgnA,
      rgnB,
      rgnC
    );
  });
}

function stretchLoop(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  minRect: Rect,
  mode: number,
  numerV: number,
  numerH: number,
  denomV: number,
  denomH: number,
  hz: { kind: RatioKind; fraction: number },
  rgnA: RgnHandle,
  rgnB: RgnHandle,
  rgnC: RgnHandle
): void {
  const srcLongs = ((denomH - 1) >>> 5) & 0xffff; // Stretch.a:176-179
  const dstLongs = ((numerH - 1) >>> 5) & 0xffff; // Stretch.a:191-194
  const srcBitCount = (srcLongs + 2) * 32; // copied longs + slop. Stretch.a:181-184
  const dstBitCount = (dstLongs + 1) * 32; // dstLimit = 4*(dstLongs+1). Stretch.a:442-444
  const pooled = acquireStretchBufs(srcBitCount, dstBitCount);
  const srcBuf = pooled.src.length === srcBitCount ? pooled.src : pooled.src.subarray(0, srcBitCount);
  const dstBuf = pooled.dst.length === dstBitCount ? pooled.dst : pooled.dst.subarray(0, dstBitCount);

  // BUFLEFT from unclipped dstRect.left. Stretch.a:207-216
  const bufLeft =
    (((dstRect.left - dstBits.bounds.left) & 0xfff0) + dstBits.bounds.left) | 0;
  const bufSize = ((minRect.right - bufLeft) >>> 5) & 0xffff;
  const words = (bufSize + 1) * 2;
  const maskStore = acquireMaskWords(words);
  const maskBuf = maskStore.length === words ? maskStore : maskStore.subarray(0, words);

  const aRect = isRectRgn(rgnA.rgn);
  const bRect = isRectRgn(rgnB.rgn);
  const cRect = isRectRgn(rgnC.rgn);
  const [stateA, stateB, stateC] = rgnSlots();
  let rectFlag = 0;
  if (!aRect) {
    rectFlag += 2;
    InitRgn(rgnA.rgn, stateA, minRect.left, minRect.right, bufLeft);
  }
  if (!bRect) {
    rectFlag += 4;
    InitRgn(rgnB.rgn, stateB, minRect.left, minRect.right, bufLeft);
  }
  if (!cRect) {
    rectFlag += 8;
    InitRgn(rgnC.rgn, stateC, minRect.left, minRect.right, bufLeft);
  }

  if (rectFlag === 0) {
    // Draw minRect into the mask. Stretch.a:282-289
    xorSlab(maskBuf, (minRect.left - bufLeft) | 0, (minRect.right - bufLeft) | 0);
  }

  const m = mode | 0;
  if (m < 0) return; // Stretch.a:299
  const invert = (m & 4) !== 0;
  let raw = m;
  if (invert) raw = (raw & ~4) | 0;
  if (raw > 7) return; // Stretch.a:309-310
  const op = raw & 3;

  const srcHgt = (srcBits.bounds.bottom - srcBits.bounds.top) | 0;
  let srcV = srcRect.top | 0;

  const srcPastEnd = (): boolean => {
    return ((srcV - srcBits.bounds.top) | 0) >= srcHgt;
  };

  const fillSrc = (orMerge: boolean): boolean => {
    if (srcPastEnd()) return false;
    const rowLeft = srcRect.left | 0;
    for (let i = 0; i < srcBitCount; i++) {
      const bit = srcPixel(srcBits, rowLeft + i, srcV);
      srcBuf[i] = orMerge ? srcBuf[i]! | bit : bit;
    }
    srcV += 1;
    return true;
  };

  const horizScale = (): void => {
    dstBuf.fill(0);
    if (hz.kind === "abort") return; // SetupStretch → DONE. Stretch.a:736-740
    if (hz.kind === "copy") {
      copyRow(srcBuf, dstBuf);
      return;
    }
    if (hz.kind === "stretch") stretchRow(srcBuf, dstBuf, hz.fraction);
    else shrinkRow(srcBuf, dstBuf, hz.fraction);
  };

  // VERROR := −DENOM.V/2. Stretch.a:384-388
  let vError = asInt16(-((denomV & 0xffff) >>> 1));

  const nextSrc = (): boolean => {
    srcBuf.fill(0);
    if (!fillSrc(false)) return false; // Stretch.a:394-397
    vError = add16(vError, numerV); // Stretch.a:408-409
    while (vError <= 0) {
      if (!fillSrc(true)) break; // OR-merge. Stretch.a:417-432
      vError = add16(vError, numerV);
    }
    horizScale();
    return true;
  };

  if (!nextSrc()) return;

  let vert = dstRect.top | 0; // phase anchored to unclipped dstRect. Stretch.a:362
  for (;;) {
    if (vert >= minRect.top) {
      const mask = seekMask(rectFlag, vert, maskBuf, words, stateA, stateB, stateC);
      forMaskSpans(mask, bufLeft, minRect.left, minRect.right, (h0, h1) => {
        applyBitRow(dstBits, vert, h0, h1, dstBuf, dstRect.left, invert, op);
      });
    }
    vert += 1;
    if (vert === minRect.bottom) return; // Stretch.a:471-472
    vError = add16(vError, -denomV); // Stretch.a:473-474
    if (vError >= 0) continue; // replicate dest row. Stretch.a:475
    if (!nextSrc()) return; // Stretch.a:476
  }
}
