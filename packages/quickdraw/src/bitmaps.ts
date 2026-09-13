/**
 * BitMap operations — `Bitmaps.a` CopyBits / StdBits / ScrollRect.
 *
 * StdBits records `$90`/`$91`/`$98`/`$99` (PackBits when `rowBytes ≥ 8`).
 */

import type { BitMap, Rect, RgnHandle } from "./types";
import { globals, requirePort } from "./globals";
import { asInt16 } from "./fixmath";
import { withCursorShield } from "./cursors";
import { RgnBlt } from "./rgnBlt";
import { StretchBits } from "./stretchBits";
import { PackBits } from "./packBits";
import {
  CheckPic,
  PutPicByte,
  PutPicData,
  PutPicRgn,
  PutPicWord,
} from "./picSave";
import {
  CopyRgn,
  DiffRgn,
  NewRgn,
  OffsetRgn,
  RectRgn,
  SectRgn,
  SetEmptyRgn,
} from "./regions";
import { patCopy, srcCopy } from "./constants";

function sameTopLeft(a: Rect, b: Rect): boolean {
  return a.top === b.top && a.left === b.left;
}

/** `baseAddr && bounds.topLeft` (`Bitmaps.a:228-237`). Odd-port check is N/A. */
function isToPort(dstBits: BitMap): boolean {
  const port = globals.thePort;
  if (!port) return false;
  if (port.portBits.baseAddr !== dstBits.baseAddr) return false;
  return sameTopLeft(port.portBits.bounds, dstBits.bounds);
}

function putRectBytes(r: Rect): void {
  const words = [r.top, r.left, r.bottom, r.right];
  const out = new Uint8Array(8);
  for (let i = 0; i < 4; i++) {
    const w = asInt16(words[i]!);
    out[i * 2] = (w >> 8) & 0xff;
    out[i * 2 + 1] = w & 0xff;
  }
  PutPicData(out);
}

/**
 * `PROCEDURE StdBits` (`Bitmaps.a:18-185`).
 * CheckPic + `$90`/`$91`/`$98`/`$99`, then StretchBits if `pnVis ≥ 0`.
 */
export function StdBits(
  srcBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  mode: number,
  maskRgn: RgnHandle | null
): void {
  const port = requirePort();
  if (CheckPic()) {
    let top = asInt16(srcBits.bounds.top);
    let left = asInt16(srcBits.bounds.left);
    let bottom = asInt16(srcBits.bounds.bottom);
    let right = asInt16(srcBits.bounds.right);
    const oldRow = asInt16(srcBits.rowBytes);
    let base = 0;

    const skipTop = asInt16(asInt16(srcRect.top) - top);
    if (skipTop > 0) {
      top = asInt16(srcRect.top);
      base += skipTop * oldRow;
    }
    if (asInt16(srcRect.bottom) < bottom) bottom = asInt16(srcRect.bottom);

    const skipLeft = asInt16(asInt16(srcRect.left) - left);
    if (skipLeft > 0) {
      const skipBytes = skipLeft >>> 3;
      base += skipBytes;
      left = asInt16(left + (skipBytes << 3));
    }

    let newRight = asInt16(srcRect.right) - left;
    newRight = ((newRight + 7) >>> 3) << 3;
    newRight = asInt16(newRight + left);
    if (newRight < right) right = newRight;

    let newRow = asInt16(right - left);
    newRow = (newRow + 15) >>> 4;
    if (newRow > 0) {
      newRow = newRow << 1;
      let op = 0x90;
      if (maskRgn) op += 1;
      if (newRow >= 8) op += 8;
      PutPicByte(op);
      PutPicWord(newRow);
      PutPicWord(top);
      PutPicWord(left);
      PutPicWord(bottom);
      PutPicWord(right);
      putRectBytes(srcRect);
      putRectBytes(dstRect);
      PutPicWord(mode);
      if (maskRgn) PutPicRgn(maskRgn);

      const height = asInt16(bottom - top);
      const src = srcBits.baseAddr;
      if (newRow >= 8) {
        const packBuf = new Uint8Array(Math.max(16, newRow * 2 + 16));
        for (let row = 0; row < height; row++) {
          const srcPtr = { value: base + row * oldRow };
          const dstPtr = { value: 0 };
          PackBits(src, srcPtr, packBuf, dstPtr, newRow);
          PutPicByte(dstPtr.value);
          PutPicData(packBuf.subarray(0, dstPtr.value));
        }
      } else {
        for (let row = 0; row < height; row++) {
          const off = base + row * oldRow;
          PutPicData(src.subarray(off, off + newRow));
        }
      }
    }
  }

  if ((port.pnVis | 0) < 0) return; // Bitmaps.a:170-171
  StretchBits(
    srcBits,
    port.portBits,
    srcRect,
    dstRect,
    mode,
    port.clipRgn,
    port.visRgn,
    maskRgn ?? globals.wideOpen
  );
}

