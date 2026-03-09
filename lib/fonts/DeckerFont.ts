export type BuiltInFontName = "body" | "menu" | "mono";
export type FontName = BuiltInFontName | (string & {});

export const DECKER_ELLIPSIS = "\u2026";
export const DECKER_ELLIPSIS_INDEX = 127;
const FALLBACK_GLYPH_INDEX = "?".charCodeAt(0);

export interface DeckerFont {
  name: string;
  maxWidth: number;
  glyphHeight: number;
  spacing: number;
  glyphStride: number;
  glyphWidths: Uint8Array;
  glyphData: Uint8Array;
  sourceFormat: "FNT0" | "FNT1";
}

export interface DeckerTextSize {
  width: number;
  height: number;
}

export function getGlyphIndexForChar(font: DeckerFont, ch: string): number {
  if (!ch) return -1;
  if (ch === DECKER_ELLIPSIS) return DECKER_ELLIPSIS_INDEX;
  const codePoint = ch.codePointAt(0);
  if (codePoint === undefined) return -1;
  if (codePoint >= 0 && codePoint <= 255) return codePoint;
  if (font.glyphWidths[FALLBACK_GLYPH_INDEX] > 0) return FALLBACK_GLYPH_INDEX;
  return -1;
}

export function getGlyphWidth(font: DeckerFont, glyphIndex: number): number {
  if (glyphIndex < 0 || glyphIndex > 255) return 0;
  return font.glyphWidths[glyphIndex] ?? 0;
}

export function hasGlyph(font: DeckerFont, glyphIndex: number): boolean {
  return getGlyphWidth(font, glyphIndex) > 0;
}

export function getGlyphDataOffset(
  font: DeckerFont,
  glyphIndex: number
): number {
  return glyphIndex * font.glyphStride;
}

export function getGlyphPixel(
  font: DeckerFont,
  glyphIndex: number,
  x: number,
  y: number
): boolean {
  const glyphWidth = getGlyphWidth(font, glyphIndex);
  if (glyphWidth < 1) return false;
  if (x < 0 || x >= glyphWidth || y < 0 || y >= font.glyphHeight) return false;

  const byteWidth = Math.ceil(font.maxWidth / 8);
  const offset =
    getGlyphDataOffset(font, glyphIndex) + y * byteWidth + Math.floor(x / 8);
  const byte = font.glyphData[offset];
  const bit = 1 << (7 - (x % 8));
  return (byte & bit) !== 0;
}

export function measureDeckerText(
  font: DeckerFont,
  text: string
): DeckerTextSize {
  let cursorX = 0;
  let maxWidth = 0;
  let height = font.glyphHeight;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") {
      maxWidth = Math.max(maxWidth, cursorX);
      cursorX = 0;
      height += font.glyphHeight;
      continue;
    }

    const glyphIndex = getGlyphIndexForChar(font, ch);
    cursorX += getGlyphWidth(font, glyphIndex) + font.spacing;
    maxWidth = Math.max(maxWidth, cursorX);
  }

  return {
    width: maxWidth,
    height,
  };
}
