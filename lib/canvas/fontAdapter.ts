import { BitCanvas, BLACK } from "./BitCanvas";
import {
  getGlyphIndexForChar,
  getGlyphPixel,
  measureDeckerText,
  type FontName,
} from "../fonts/DeckerFont";
import {
  initDeckerFonts,
  registerDeckerFont,
  requireDeckerFont,
} from "../fonts/DeckerFontRegistry";
import { alignTextX, type TextAlign } from "../fonts/DeckerTextLayout";
import { resolveTextColor } from "./ColorSystem";

export interface TextOptions {
  font?: FontName;
  align?: TextAlign;
  spacing?: number;
  lineHeight?: number;
  color?: number; // BLACK or WHITE
  bg?: number | null; // background color, or null for transparent
  width?: number;
  height?: number;
  padding?: number;
}

export interface LineBoxMetrics {
  glyphHeight: number;
  lineHeight: number;
  glyphOffsetY: number;
}

// --- Measurement ---

export function getLineHeight(font: FontName): number {
  return requireDeckerFont(font).glyphHeight;
}

export function resolveLineBox(
  font: FontName,
  opts: {
    lineHeight?: number;
    lineSpacing?: number;
  } = {}
): LineBoxMetrics {
  const glyphHeight = getLineHeight(font);
  const requestedLineHeight =
    opts.lineHeight ?? glyphHeight + (opts.lineSpacing ?? 0);
  const lineHeight = Math.max(1, Math.floor(requestedLineHeight));

  return {
    glyphHeight,
    lineHeight,
    glyphOffsetY: Math.max(0, lineHeight - glyphHeight),
  };
}

function countTextLines(text: string): number {
  if (!text) return 1;

  let lines = 1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") lines += 1;
  }
  return lines;
}

export function measureText(
  text: string,
  font: FontName = "body",
  spacing: number = 0
): number {
  const size = measureDeckerText(requireDeckerFont(font), text).width;
  if (!text || spacing === 0) return size;

  let trackedChars = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "\n") trackedChars += 1;
  }
  return size + trackedChars * spacing;
}

// --- Drawing ---

/**
 * Blit a single glyph into BitCanvas, respecting the clip rect.
 */
function blitGlyph(
  canvas: BitCanvas,
  fontName: FontName,
  ch: string,
  dx: number,
  dy: number,
  color: number
): void {
  dx = dx | 0;
  dy = dy | 0;
  const font = requireDeckerFont(fontName);
  const glyphIndex = getGlyphIndexForChar(font, ch);
  if (glyphIndex < 0) return;
  const gw = measureText(ch, fontName, 0) - font.spacing;
  const gh = font.glyphHeight;
  const clip = canvas.getClip();
  const pixels = canvas.pixels;
  const cw = canvas.width;

  const x0 = Math.max(0, clip.x - dx);
  const y0 = Math.max(0, clip.y - dy);
  const x1 = Math.min(gw, clip.x + clip.w - dx, cw - dx);
  const y1 = Math.min(gh, clip.y + clip.h - dy, canvas.height - dy);

  for (let gy = y0; gy < y1; gy++) {
    const ty = dy + gy;
    if (ty < 0) continue;
    const dstRow = ty * cw;
    for (let gx = x0; gx < x1; gx++) {
      if (getGlyphPixel(font, glyphIndex, gx, gy)) {
        const tx = dx + gx;
        if (tx >= 0) {
          pixels[dstRow + tx] = color;
        }
      }
    }
  }
}

/**
 * Draw bitmap text directly into a BitCanvas using the pre-rasterized glyph cache.
 * No temp canvas, no getImageData — just direct array blits.
 *
 * @deprecated All in-repo text drawing now uses QuickDraw (SetPort + MoveTo + DrawString
 * via FontManager). Use that for GrafPort-based drawing. This export is kept for any
 * external or legacy BitCanvas-only paths.
 */
export function drawBitmapText(
  canvas: BitCanvas,
  text: string,
  x: number,
  y: number,
  opts: TextOptions = {}
) {
  if (!text) return;

  const font = opts.font ?? "body";

  const align = opts.align ?? "left";
  const spacing = opts.spacing ?? 0;
  const color = resolveTextColor(opts.color ?? BLACK);
  const bg = opts.bg ?? null;
  const lineBox = resolveLineBox(font, { lineHeight: opts.lineHeight });
  const lineHeight = lineBox.lineHeight;
  const padding = opts.padding ?? 0;
  const lineCount = countTextLines(text);

  const textWidth =
    opts.width ?? measureText(text, font, spacing) + padding * 2 + 4;
  const textHeight = opts.height ?? lineHeight * lineCount;

  // Background fill
  if (bg !== null) {
    canvas.fillRect(x, y, textWidth, textHeight, bg);
  }

  // Compute starting x based on alignment
  const measuredWidth = measureText(text, font, spacing);
  let cx = alignTextX(
    align,
    x + padding,
    textWidth - padding * 2,
    measuredWidth
  );

  let cy = y;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") {
      cx = x + padding;
      cy += lineHeight;
      continue;
    }
    blitGlyph(canvas, font, ch, cx, cy + lineBox.glyphOffsetY, color);
    cx += measureText(ch, font, spacing);
  }
}

// --- Font Drawing into a raw pixel buffer ---

/**
 * Draw bitmap text directly into a 1-bit pixel buffer (1 byte per pixel).
 * Used by the QuickDraw font injection bridge.
 */
export function drawBitmapTextToPixels(
  pixels: Uint8Array,
  rowBytes: number,
  boundsLeft: number,
  boundsTop: number,
  clipLeft: number,
  clipTop: number,
  clipRight: number,
  clipBottom: number,
  text: string,
  x: number,
  y: number,
  font: FontName,
  color: number
): void {
  if (!text) return;
  const fontDef = requireDeckerFont(font);
  const drawColor = resolveTextColor(color);
  const spacing = 0;

  let cx = x;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") {
      cx = x;
      y += fontDef.glyphHeight;
      continue;
    }

    const glyphIndex = getGlyphIndexForChar(fontDef, ch);
    const gw = measureText(ch, font, spacing) - fontDef.spacing;
    const gh = fontDef.glyphHeight;
    if (glyphIndex >= 0 && gw > 0) {
      const gx = cx | 0;
      const gy = y | 0;

      const x0 = Math.max(0, clipLeft - gx);
      const y0 = Math.max(0, clipTop - gy);
      const x1 = Math.min(gw, clipRight - gx);
      const y1 = Math.min(gh, clipBottom - gy);

      for (let gy2 = y0; gy2 < y1; gy2++) {
        const ty = gy + gy2;
        if (ty < 0) continue;
        const dstRow = (ty - boundsTop) * rowBytes;
        for (let gx2 = x0; gx2 < x1; gx2++) {
          if (getGlyphPixel(fontDef, glyphIndex, gx2, gy2)) {
            const tx = gx + gx2;
            if (tx >= 0) pixels[dstRow + (tx - boundsLeft)] = drawColor;
          }
        }
      }
    }

    cx += measureText(ch, font, spacing);
  }
}

// --- Font Loading ---

export function loadFonts(): Promise<void> {
  initDeckerFonts();
  return Promise.resolve();
}

export function registerFontResource(name: string, dataBlock: string): void {
  registerDeckerFont(name, dataBlock);
}

export function getWrappedLines(
  text: string,
  maxWidth: number,
  font: FontName = "body",
  spacing: number = 0
): string[] {
  if (!text) return [""];

  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(" ");
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (measureText(test, font, spacing) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }

  return lines;
}

export type { FontName };
