/**
 * pixelFormat.ts — Decker pixel-to-display conversion
 *
 * Mirrors the logic from lil.js (draw_pattern / pal_pat) and decker.js (sync / draw_color).
 * All coordinate-dependent functions use SCREEN-RELATIVE x,y so that patterns tile
 * correctly across the full display (matching the upstream framebuffer approach).
 */

// Default palette colors from lil.js DEFAULT_COLORS (ARGB).
// Used when no deck-specific palette is available.
export const DEFAULT_COLORS_ARGB: readonly number[] = [
  0xffffffff, 0xffffff00, 0xffff6500, 0xffdc0000,
  0xffff0097, 0xff360097, 0xff0000ca, 0xff0097ff,
  0xff00a800, 0xff006500, 0xff653600, 0xff976536,
  0xffb9b9b9, 0xff868686, 0xff454545, 0xff000000,
];

/**
 * pal_pat — sample a pattern value from the palette buffer at (x, y).
 * The pal buffer stores 28 pattern bitmaps (indices 2–29) as 8×8 tiles.
 * Offset formula: (x%8) + 8*(y%8) + 64*patternIndex
 */
export function samplePatternPalette(
  pal: Uint8Array,
  patternIndex: number,
  x: number,
  y: number
): number {
  return pal[(x % 8) + 8 * (y % 8) + 64 * patternIndex];
}

/**
 * draw_pattern — convert a pixel value to a 1-bit monochrome value (0=white, 1=black).
 * Mirrors lil.js: pix<2 → binary; pix>31 → (pix==32?0:1); otherwise → pal_pat&1
 */
export function drawPattern(
  pal: Uint8Array,
  pixelValue: number,
  x: number,
  y: number
): 0 | 1 {
  if (pixelValue < 2) return pixelValue ? 1 : 0;
  if (pixelValue > 31) return pixelValue === 32 ? 0 : 1;
  return (samplePatternPalette(pal, pixelValue, x, y) & 1) as 0 | 1;
}

/**
 * Resolve an animated pattern index (28–31) to a concrete pattern index.
 * anim[slot][frame % len] — where frame = Math.floor(frameCount / 4).
 */
export function resolveAnimPattern(
  anim: number[][],
  patternIndex: number,
  frameCount: number
): number {
  if (patternIndex < 28 || patternIndex > 31) return patternIndex;
  const slot = patternIndex - 28;
  const row = anim[slot];
  if (!row || row.length === 0) return 0;
  return row[Math.floor(frameCount / 4) % row.length];
}

/**
 * pal_col_get — read a palette color (ARGB) from the pal buffer.
 * Colors are stored as 3 raw bytes (RGB) starting at byte offset 8*224 + 3*colorIndex.
 */
export function getPaletteColor(pal: Uint8Array, colorIndex: number): number {
  const b = 8 * 224 + 3 * colorIndex;
  if (b + 2 >= pal.length) return DEFAULT_COLORS_ARGB[colorIndex] ?? 0xff000000;
  return (
    (0xff000000 | ((pal[b] << 16) | (pal[b + 1] << 8) | pal[b + 2])) >>> 0
  );
}

/**
 * draw_color — map a pixel value to a palette color index (0–15).
 * Mirrors decker.js sync(): pix>47→0; pix>31→pix-32; otherwise→draw_pattern?15:0
 */
export function pixelToColorIndex(
  pal: Uint8Array,
  pixelValue: number,
  x: number,
  y: number
): number {
  if (pixelValue > 47) return 0;
  if (pixelValue > 31) return pixelValue - 32;
  return drawPattern(pal, pixelValue, x, y) ? 15 : 0;
}

/**
 * Full display pipeline: pixel value → ARGB color.
 * Pass screenX/screenY (not local image offsets) for correct pattern tiling.
 * Animated patterns (28–31) are resolved when anim + frameCount are provided.
 */
export function pixelToARGB(
  pal: Uint8Array | null,
  pixelValue: number,
  screenX: number,
  screenY: number,
  anim?: number[][] | null,
  frameCount?: number
): number {
  let pix = pixelValue;
  if (pix >= 28 && pix <= 31 && anim != null && frameCount != null) {
    pix = resolveAnimPattern(anim, pix, frameCount);
  }
  if (!pal) {
    // No deck palette: fall back to default black/white
    if (pix <= 0) return DEFAULT_COLORS_ARGB[0];
    if (pix === 1) return DEFAULT_COLORS_ARGB[15];
    if (pix > 31 && pix <= 47) return DEFAULT_COLORS_ARGB[pix - 32];
    return DEFAULT_COLORS_ARGB[pix > 47 ? 0 : 0];
  }
  const colorIndex = pixelToColorIndex(pal, pix, screenX, screenY);
  return getPaletteColor(pal, colorIndex);
}

/**
 * Convert an ARGB number to [R, G, B, A] byte tuple.
 */
export function argbToRgba(argb: number): [number, number, number, number] {
  const v = argb >>> 0;
  return [
    (v >>> 16) & 0xff,
    (v >>> 8) & 0xff,
    v & 0xff,
    (v >>> 24) & 0xff,
  ];
}
