/**
 * Text measurement and bottleneck — `Text.a`.
 *
 * Drawing goes `DrawText` → `CallText` → `textProc ?? StdText` → `DrText`.
 * Measurement goes through `txMeasProc ?? StdTxMeas` and `_SwapFont`.
 */

import type { FontInfo, Point, Style } from "./types";
import { asInt16, HiWord, mulDivU16 } from "./fixmath";
import { globals, requirePort } from "./globals";
import { currentSwapFont } from "./fontManager";
import { StdTxMeas } from "./txMeas";
import {
  CheckPic,
  DPutPicByte,
  PutPicByte,
  PutPicData,
  PutPicLong,
  PutPicWord,
} from "./picSave";
import { DrText } from "./drawText";

export { StdTxMeas } from "./txMeas";

/** Pack a Point as the 68k long `v.w << 16 | h.w` (`GrafTypes.a`). */
function packPoint(p: Point): number {
  return ((asInt16(p.v) << 16) | (asInt16(p.h) & 0xffff)) | 0;
}

function unpackInto(p: Point, packed: number): void {
  p.v = asInt16(packed >> 16);
  p.h = asInt16(packed);
}

/** Bytes of `textBuf[firstByte .. firstByte+byteCount)`. */
export function textToBytes(
  textBuf: string | ArrayLike<number>,
  firstByte: number,
  byteCount: number
): number[] {
  const n = Math.max(0, byteCount | 0);
  const start = firstByte | 0;
  const out: number[] = new Array(n);
  if (typeof textBuf === "string") {
    for (let i = 0; i < n; i++) {
      const idx = start + i;
      out[i] = idx >= 0 && idx < textBuf.length ? textBuf.charCodeAt(idx) & 0xff : 0;
    }
    return out;
  }
  for (let i = 0; i < n; i++) out[i] = (textBuf[start + i] ?? 0) & 0xff;
  return out;
}

// -------------------------------------------------------------------------
// Text attribute setters (`Text.a:248-328`)
// -------------------------------------------------------------------------

/** `PROCEDURE TextFont(font: INTEGER)` — `0` = system font. */
export function TextFont(font: number): void {
  requirePort().txFont = font;
}

/** `PROCEDURE TextFace(face: Style)`. */
export function TextFace(face: Style): void {
  requirePort().txFace = face;
}

/** `PROCEDURE TextMode(mode: INTEGER)` — typically `srcOr` (1). */
export function TextMode(mode: number): void {
  requirePort().txMode = mode;
}

/** `PROCEDURE TextSize(size: INTEGER)` — `0` = system default. */
export function TextSize(size: number): void {
  requirePort().txSize = size;
}

/** `PROCEDURE SpaceExtra(extra: LongInt)` — Fixed 16.16 extra per space. */
export function SpaceExtra(extra: number): void {
  requirePort().spExtra = extra | 0;
}

// -------------------------------------------------------------------------
// CallText / drawing (`Text.a:227-357`)
// -------------------------------------------------------------------------

/**
 * `PROCEDURE CallText(count, textAddr)` — push numer/denom `(1,1)` and
 * jump to `textProc ?? StdText` (`Text.a:227-244`).
 */
export function CallText(count: number, textAddr: number[]): void {
  const port = requirePort();
  const numer = { h: 1, v: 1 };
  const denom = { h: 1, v: 1 };
  const proc = port.grafProcs?.textProc ?? StdText;
  proc(count | 0, textAddr, numer, denom);
}

/** `PROCEDURE DrawChar(ch: CHAR)`. */
export function DrawChar(ch: string): void {
  CallText(1, [ch.charCodeAt(0) & 0xff]);
}

/** `PROCEDURE DrawString(s: Str255)`. */
export function DrawString(s: string): void {
  CallText(s.length, textToBytes(s, 0, s.length));
}

/**
 * `PROCEDURE DrawText(textBuf; firstByte, byteCount)`.
 * Routes through {@link CallText}, never through `DrText` directly.
 */
