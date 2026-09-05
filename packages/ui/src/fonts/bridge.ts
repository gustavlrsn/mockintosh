import type { BitMap, GrafPort } from "@mockintosh/quickdraw";
import {
  __injectFontFunctions,
  setBit,
  DrawString,
  GetPort,
  MoveTo,
  SetPort,
  globals,
} from "@mockintosh/quickdraw";
import {
  getGlyphIndexForChar,
  getGlyphPixel,
  measureDeckerText,
} from "./font";
import { initBuiltinFonts, requireFont } from "./registry";

let bridgeInstalled = false;

/**
 * Install the font measurement and rendering callbacks into QuickDraw.
 * Call once during createUI() initialization.
 */
export function installFontBridge(): void {
  if (bridgeInstalled) return;
  initBuiltinFonts();

  const measure = (text: string): number => {
    const port = globals.thePort;
    const fontName = port
      ? (port as GrafPort & { _uiFontName?: string })._uiFontName ?? "body"
      : "body";
    const font = requireFont(fontName);
    return measureDeckerText(font, text).width;
  };

  const draw = (text: string, x: number, y: number, port: GrafPort): void => {
    const fontName =
      (port as GrafPort & { _uiFontName?: string })._uiFontName ?? "body";
    const color = (port as GrafPort & { _uiTextColor?: number })._uiTextColor ?? 1;
    const font = requireFont(fontName);
    const bounds = port.portBits.bounds;
    const cl = port.clipRgn?.rgn.rgnBBox;
    const vis = port.visRgn?.rgn.rgnBBox;
    const pr = port.portRect;

    const clipLeft = Math.max(
      cl?.left ?? bounds.left,
      vis?.left ?? bounds.left,
      pr.left,
      bounds.left
    );
    const clipTop = Math.max(
      cl?.top ?? bounds.top,
      vis?.top ?? bounds.top,
      pr.top,
      bounds.top
    );
    const clipRight = Math.min(
      cl?.right ?? bounds.right,
      vis?.right ?? bounds.right,
      pr.right,
      bounds.right
    );
    const clipBottom = Math.min(
      cl?.bottom ?? bounds.bottom,
      vis?.bottom ?? bounds.bottom,
      pr.bottom,
      bounds.bottom
    );

    drawTextToBitMap(
      port.portBits,
      clipLeft,
      clipTop,
      clipRight,
      clipBottom,
      text,
      x,
      y,
      fontName,
      color
    );
  };

  __injectFontFunctions(measure, draw);
  bridgeInstalled = true;
}

function drawTextToBitMap(
  bits: BitMap,
  clipLeft: number,
  clipTop: number,
  clipRight: number,
  clipBottom: number,
  text: string,
  x: number,
  y: number,
  fontName: string,
  color: number
): void {
  if (!text) return;
  const font = requireFont(fontName);
  let cx = x;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") {
      cx = x;
      y += font.glyphHeight;
      continue;
    }

    const glyphIndex = getGlyphIndexForChar(font, ch);
    const charWidth = glyphIndex >= 0 ? (font.glyphWidths[glyphIndex] ?? 0) : 0;
    if (glyphIndex >= 0 && charWidth > 0) {
      const gx = cx | 0;
      const gy = y | 0;

      const x0 = Math.max(0, clipLeft - gx);
      const y0 = Math.max(0, clipTop - gy);
      const x1 = Math.min(charWidth, clipRight - gx);
      const y1 = Math.min(font.glyphHeight, clipBottom - gy);

      for (let gy2 = y0; gy2 < y1; gy2++) {
        for (let gx2 = x0; gx2 < x1; gx2++) {
          if (getGlyphPixel(font, glyphIndex, gx2, gy2)) {
            setBit(bits, gx + gx2, gy + gy2, color);
          }
        }
      }
    }
    cx += charWidth + font.spacing;
  }
}

/**
 * Measure text width for a given font name.
 */
export function measureText(text: string, fontName: string = "body"): number {
  const font = requireFont(fontName);
  return measureDeckerText(font, text).width;
}

/** Line height of a named font, in pixels. */
export function fontLineHeight(fontName: string = "body"): number {
  return requireFont(fontName).glyphHeight;
}

/**
 * Draw one line of text on `port` with a named UI font, `(x, y)` being the
 * top-left of the line — the same origin `<text>` nodes use. For hosts that
 * paint outside the node tree (print pages, rasters); clipped to the port.
 */
export function drawString(
  port: GrafPort,
  text: string,
  x: number,
  y: number,
  fontName: string = "body",
  color: number = 1
): void {
  const meta = port as GrafPort & { _uiFontName?: string; _uiTextColor?: number };
  const previous = GetPort();
  const savedFont = meta._uiFontName;
  const savedColor = meta._uiTextColor;
  SetPort(port);
  meta._uiFontName = fontName;
  meta._uiTextColor = color;
  MoveTo(x, y);
  DrawString(text);
  meta._uiFontName = savedFont;
  meta._uiTextColor = savedColor;
  if (previous) SetPort(previous);
}
