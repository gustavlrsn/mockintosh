/**
 * RgnBlt — block transfer clipped to three regions. `RgnBlt.a`.
 * `DrawRgn` / `FrRgn` live in `regions.ts` (`Regions.a:146-228`).
 */
import type { BitMap, Pattern, Rect, RgnHandle } from "./types";
import { isRectRgn } from "./regionTypes";
import { globals } from "./globals";
import { InitRgn, SeekRgn, type RGNREC } from "./seekRgn";
import { TrimRect } from "./rgnOp";
import { withCursorShield } from "./cursors";
import { ColorMap } from "./colorMap";
import { PatExpand, type ExpandedPattern } from "./patExpand";
import { applyPixel, BitBlt, forMaskSpans, rsect } from "./bitBltCore";
import { blitRowBits, fillRowBits } from "./packedBits";
import { acquireMaskWords, rgnSlots, snapshotRow } from "./scratch";

export { BitBlt } from "./bitBltCore";

function and2(dst: Uint16Array, a: Uint16Array, b: Uint16Array, n: number): void {
  for (let i = 0; i < n; i++) dst[i] = (a[i]! & b[i]!) & 0xffff;
}

function and3(dst: Uint16Array, a: Uint16Array, b: Uint16Array, c: Uint16Array, n: number): void {
  for (let i = 0; i < n; i++) dst[i] = (a[i]! & b[i]! & c[i]!) & 0xffff;
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
  // RECTJMP. RgnBlt.a:539-551
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

/**
 * `PROCEDURE RgnBlt(srcBits, dstBits, srcRect, dstRect, mode, pat, rgnA, rgnB, rgnC)`.
 *
 * ColorMap; minRect = dstRect ∩ dstBits.bounds ∩ bboxA ∩ bboxB ∩ bboxC
 * (**never portRect**). ShieldCursor; all-rect or TrimRect(rgnB) → BitBlt;
 * else InitRgn / SEEKMASK AND / mode under mask. `RgnBlt.a:10-821`.
 */
export function RgnBlt(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  mode: number,
  pat: Pattern,
  rgnA: RgnHandle,
  rgnB: RgnHandle,
  rgnC: RgnHandle
): void {
  const mapped = ColorMap(mode, pat); // RgnBlt.a:111-115
  mode = mapped.mode;
  pat = mapped.pat;

  const minRect = rsect([
    dstRect,
    dstBits.bounds,
    rgnA.rgn.rgnBBox,
    rgnB.rgn.rgnBBox,
    rgnC.rgn.rgnBBox,
  ]);
  if (!minRect) return; // RgnBlt.a:144 → GOHOME, no ShowCursor

  withCursorShield(minRect, { v: dstBits.bounds.top, h: dstBits.bounds.left }, () => {
    const aRect = isRectRgn(rgnA.rgn);
    const bRect = isRectRgn(rgnB.rgn);
    const cRect = isRectRgn(rgnC.rgn);

    // All three rectangular, or only visRgn (B) complex and TrimRect says rect.
    // RgnBlt.a:160-208
    let takeBitBlt = false;
    if (aRect && bRect && cRect) {
      takeBitBlt = true;
    } else if (aRect && cRect && !bRect) {
      const t = TrimRect(rgnB.rgn, minRect); // RgnBlt.a:171-175
      if (t < 0) return;
      if (t === 0) takeBitBlt = true;
    }

    if (takeBitBlt) {
      const src2: Rect = {
        top: (minRect.top - dstRect.top + srcRect.top) | 0,
        left: (minRect.left - dstRect.left + srcRect.left) | 0,
        bottom: srcRect.bottom,
        right: srcRect.right,
      };
      BitBlt(srcBits, dstBits, src2, minRect, mode, pat);
      return;
    }

    rgnBltMasked(srcBits, dstBits, srcRect, dstRect, minRect, mode, pat, rgnA, rgnB, rgnC, aRect, bRect, cRect);
  });
}

function rgnBltMasked(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  minRect: Rect,
  mode: number,
  pat: Pattern,
  rgnA: RgnHandle,
  rgnB: RgnHandle,
  rgnC: RgnHandle,
  aRect: boolean,
  bRect: boolean,
  cRect: boolean
): void {
  // BUFLEFT / BUFSIZE. RgnBlt.a:215-223
  const bufLeft =
    (((minRect.left - dstBits.bounds.left) & 0xfff0) + dstBits.bounds.left) | 0;
  const bufSize = ((minRect.right - bufLeft) >>> 5) & 0xffff;
  const words = (bufSize + 1) * 2;
  const maskStore = acquireMaskWords(words);
  const maskBuf = maskStore.length === words ? maskStore : maskStore.subarray(0, words);

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

  let firstV = minRect.top | 0;
  let lastV = minRect.bottom | 0;
  let vBump = 1;

  const m = mode | 0;
  if (m < 0) return; // RgnBlt.a:324
  const invert = (m & 4) !== 0;
  const usePat = (m & 8) !== 0; // after the invert test uses the raw mode. RgnBlt.a:342

  if (!usePat && srcBits.baseAddr === dstBits.baseAddr) {
    const dv =
      (dstRect.top - dstBits.bounds.top - (srcRect.top - srcBits.bounds.top)) | 0;
    if (dv > 0) {
      vBump = -1;
      firstV = (minRect.bottom - 1) | 0;
      lastV = (minRect.top - 1) | 0;
    }
  }

  const exp = usePat
    ? PatExpand(pat, dstBits, globals.patAlign, globals.thePort ? globals.thePort.patStretch : 0, invert)
    : null;
  const op = usePat ? m & 3 : m & 7;

  const spanLeft = minRect.left;
  const spanRight = minRect.right;
  const sameBits = !usePat && srcBits.baseAddr === dstBits.baseAddr;

  for (let v = firstV; v !== lastV; v += vBump) {
    const mask = seekMask(rectFlag, v, maskBuf, words, stateA, stateB, stateC);
    const srcV = v - dstRect.top + srcRect.top;
    const sameMemRow = sameBits && srcV - srcBits.bounds.top === v - dstBits.bounds.top;
    const rowSrc = sameMemRow ? snapshotRow(srcBits, srcV) : srcBits;
    forMaskSpans(mask, bufLeft, spanLeft, spanRight, (h0, h1) => {
      applyMaskedSpan(rowSrc, dstBits, srcRect, dstRect, srcV, v, h0, h1, exp, op);
    });
  }
}

function applyMaskedSpan(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  srcV: number,
  dstV: number,
  h0: number,
  h1: number,
  exp: ExpandedPattern | null,
  op: number
): void {
  if (h1 <= h0) return;
  if (exp) {
    if (exp.width === 8) {
      fillRowBits(dstBits, dstV, h0, h1, (exp.rows[dstV & 15]! >>> 8) & 0xff, op);
    } else {
      for (let h = h0; h < h1; h++) {
        applyPixel(dstBits, h, dstV, exp.sampleExpanded(h, dstV), op);
      }
    }
    return;
  }
  const srcH = h0 - dstRect.left + srcRect.left;
  blitRowBits(srcBits, srcV, srcH, dstBits, dstV, h0, h1 - h0, op);
}