export function DrawText(
  textBuf: string | number[],
  firstByte: number,
  byteCount: number
): void {
  CallText(byteCount | 0, textToBytes(textBuf, firstByte, byteCount));
}

// -------------------------------------------------------------------------
// Measurement (`Text.a:360-736`)
// -------------------------------------------------------------------------

function callTxMeas(
  count: number,
  textAddr: number[],
  numer: Point,
  denom: Point,
  info: FontInfo
): number {
  const port = requirePort();
  const proc = port.grafProcs?.txMeasProc ?? StdTxMeas;
  return proc(count, textAddr, numer, denom, info);
}

/**
 * `FUNCTION TEXTWIDTH` (`Text.a:377-430`).
 * Unscaled width from `txMeasProc`, then unsigned mul/div by numer.h/denom.h
 * with `+ denom/2` rounding when they differ.
 */
export function TextWidth(
  textBuf: string | number[],
  firstByte: number,
  byteCount: number
): number {
  const n = byteCount | 0;
  if (n <= 0) return 0;
  const bytes = textToBytes(textBuf, firstByte, n);
  const numer = { h: 1, v: 1 };
  const denom = { h: 1, v: 1 };
  const info: FontInfo = { ascent: 0, descent: 0, widMax: 0, leading: 0 };
  let width = callTxMeas(n, bytes, numer, denom, info) | 0;
  const nh = asInt16(numer.h);
  const dh = asInt16(denom.h);
  if (nh !== dh) {
    width = mulDivU16(width, nh, dh, dh >> 1);
  }
  return asInt16(width);
}

/** `FUNCTION StringWidth(s: Str255)`. Falls through to {@link TextWidth}. */
export function StringWidth(s: string): number {
  return TextWidth(s, 0, s.length);
}

/** `FUNCTION CharWidth(ch: CHAR)`. */
export function CharWidth(ch: string): number {
  return TextWidth([ch.charCodeAt(0) & 0xff], 0, 1);
}

/**
 * `PROCEDURE MeasureText` (`Text.a:517-592`).
 * Writes `count+1` scaled integer locations into `charLocs`.
 */
export function MeasureText(
  count: number,
  textAddr: string | number[],
  charLocs: number[]
): void {
  const port = requirePort();
  const n = count | 0;
  const bytes = textToBytes(textAddr, 0, Math.max(0, n));
  const out = currentSwapFont()({
    family: port.txFont | 0,
    size: port.txSize | 0,
    face: port.txFace,
    needBits: true,
    device: port.device | 0,
    numer: { h: 1, v: 1 },
    denom: { h: 1, v: 1 },
  });
  globals.fontPtr = out;
  const numerH = asInt16(out.numer.h);
  const denomH = asInt16(out.denom.h);
  const widths = out.widthTable;
  let acc = 0;
  // DBRA count → count+1 stores; last width add is unused (`Text.a:564-572`).
  for (let i = 0; i <= n; i++) {
    charLocs[i] = asInt16(HiWord(acc));
    if (i < n) acc = (acc + (widths[(bytes[i] ?? 0) & 0xff] ?? 0)) | 0;
  }
  if (numerH !== denomH) {
    const half = denomH >> 1;
    for (let i = 0; i <= n; i++) {
      charLocs[i] = asInt16(mulDivU16(charLocs[i]!, numerH, denomH, half));
    }
  }
}

/**
 * `PROCEDURE GetFontInfo` (`Text.a:650-736`).
 * Extra added to widMax; shadow bumps ascent by 1 and descent by shadow;
 * all four values round up when numer ≠ denom (13 May 85).
 */