/**
 * `PROCEDURE CopyBits` (`Bitmaps.a:189-275`).
 * Screen source → `ShieldCursor`; to-port → `bitsProc ?? StdBits`;
 * else `StretchBits(…, wideOpen, wideOpen, mask ?? wideOpen)`.
 */
export function CopyBits(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  mode: number,
  maskRgn: RgnHandle | null
): void {
  const fromScreen = srcBits.baseAddr === globals.screenBits.baseAddr;
  const copy = (): void => {
    if (isToPort(dstBits)) {
      const port = globals.thePort!;
      const proc = port.grafProcs?.bitsProc ?? StdBits;
      proc(srcBits, srcRect, dstRect, mode, maskRgn);
    } else {
      StretchBits(
        srcBits,
        dstBits,
        srcRect,
        dstRect,
        mode,
        globals.wideOpen,
        globals.wideOpen,
        maskRgn ?? globals.wideOpen
      );
    }
  };
  if (fromScreen) {
    withCursorShield(srcRect, { h: srcBits.bounds.left, v: srcBits.bounds.top }, copy);
  } else {
    copy();
  }
}

/**
 * `PROCEDURE ScrollRect` (`Bitmaps.a:759-884`).
 * `pnVis < 0` or `(dh,dv) = 0` → empty `updateRgn`. Else two `RgnBlt`s:
 * copy through src∩dst, then erase the update with `bkPat`.
 */
export function ScrollRect(
  dstRect: Rect,
  dh: number,
  dv: number,
  updateRgn: RgnHandle
): void {
  const port = requirePort();
  dh = asInt16(dh);
  dv = asInt16(dv);
  if ((port.pnVis | 0) < 0 || (dh === 0 && dv === 0)) {
    SetEmptyRgn(updateRgn); // Bitmaps.a:880-881
    return;
  }

  const srcRgn = NewRgn();
  const dstRgn = NewRgn();
  RectRgn(srcRgn, dstRect);
  SectRgn(srcRgn, port.visRgn, srcRgn);
  SectRgn(srcRgn, port.clipRgn, srcRgn);
  CopyRgn(srcRgn, dstRgn);
  OffsetRgn(dstRgn, dh, dv);

  const srcRect: Rect = {
    top: (dstRect.top - dv) | 0,
    left: (dstRect.left - dh) | 0,
    bottom: (dstRect.bottom - dv) | 0,
    right: (dstRect.right - dh) | 0,
  };

  DiffRgn(srcRgn, dstRgn, updateRgn);

  withCursorShield(dstRect, { h: port.portBits.bounds.left, v: port.portBits.bounds.top }, () => {
    RgnBlt(
      port.portBits,
      port.portBits,
      srcRect,
      dstRect,
      srcCopy,
      globals.white,
      dstRgn,
      srcRgn,
      globals.wideOpen
    );
    RgnBlt(
      port.portBits,
      port.portBits,
      dstRect,
      dstRect,
      patCopy,
      port.bkPat,
      updateRgn,
      globals.wideOpen,
      globals.wideOpen
    );
  });
}
