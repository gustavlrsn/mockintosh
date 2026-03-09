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
 * Internals: wraps the Decker-style font registry and measurement functions.
 * installQuickDrawFontBridge() wires QuickDraw's text path to this manager.
 */

import {
  loadFonts,
  measureText,
  getLineHeight,
  drawBitmapTextToPixels,
  registerFontResource,
  type FontName,
} from "../canvas/fontAdapter";
import { resolveTextColor } from "../canvas/ColorSystem";
import {
  listDeckerFonts,
  requireDeckerFont,
} from "../fonts/DeckerFontRegistry";
import { globals } from "@mockintosh/quickdraw";
import type { GrafPort } from "@mockintosh/quickdraw";

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
  lineHeight: number;
}

// -------------------------------------------------------------------------
// Font registry
// -------------------------------------------------------------------------

const fontRegistry: Map<number, FontEntry> = new Map();
const fontNameToId: Map<string, number> = new Map();
let nextDynamicFontId = 256;

/**
 * Register a font in the Font Manager.
 */
export function RegisterFont(name: FontName, id: number): void {
  const lineHeight = getLineHeight(name);
  const entry: FontEntry = { id, name, lineHeight };
  fontRegistry.set(id, entry);
  fontNameToId.set(name, id);
}

export function RegisterFontData(
  name: string,
  dataBlock: string,
  id?: number
): number {
  registerFontResource(name, dataBlock);
  const fontId = id ?? nextDynamicFontId++;
  RegisterFont(name, fontId);
  return fontId;
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

  for (const [name, id] of [
    ["body", 3],
    ["menu", 4],
    ["mono", 5],
  ] as const) {
    RegisterFont(name, id);
  }
}

/**
 * Get font measurement info for a given font selection.
 *
 * Equivalent to Mac GetFontInfo (fills a FontInfo record).
 */
export function GetFMFontInfo(input: FMInput): FontInfo {
  const font = requireDeckerFont(input.fontName);
  const lineH = font.glyphHeight;
  const ascent = Math.max(1, lineH - 2);
  const descent = Math.max(0, lineH - ascent);
  const widMax = font.maxWidth + font.spacing;

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
  return size >= 0 && entry.lineHeight > 0;
}

/**
 * Measure text width using a font. Convenience wrapper over fontAdapter.
 */
export function FMTextWidth(
  text: string,
  fontName: FontName,
  spacing: number = 0
): number {
  return measureText(text, fontName, spacing);
}

/**
 * Get line height for a font. Convenience wrapper over fontAdapter.
 */
export function FMLineHeight(fontName: FontName): number {
  return getLineHeight(fontName);
}

// -------------------------------------------------------------------------
// QuickDraw font bridge (Option A: FontManager is the single injection point)
// -------------------------------------------------------------------------

/**
 * Register measure and draw callbacks with QuickDraw so DrawString/DrawText
 * use FontManager (and thus port.txFont). Call once after InitFonts().
 * Delegates actual glyph rendering to fontAdapter.drawBitmapTextToPixels.
 */
export function installQuickDrawFontBridge(
  inject: (
    measure: (text: string) => number,
    draw: (text: string, x: number, y: number, port: GrafPort) => void
  ) => void
): void {
  const measure = (text: string): number => {
    const port = globals.thePort;
    const fontName = port ? GetFontName(port.txFont) ?? "body" : "body";
    return measureText(text, fontName);
  };

  const draw = (text: string, x: number, y: number, port: GrafPort): void => {
    const fontName = GetFontName(port.txFont) ?? "body";
    const { baseAddr, rowBytes, bounds } = port.portBits;
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
    const color = resolveTextColor(
      (port as GrafPort & { txColor?: number }).txColor ?? 1
    );
    drawBitmapTextToPixels(
      baseAddr,
      rowBytes,
      bounds.left,
      bounds.top,
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

  inject(measure, draw);
}

export type { FontName };

export function GetRegisteredFontNames(): string[] {
  return listDeckerFonts();
}
