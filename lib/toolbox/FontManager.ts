/**
 * FontManager.ts — Macintosh Toolbox Font Manager
 *
 * Mediates between apps and font resources, providing measurement info
 * and font selection by numeric ID or name.
 *
 * Original Mac routines mapped:
 *   InitFonts    → InitFonts()
 *   GetFontInfo  → GetFMFontInfo(input)
 *   GetFNum      → GetFNum(name)
 *   GetFontName  → GetFontName(id)
 *   RealFont     → RealFont(fontNum, size)
 *
 * Internals: wraps fontAdapter.ts glyph cache and measurement functions.
 */

import {
  loadFonts,
  measureText,
  getLineHeight,
  type FontName,
} from "../canvas/fontAdapter";

// -------------------------------------------------------------------------
// Types — aligned to original Mac structures
// -------------------------------------------------------------------------

/**
 * Font measurement info. Maps to Mac FontInfo record.
 */
export interface FontInfo {
  ascent: number;
  descent: number;
  widMax: number;
  leading: number;
}

/**
 * Font selection input. Maps to Mac FMInput.
 */
export interface FMInput {
  fontName: FontName;
  size: number;
  style?: number;
}

interface FontEntry {
  id: number;
  name: FontName;
  size: number;
  lineHeight: number;
}

// -------------------------------------------------------------------------
// Font registry
// -------------------------------------------------------------------------

const fontRegistry: Map<number, FontEntry> = new Map();
const fontNameToId: Map<string, number> = new Map();

/**
 * Register a font in the Font Manager.
 */
export function RegisterFont(name: FontName, id: number, size: number): void {
  const lineHeight = getLineHeight(name);
  const entry: FontEntry = { id, name, size, lineHeight };
  fontRegistry.set(id, entry);
  fontNameToId.set(name, id);
}

// -------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------

/**
 * Initialize the Font Manager. Must be called after InitGraf.
 * Loads all font resources and builds glyph caches.
 *
 * Equivalent to Mac InitFonts.
 */
export async function InitFonts(): Promise<void> {
  await loadFonts();

  // Register the two built-in fonts
  RegisterFont("Geneva9", 3, 9);
  RegisterFont("ChiKareGo", 200, 12);
}

/**
 * Get font measurement info for a given font selection.
 *
 * Equivalent to Mac GetFontInfo (fills a FontInfo record).
 */
export function GetFMFontInfo(input: FMInput): FontInfo {
  const lineH = getLineHeight(input.fontName);
  // For bitmap fonts, ascent + descent + leading = lineHeight.
  // Typical Mac bitmap fonts: ascent ≈ 75% lineHeight, descent ≈ 25%.
  const ascent = Math.ceil(lineH * 0.75);
  const descent = lineH - ascent;
  const widMax = measureText("M", input.fontName);

  return {
    ascent,
    descent,
    widMax,
    leading: 0,
  };
}

/**
 * Get the numeric font ID for a font name.
 *
 * Equivalent to Mac GetFNum.
 */
export function GetFNum(name: string): number {
  return fontNameToId.get(name as FontName) ?? 0;
}

/**
 * Get the font name for a numeric font ID.
 *
 * Equivalent to Mac GetFontName.
 */
export function GetFontName(id: number): FontName | null {
  const entry = fontRegistry.get(id);
  return entry?.name ?? null;
}

/**
 * Check if a bitmap font exists at the specified size.
 *
 * Equivalent to Mac RealFont.
 */
export function RealFont(fontNum: number, size: number): boolean {
  const entry = fontRegistry.get(fontNum);
  if (!entry) return false;
  return entry.size === size;
}

/**
 * Measure text width using a font. Convenience wrapper over fontAdapter.
 */
export function FMTextWidth(text: string, fontName: FontName): number {
  return measureText(text, fontName);
}

/**
 * Get line height for a font. Convenience wrapper over fontAdapter.
 */
export function FMLineHeight(fontName: FontName): number {
  return getLineHeight(fontName);
}

export type { FontName };
