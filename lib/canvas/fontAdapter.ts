import { BitCanvas, BLACK, WHITE } from "./BitCanvas";
import PixelFontCanvas from "@/lib/PixelFontCanvas";

export type FontName = "ChiKareGo" | "Geneva9";

export interface TextOptions {
  font?: FontName;
  align?: "left" | "center" | "right";
  color?: number; // BLACK or WHITE
  bg?: number | null; // background color, or null for transparent
  width?: number;
  height?: number;
  padding?: number;
}

// --- Glyph Cache ---

interface GlyphBitmap {
  width: number;
  height: number;
  data: Uint8Array; // 1=black, 0=white per pixel
}

const glyphCache: Map<string, Map<number, GlyphBitmap>> = new Map();

/**
 * Rasterize all glyphs in a loaded font into 1-bit bitmaps.
 * Called once per font at load time.
 */
function buildGlyphCache(fontName: string): void {
  const fontData = PixelFontCanvas.fonts[fontName];
  if (!fontData) return;

  const cache = new Map<number, GlyphBitmap>();
  const texture: HTMLImageElement = fontData.texture;

  const tmpCanvas = document.createElement("canvas");
  const tmpCtx = tmpCanvas.getContext("2d")!;
  tmpCtx.imageSmoothingEnabled = false;

  for (const charCodeStr of Object.keys(fontData.chars)) {
    const charCode = Number(charCodeStr);
    const charData = fontData.chars[charCode];
    const rect = charData.textureRect;
    if (rect.width <= 0 || rect.height <= 0) continue;

    tmpCanvas.width = rect.width;
    tmpCanvas.height = rect.height;
    tmpCtx.clearRect(0, 0, rect.width, rect.height);
    tmpCtx.drawImage(
      texture,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height
    );

    const imageData = tmpCtx.getImageData(0, 0, rect.width, rect.height);
    const rgba = imageData.data;
    const bitmap = new Uint8Array(rect.width * rect.height);

    for (let i = 0; i < bitmap.length; i++) {
      const alpha = rgba[i * 4 + 3];
      // Opaque and dark = black glyph pixel
      bitmap[i] = alpha >= 128 ? 1 : 0;
    }

    cache.set(charCode, {
      width: rect.width,
      height: rect.height,
      data: bitmap,
    });
  }

  glyphCache.set(fontName, cache);
}

// --- Measurement ---

export function getLineHeight(font: FontName): number {
  switch (font) {
    case "Geneva9":
      return 12;
    case "ChiKareGo":
      return 16;
    default:
      return 12;
  }
}

export function measureText(text: string, font: FontName = "Geneva9"): number {
  const fontData = PixelFontCanvas.fonts[font];
  if (!fontData) return 0;
  let width = 0;
  let prevCharCode: number | null = null;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const charData = fontData.chars[charCode];
    if (!charData) continue;
    if (prevCharCode && charData.kerning[prevCharCode]) {
      width += charData.kerning[prevCharCode];
    }
    width += charData.xAdvance;
    prevCharCode = charCode;
  }
  return width;
}

// --- Drawing ---

/**
 * Blit a single pre-rasterized glyph into BitCanvas, respecting the clip rect.
 * Only writes pixels where the glyph data is 1 (black).
 * For WHITE color glyphs, writes 0 where glyph data is 1.
 */
function blitGlyph(
  canvas: BitCanvas,
  glyph: GlyphBitmap,
  dx: number,
  dy: number,
  color: number
): void {
  dx = dx | 0;
  dy = dy | 0;
  const { width: gw, height: gh, data } = glyph;
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
    const srcRow = gy * gw;
    const dstRow = ty * cw;
    for (let gx = x0; gx < x1; gx++) {
      if (data[srcRow + gx]) {
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
 */
export function drawBitmapText(
  canvas: BitCanvas,
  text: string,
  x: number,
  y: number,
  opts: TextOptions = {}
) {
  if (!text) return;

  const font = opts.font ?? "Geneva9";
  const fontData = PixelFontCanvas.fonts[font];
  const cache = glyphCache.get(font);
  if (!fontData || !cache) return;

  const align = opts.align ?? "left";
  const color = opts.color ?? BLACK;
  const bg = opts.bg ?? null;
  const lineHeight = getLineHeight(font);
  const padding = opts.padding ?? 0;

  const textWidth = opts.width ?? measureText(text, font) + padding * 2 + 4;
  const textHeight = opts.height ?? lineHeight;

  // Background fill
  if (bg !== null) {
    canvas.fillRect(x, y, textWidth, textHeight, bg);
  }

  // Compute starting x based on alignment
  let cx: number;
  const measuredWidth = measureText(text, font);
  if (align === "center") {
    cx = x + Math.floor((textWidth - measuredWidth) / 2);
  } else if (align === "right") {
    cx = x + textWidth - padding - measuredWidth;
  } else {
    cx = x + padding;
  }

  let prevCharCode: number | null = null;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const charData = fontData.chars[charCode];
    if (!charData) continue;

    if (prevCharCode && charData.kerning[prevCharCode]) {
      cx += charData.kerning[prevCharCode];
    }

    const glyph = cache.get(charCode);
    if (glyph) {
      const gx = (cx + charData.xOffset) | 0;
      const gy = (y + charData.yOffset) | 0;
      blitGlyph(canvas, glyph, gx, gy, color);
    }

    cx += charData.xAdvance;
    prevCharCode = charCode;
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
  const fontData = PixelFontCanvas.fonts[font];
  const cache = glyphCache.get(font);
  if (!fontData || !cache) return;

  let cx = x;
  let prevCharCode: number | null = null;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const charData = fontData.chars[charCode];
    if (!charData) continue;

    if (prevCharCode && charData.kerning[prevCharCode]) {
      cx += charData.kerning[prevCharCode];
    }

    const glyph = cache.get(charCode);
    if (glyph) {
      const gx = (cx + charData.xOffset) | 0;
      const gy = (y + charData.yOffset) | 0;
      const { width: gw, height: gh, data } = glyph;

      const x0 = Math.max(0, clipLeft - gx);
      const y0 = Math.max(0, clipTop - gy);
      const x1 = Math.min(gw, clipRight - gx);
      const y1 = Math.min(gh, clipBottom - gy);

      for (let gy2 = y0; gy2 < y1; gy2++) {
        const ty = gy + gy2;
        if (ty < 0) continue;
        const srcRow = gy2 * gw;
        const dstRow = (ty - boundsTop) * rowBytes;
        for (let gx2 = x0; gx2 < x1; gx2++) {
          if (data[srcRow + gx2]) {
            const tx = gx + gx2;
            if (tx >= 0) pixels[dstRow + (tx - boundsLeft)] = color;
          }
        }
      }
    }

    cx += charData.xAdvance;
    prevCharCode = charCode;
  }
}

// --- Font Loading ---

export function loadFonts(): Promise<void> {
  return new Promise((resolve) => {
    let loaded = 0;
    const total = 2;
    const check = () => {
      loaded++;
      if (loaded >= total) {
        buildGlyphCache("Geneva9");
        buildGlyphCache("ChiKareGo");
        resolve();
      }
    };
    PixelFontCanvas.loadFont("/fonts/", "Geneva9.fnt", check);
    PixelFontCanvas.loadFont("/fonts/", "ChiKareGo.fnt", check);
  });
}
