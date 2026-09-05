/**
 * Text routines — from `QuickDraw.p` Text Routines section and
 * `reference/QuickDraw/DrawText.a` / `Text.a` implementations.
 *
 * Text rendering delegates to injected font functions registered via
 * {@link __injectFontFunctions} in `globals.ts`.  Without injection, text
 * measurement falls back to 6 pixels per character and drawing is a no-op.
 */

import { FontInfo, Point, Style, GrafPort } from "./types";
import { globals } from "./globals";

// -------------------------------------------------------------------------
// Text attribute setters
// -------------------------------------------------------------------------

/**
 * Set the font number for the current port.
 * `PROCEDURE TextFont(font: INTEGER)` — `0` = system font.
 */
export function TextFont(font: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.txFont = font;
}

/**
 * Set the text style flags (bold, italic, underline, etc.) for the current port.
 * `PROCEDURE TextFace(face: Style)`.
 */
export function TextFace(face: Style): void {
  const port = globals.thePort;
  if (!port) return;
  port.txFace = face;
}

/**
 * Set the text transfer mode for the current port.
 * `PROCEDURE TextMode(mode: INTEGER)` — typically `srcOr` (1).
 */
export function TextMode(mode: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.txMode = mode;
}

/**
 * Set the font size in points for the current port.
 * `PROCEDURE TextSize(size: INTEGER)` — `0` = system default.
 */
export function TextSize(size: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.txSize = size;
}

/**
 * Set the inter-word extra space for the current port.
 * `extra` is a 16.16 Fixed-point value (additional pixels per space character).
 * `PROCEDURE SpaceExtra(extra: LongInt)`.
 */
export function SpaceExtra(extra: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.spExtra = extra;
}

// -------------------------------------------------------------------------
// Text drawing
// -------------------------------------------------------------------------

/**
 * Draw a single character at the current pen position and advance the pen.
 * `PROCEDURE DrawChar(ch: CHAR)`.
 */
export function DrawChar(ch: string): void {
  DrawString(ch);
}

/**
 * Draw a Pascal-style string at the current pen position and advance the pen.
 * `PROCEDURE DrawString(s: Str255)`.
 */
export function DrawString(s: string): void {
  DrawText(s, 0, s.length);
}

/**
 * Draw `byteCount` bytes of `textBuf` starting at `firstByte` at the current
 * pen position, then advance the pen by the rendered width.
 *
 * `textBuf` may be a JavaScript string or a byte array of character codes.
 * Routes through `globals._fontDraw` if injected.
 *
 * `PROCEDURE DrawText(textBuf: QDPtr; firstByte, byteCount: INTEGER)`.
 */
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

/**
 * Return the pixel width of a single character in the current port's font.
 * `FUNCTION CharWidth(ch: CHAR): INTEGER`.
 */
export function CharWidth(ch: string): number {
  const port = globals.thePort;
  if (!port) return 0;
  return _measureString(ch, port);
}

/**
 * Return the pixel width of a string in the current port's font.
 * `FUNCTION StringWidth(s: Str255): INTEGER`.
 */
export function StringWidth(s: string): number {
  const port = globals.thePort;
  if (!port) return 0;
  return _measureString(s, port);
}

/**
 * Return the pixel width of `byteCount` bytes of `textBuf` starting at
 * `firstByte`.  Matches {@link DrawText} in its string/array duality.
 * `FUNCTION TextWidth(textBuf: QDPtr; firstByte, byteCount: INTEGER): INTEGER`.
 */
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

/**
 * Fill `info` with vertical font metrics for the current port's font.
 * Returns approximate values for the classic Mac system font (Chicago/Geneva
 * 9pt, ~12px tall) when no font injection is available.
 *
 * `PROCEDURE GetFontInfo(VAR info: FontInfo)`.
 */
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

/**
 * Default text bottleneck.  Converts the `textAddr` byte array to a string
 * and delegates to {@link DrawText}.
 *
 * `numer` and `denom` are scaling factors (unused in this implementation).
 */
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

/**
 * Default text-measurement bottleneck.  Returns the pixel width of `count`
 * bytes of `textAddr`.
 *
 * `numer`, `denom`, and `info` are unused scaling/metric parameters included
 * for API compatibility.
 */
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