export function GetFontInfo(info: FontInfo): void {
  const numer = { h: 1, v: 1 };
  const denom = { h: 1, v: 1 };
  callTxMeas(0, [], numer, denom, info);

  const fm = globals.fontPtr;
  if (fm) {
    const extra = (fm.extra << 24) >> 24;
    info.widMax = asInt16((info.widMax | 0) + extra);
    const shadow = fm.shadow & 0xff;
    if (shadow !== 0) {
      info.ascent = asInt16((info.ascent | 0) + 1);
      info.descent = asInt16((info.descent | 0) + shadow);
    }
  }

  const packedN = packPoint(numer);
  const packedD = packPoint(denom);
  if (packedN === packedD) return;

  const scaleV = (value: number): number =>
    asInt16(mulDivU16(value, asInt16(numer.v), asInt16(denom.v), (asInt16(denom.v) - 1) & 0xffff));
  const scaleH = (value: number): number =>
    asInt16(mulDivU16(value, asInt16(numer.h), asInt16(denom.h), (asInt16(denom.h) - 1) & 0xffff));

  info.ascent = scaleV(info.ascent);
  info.descent = scaleV(info.descent);
  info.widMax = scaleH(info.widMax);
  info.leading = scaleV(info.leading);
}

// -------------------------------------------------------------------------
// StdText (`Text.a:39-223`)
// -------------------------------------------------------------------------

/**
 * `PROCEDURE StdText(count, textAddr, numer, denom)`.
 * CheckPic; font-state opcodes; `$28–$2B` from `pnLoc` vs `picTxLoc`;
 * 255-char chunks; `DrText`.
 */
export function StdText(
  count: number,
  textAddr: number[],
  numer: Point,
  denom: Point
): void {
  const port = requirePort();
  let remaining = count | 0;
  let offset = 0;
  if (remaining <= 0) return;

  while (remaining > 0) {
    const chunk = remaining > 255 ? 255 : remaining;
    const bytes = textAddr.slice(offset, offset + chunk);

    if (CheckPic()) {
      const s = port.picSave!;
      if ((port.txFont | 0) !== (s.picTxFont | 0)) {
        DPutPicByte(0x03);
        PutPicWord(port.txFont);
        s.picTxFont = port.txFont;
      }
      if ((port.txFace & 0xff) !== (s.picTxFace & 0xff)) {
        DPutPicByte(0x04);
        DPutPicByte(port.txFace);
        s.picTxFace = port.txFace;
      }
      if ((port.txMode | 0) !== (s.picTxMode | 0)) {
        DPutPicByte(0x05);
        PutPicWord(port.txMode);
        s.picTxMode = port.txMode;
      }
      if ((port.txSize | 0) !== (s.picTxSize | 0)) {
        DPutPicByte(0x0d);
        PutPicWord(port.txSize);
        s.picTxSize = port.txSize;
      }
      if ((port.spExtra | 0) !== (s.picSpExtra | 0)) {
        DPutPicByte(0x06);
        PutPicLong(port.spExtra);
        s.picSpExtra = port.spExtra | 0;
      }
      const n = packPoint(numer);
      const d = packPoint(denom);
      if (n !== packPoint(s.picTxNumer) || d !== packPoint(s.picTxDenom)) {
        DPutPicByte(0x10);
        PutPicLong(n);
        PutPicLong(d);
        unpackInto(s.picTxNumer, n);
        unpackInto(s.picTxDenom, d);
      }

      const delta = (packPoint(port.pnLoc) - packPoint(s.picTxLoc)) | 0;
      if ((delta & 0xff00ff00) === 0) {
        const dh = delta & 0xff;
        const dv = (delta >>> 16) & 0xff;
        if (dv === 0) {
          DPutPicByte(0x29);
          DPutPicByte(dh);
        } else if (dh === 0) {
          DPutPicByte(0x2a);
          DPutPicByte(dv);
        } else {
          DPutPicByte(0x2b);
          DPutPicByte(dh);
          DPutPicByte(dv);
        }
      } else {
        DPutPicByte(0x28);
        PutPicLong(packPoint(port.pnLoc));
      }
      PutPicByte(chunk);
      PutPicData(bytes);
      s.picTxLoc = { h: port.pnLoc.h, v: port.pnLoc.v };
    }

    DrText(chunk, bytes, { h: numer.h, v: numer.v }, { h: denom.h, v: denom.v });

    remaining -= chunk;
    offset += chunk;
  }
}
