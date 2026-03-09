export type ColorMode = "monochrome" | "colors";

export const PALETTE_SIZE = 256;

export const WHITE_INDEX = 0;
export const BLACK_INDEX = 1;
export const RED_INDEX = 2;
export const GREEN_INDEX = 3;
export const BLUE_INDEX = 4;
export const CYAN_INDEX = 5;
export const MAGENTA_INDEX = 6;
export const YELLOW_INDEX = 7;
export const ORANGE_INDEX = 8;
export const PURPLE_INDEX = 9;
export const BROWN_INDEX = 10;
export const TAN_INDEX = 11;
export const LIGHT_GRAY_INDEX = 12;
export const MEDIUM_GRAY_INDEX = 13;
export const DARK_GRAY_INDEX = 14;
export const PINK_INDEX = 15;

const DEFAULT_COLOR_MODE: ColorMode = "monochrome";

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const DEFAULT_PALETTE = new Uint32Array(PALETTE_SIZE);
let activePalette = new Uint32Array(PALETTE_SIZE);
let activeColorMode: ColorMode = DEFAULT_COLOR_MODE;

function setPaletteRGB(index: number, r: number, g: number, b: number): void {
  DEFAULT_PALETTE[index] = ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
}

function initDefaultPalette(): void {
  setPaletteRGB(WHITE_INDEX, 255, 255, 255);
  setPaletteRGB(BLACK_INDEX, 0, 0, 0);
  setPaletteRGB(RED_INDEX, 221, 0, 0);
  setPaletteRGB(GREEN_INDEX, 0, 168, 0);
  setPaletteRGB(BLUE_INDEX, 0, 0, 202);
  setPaletteRGB(CYAN_INDEX, 0, 151, 255);
  setPaletteRGB(MAGENTA_INDEX, 255, 0, 151);
  setPaletteRGB(YELLOW_INDEX, 255, 255, 0);
  setPaletteRGB(ORANGE_INDEX, 255, 101, 0);
  setPaletteRGB(PURPLE_INDEX, 54, 0, 151);
  setPaletteRGB(BROWN_INDEX, 101, 54, 0);
  setPaletteRGB(TAN_INDEX, 151, 101, 54);
  setPaletteRGB(LIGHT_GRAY_INDEX, 185, 185, 185);
  setPaletteRGB(MEDIUM_GRAY_INDEX, 134, 134, 134);
  setPaletteRGB(DARK_GRAY_INDEX, 69, 69, 69);
  setPaletteRGB(PINK_INDEX, 255, 170, 204);

  const cube = [0, 95, 135, 175, 215, 255];
  let index = 16;
  for (let r = 0; r < cube.length; r++) {
    for (let g = 0; g < cube.length; g++) {
      for (let b = 0; b < cube.length; b++) {
        setPaletteRGB(index++, cube[r], cube[g], cube[b]);
      }
    }
  }

  for (let i = 0; index < PALETTE_SIZE; i++, index++) {
    const gray = 8 + i * 10;
    setPaletteRGB(index, gray, gray, gray);
  }

  activePalette = new Uint32Array(DEFAULT_PALETTE);
}

initDefaultPalette();

export function getDefaultColorMode(): ColorMode {
  return DEFAULT_COLOR_MODE;
}

export function getColorMode(): ColorMode {
  return activeColorMode;
}

export function setColorMode(mode: ColorMode): void {
  activeColorMode = mode;
}

export function getDefaultPalette(): Uint32Array {
  return new Uint32Array(DEFAULT_PALETTE);
}

export function getActivePalette(): Uint32Array {
  return activePalette;
}

export function resetActivePalette(): void {
  activePalette = new Uint32Array(DEFAULT_PALETTE);
}

export function setPaletteEntry(index: number, rgb: number): void {
  if (index < 0 || index >= PALETTE_SIZE) return;
  activePalette[index] = rgb & 0xffffff;
}

export function setActivePalette(palette: ArrayLike<number>): void {
  const next = new Uint32Array(DEFAULT_PALETTE);
  const limit = Math.min(PALETTE_SIZE, palette.length);
  for (let i = 0; i < limit; i++) {
    next[i] = palette[i] & 0xffffff;
  }
  activePalette = next;
}

export function clampColorIndex(color: number): number {
  if (!Number.isFinite(color)) return BLACK_INDEX;
  const index = color | 0;
  if (index < 0) return WHITE_INDEX;
  if (index >= PALETTE_SIZE) return PALETTE_SIZE - 1;
  return index;
}

export function getPaletteRGB(index: number): number {
  return activePalette[clampColorIndex(index)] & 0xffffff;
}

export function getPaletteRGBComponents(index: number): {
  r: number;
  g: number;
  b: number;
} {
  const rgb = getPaletteRGB(index);
  return {
    r: (rgb >> 16) & 0xff,
    g: (rgb >> 8) & 0xff,
    b: rgb & 0xff,
  };
}

function getLuminance(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

export function rgbToPaletteIndex(r: number, g: number, b: number): number {
  let bestIndex = WHITE_INDEX;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < activePalette.length; i++) {
    const rgb = activePalette[i];
    const pr = (rgb >> 16) & 0xff;
    const pg = (rgb >> 8) & 0xff;
    const pb = rgb & 0xff;
    const dr = pr - r;
    const dg = pg - g;
    const db = pb - b;
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
      if (distance === 0) break;
    }
  }

  return bestIndex;
}

export function rgbToMonochromeBit(
  r: number,
  g: number,
  b: number,
  x: number,
  y: number
): 0 | 1 {
  const luminance = getLuminance(r, g, b);
  const threshold = ((BAYER_4X4[y & 3][x & 3] + 0.5) / 16) * 255;
  return luminance < threshold ? 1 : 0;
}

export function colorIndexToMonochromeBit(
  index: number,
  x: number,
  y: number
): 0 | 1 {
  const normalized = clampColorIndex(index);
  if (normalized === WHITE_INDEX) return 0;
  if (normalized === BLACK_INDEX) return 1;
  const { r, g, b } = getPaletteRGBComponents(normalized);
  return rgbToMonochromeBit(r, g, b, x, y);
}

export function resolveStrokeColor(index: number): number {
  const normalized = clampColorIndex(index);
  if (activeColorMode === "colors") return normalized;
  return normalized === WHITE_INDEX ? WHITE_INDEX : BLACK_INDEX;
}

export function resolveTextColor(index: number): number {
  return resolveStrokeColor(index);
}

export function resolvePixelRGB(
  index: number,
  x: number,
  y: number
): { r: number; g: number; b: number } {
  const normalized = clampColorIndex(index);
  if (activeColorMode === "colors") {
    return getPaletteRGBComponents(normalized);
  }
  const bit = colorIndexToMonochromeBit(normalized, x, y);
  return bit === 0 ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
}
