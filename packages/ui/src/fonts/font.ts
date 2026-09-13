import { deckerOrdinalForCharCode } from "./drom";
import { extraOrdinalForCharCode } from "./extraGlyphs";

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

/** Horizontal ellipsis — ordinal 127 in Decker's extended range. */
export const DECKER_ELLIPSIS = "\u2026";

const FALLBACK_GLYPH_INDEX = "?".charCodeAt(0);

/**
 * Glyph ordinal for a UTF-16 code unit: Decker's mapping first, then Mockintosh's extra
 * symbols (`extraGlyphs.ts`); 255 if neither knows the character.
 */
export function ordinalForCharCode(codeUnit: number): number {
  const deckerOrd = deckerOrdinalForCharCode(codeUnit);
  if (deckerOrd !== 255) return deckerOrd;
  return extraOrdinalForCharCode(codeUnit) ?? 255;
}

export function getGlyphIndexForChar(font: DeckerFont, ch: string): number {
  if (!ch) return -1;
  const ord = ordinalForCharCode(ch.charCodeAt(0));
  if (ord === 255) {
    return font.glyphWidths[FALLBACK_GLYPH_INDEX] > 0 ? FALLBACK_GLYPH_INDEX : -1;
  }
  if (!hasGlyph(font, ord)) {
    return font.glyphWidths[FALLBACK_GLYPH_INDEX] > 0 ? FALLBACK_GLYPH_INDEX : -1;
  }
  return ord;
}

export function getGlyphWidth(font: DeckerFont, glyphIndex: number): number {
  if (glyphIndex < 0 || glyphIndex > 255) return 0;
  return font.glyphWidths[glyphIndex] ?? 0;
}

export function hasGlyph(font: DeckerFont, glyphIndex: number): boolean {
  return getGlyphWidth(font, glyphIndex) > 0;
}

export function getGlyphDataOffset(font: DeckerFont, glyphIndex: number): number {
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
  const offset = getGlyphDataOffset(font, glyphIndex) + y * byteWidth + Math.floor(x / 8);
  const byte = font.glyphData[offset];
  const bit = 1 << (7 - (x % 8));
  return (byte & bit) !== 0;
}

/** Advance of one character, including trailing `spacing` (matches the FM width table). */
export function charAdvance(font: DeckerFont, ch: string): number {
  const glyphIndex = getGlyphIndexForChar(font, ch);
  if (glyphIndex < 0) return 0;
  return getGlyphWidth(font, glyphIndex) + font.spacing;
}

/** Sum of {@link charAdvance} over `text` (no newline handling). */
export function textAdvance(font: DeckerFont, text: string): number {
  let w = 0;
  for (let i = 0; i < text.length; i++) w += charAdvance(font, text[i]!);
  return w;
}

export function measureDeckerText(font: DeckerFont, text: string): DeckerTextSize {
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

  return { width: maxWidth, height };
}
