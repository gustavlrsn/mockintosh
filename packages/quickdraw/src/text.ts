// Text routines — from QuickDraw.p Text Routines section
// and reference/QuickDraw/DrawText.a / Text.a implementations.
//
// Text rendering bridges to the injected font functions from globals.
// Without injection, text drawing is a no-op (falls back gracefully).

import { FontInfo, Point, Style, GrafPort } from "./types";
import { globals } from "./globals";

// -------------------------------------------------------------------------
// Text attribute setters
// -------------------------------------------------------------------------

// PROCEDURE TextFont(font: INTEGER);
export function TextFont(font: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.txFont = font;
}

// PROCEDURE TextFace(face: Style);
export function TextFace(face: Style): void {
  const port = globals.thePort;
  if (!port) return;
  port.txFace = face;
}

// PROCEDURE TextMode(mode: INTEGER);
export function TextMode(mode: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.txMode = mode;
}

// PROCEDURE TextSize(size: INTEGER);
export function TextSize(size: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.txSize = size;
}

// PROCEDURE SpaceExtra(extra: LongInt);
// extra is a Fixed-point value — additional pixels between words.
export function SpaceExtra(extra: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.spExtra = extra;
}

// -------------------------------------------------------------------------
// Text drawing
// -------------------------------------------------------------------------

// PROCEDURE DrawChar(ch: CHAR);
export function DrawChar(ch: string): void {
  DrawString(ch);
}

// PROCEDURE DrawString(s: Str255);
export function DrawString(s: string): void {
  DrawText(s, 0, s.length);
}

// PROCEDURE DrawText(textBuf: QDPtr; firstByte, byteCount: INTEGER);
// In our implementation textBuf is the string itself.
export function DrawText(
  textBuf: string | number[],
  firstByte: number,
  byteCount: number
): void {
  const port = globals.thePort;
  if (!port) return;

  let text: string;
  if (typeof textBuf === "string") {
    text = textBuf.slice(firstByte, firstByte + byteCount);
  } else {
    text = String.fromCharCode(
      ...textBuf.slice(firstByte, firstByte + byteCount)
    );
  }

  if (globals._fontDraw) {
    globals._fontDraw(text, port.pnLoc.h, port.pnLoc.v, port);
  }

  // Advance pen location horizontally
  const w = _measureString(text, port);
  port.pnLoc.h += w;
}

// -------------------------------------------------------------------------
// Text measurement
// -------------------------------------------------------------------------

// FUNCTION CharWidth(ch: CHAR): INTEGER;
export function CharWidth(ch: string): number {
  const port = globals.thePort;
  if (!port) return 0;
  return _measureString(ch, port);
}

// FUNCTION StringWidth(s: Str255): INTEGER;
export function StringWidth(s: string): number {
  const port = globals.thePort;
  if (!port) return 0;
  return _measureString(s, port);
}

// FUNCTION TextWidth(textBuf: QDPtr; firstByte, byteCount: INTEGER): INTEGER;
export function TextWidth(
  textBuf: string | number[],
  firstByte: number,
  byteCount: number
): number {
  const port = globals.thePort;
  if (!port) return 0;
  let text: string;
  if (typeof textBuf === "string") {
    text = textBuf.slice(firstByte, firstByte + byteCount);
  } else {
    text = String.fromCharCode(
      ...(textBuf as number[]).slice(firstByte, firstByte + byteCount)
    );
  }
  return _measureString(text, port);
}

// PROCEDURE GetFontInfo(VAR info: FontInfo);
export function GetFontInfo(info: FontInfo): void {
  // Defaults: classic Mac system font (Chicago/Geneva 9pt ~12px tall)
  info.ascent = 9;
  info.descent = 3;
  info.widMax = 8;
  info.leading = 2;
}

// -------------------------------------------------------------------------
// Internal measurement helper
// -------------------------------------------------------------------------

function _measureString(text: string, _port: GrafPort): number {
  if (!globals._fontMeasure) {
    // Fallback: 6 pixels per character
    return text.length * 6;
  }
  return globals._fontMeasure(text);
}

// -------------------------------------------------------------------------
// StdText bottleneck
// -------------------------------------------------------------------------

export function StdText(
  count: number,
  textAddr: number[],
  numer: Point,
  denom: Point
): void {
  const port = globals.thePort;
  if (!port) return;
  const text = String.fromCharCode(...textAddr.slice(0, count));
  DrawText(text, 0, count);
}

// StdTxMeas
export function StdTxMeas(
  count: number,
  textAddr: number[],
  _numer: Point,
  _denom: Point,
  _info: FontInfo
): number {
  const port = globals.thePort;
  if (!port) return 0;
  const text = String.fromCharCode(...textAddr.slice(0, count));
  return _measureString(text, port);
}
