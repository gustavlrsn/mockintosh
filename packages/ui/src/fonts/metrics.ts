/**
 * Host-font face metrics — FontInfo for `<text>` alignment, distinct from
 * the QuickDraw strike.
 *
 * `verticalAlign="middle"` is the Control Manager rule: center
 * `ascent + descent + leading` in the box, then `MoveTo` the baseline.
 * Built-in faces use the System 6 FONT headers. Custom Decker fonts fall
 * back to an ink-derived split of the cell.
 *
 * Cap ink (`capAscent`) only maps that baseline onto the Decker cell.
 * Strike packing still uses `uiFontMetrics` (`ascent = glyphHeight`).
 */

import {
  getGlyphPixel,
  getGlyphWidth,
  hasGlyph,
  type DeckerFont,
} from "./font";
import { requireFont } from "./registry";

/** `GetFontInfo` integers — what the CDEF / WDEF / MDEF actually read. */
export interface FontInfo {
  ascent: number;
  descent: number;
  leading: number;
}

/**
 * System 6 `'FONT'` / `'NFNT'` headers for the shipped faces.
 * Chicago 12 is pixel-checked against `public/ok-button-map.txt`
 * (20px face → baseline 14 → caps on rows 5–13).
 */
const SYSTEM_FONT_INFO: Readonly<Record<string, FontInfo>> = {
  menu: { ascent: 12, descent: 3, leading: 0 }, // Chicago 12
  body: { ascent: 10, descent: 2, leading: 0 }, // Geneva 9
  mono: { ascent: 9, descent: 2, leading: 0 }, // Monaco 9
};

export interface FontFaceMetrics extends FontInfo {
  /** Decker cell height — QuickDraw line box and wrapped-text advance. */
  cellHeight: number;
  /** Cell top → scanline just below typical A–Z. Maps FontInfo baseline → cell. */
  capAscent: number;
  /** First ink row of typical A–Z (median; ignores Q tails). */
  capTop: number;
  /** Typical A–Z ink height. */
  capHeight: number;
  /** `ascent + descent + leading` — the CDEF line box. */
  lineHeight: number;
}

const cache = new WeakMap<DeckerFont, FontFaceMetrics>();

export function faceMetrics(font: DeckerFont): FontFaceMetrics {
  const cached = cache.get(font);
  if (cached) return cached;
  const computed = computeFaceMetrics(font);
  cache.set(font, computed);
  return computed;
}

export function faceMetricsByName(fontName: string = "body"): FontFaceMetrics {
  return faceMetrics(requireFont(fontName));
}

/**
 * Height of the box `<text>` measure and `verticalAlign` share.
 * Single-line `middle` uses FontInfo `lineHeight`; everything else uses
 * the Decker cell block so wrapping and descenders stay honest.
 */
export function alignmentHeight(
  font: DeckerFont,
  lineCount: number,
  blockHeight: number,
  verticalAlign: "top" | "middle" | "bottom" = "top"
): number {
  if (verticalAlign === "middle" && lineCount === 1) {
    return faceMetrics(font).lineHeight;
  }
  return blockHeight;
}

/**
 * CDEF baseline in a box: center the FontInfo line, then add ascent.
 * `baseline = top + (h − (ascent+descent+leading)) / 2 + ascent`
 */
export function cdefBaseline(top: number, height: number, m: FontFaceMetrics): number {
  const vOffset = Math.floor((height - m.lineHeight) / 2);
  return top + vOffset + m.ascent;
}

/** Decker cell top so caps sit on {@link cdefBaseline}. */
export function middleCellTop(top: number, height: number, m: FontFaceMetrics): number {
  return cdefBaseline(top, height, m) - m.capAscent;
}

function computeFaceMetrics(font: DeckerFont): FontFaceMetrics {
  const cellHeight = font.glyphHeight;
  const caps = scanTypicalCapInk(font);
  const capTop = caps?.minY ?? 0;
  const capHeight = caps ? caps.maxY - caps.minY + 1 : cellHeight;
  const capAscent = caps ? Math.min(cellHeight, caps.maxY + 1) : cellHeight;
  const header = SYSTEM_FONT_INFO[font.name];
  const info: FontInfo = header ?? {
    ascent: capAscent,
    descent: cellHeight - capAscent,
    leading: 0,
  };
  return {
    cellHeight,
    ...info,
    capAscent,
    capTop,
    capHeight,
    lineHeight: info.ascent + info.descent + info.leading,
  };
}

/**
 * Typical A–Z ink, not the union. `Q`'s tail is a one-off descender and
 * must not pull the cap baseline down a row.
 */
function scanTypicalCapInk(font: DeckerFont): { minY: number; maxY: number } | null {
  const minYs: number[] = [];
  const maxYs: number[] = [];
  for (let ord = 65; ord <= 90; ord++) {
    if (!hasGlyph(font, ord)) continue;
    const range = glyphInkY(font, ord);
    if (!range) continue;
    minYs.push(range.minY);
    maxYs.push(range.maxY);
  }
  if (maxYs.length === 0) return null;
  return { minY: median(minYs), maxY: median(maxYs) };
}

function median(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : sorted[mid - 1]!;
}

function glyphInkY(
  font: DeckerFont,
  glyphIndex: number
): { minY: number; maxY: number } | null {
  const width = getGlyphWidth(font, glyphIndex);
  if (width <= 0) return null;
  let minY = font.glyphHeight;
  let maxY = -1;
  for (let y = 0; y < font.glyphHeight; y++) {
    for (let x = 0; x < width; x++) {
      if (getGlyphPixel(font, glyphIndex, x, y)) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        break;
      }
    }
  }
  return maxY < 0 ? null : { minY, maxY };
}
