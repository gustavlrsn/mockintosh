import type { BitMap } from "@mockintosh/quickdraw";

/** 8-bit channel triple used by the web host when expanding 1-bit ink. */
export interface Rgb8 {
  r: number;
  g: number;
  b: number;
}

/**
 * How the web host presents packed bits.
 * `foreground` is ink (bit 1); `background` is paper (bit 0).
 */
export interface HostPalette {
  foreground: Rgb8;
  background: Rgb8;
}

export const DEFAULT_HOST_PALETTE: HostPalette = {
  foreground: { r: 0, g: 0, b: 0 },
  background: { r: 255, g: 255, b: 255 },
};

export function clampRgb8(value: Rgb8): Rgb8 {
  return {
    r: clampChannel(value.r),
    g: clampChannel(value.g),
    b: clampChannel(value.b),
  };
}

export function copyHostPalette(palette: HostPalette): HostPalette {
  return {
    foreground: clampRgb8(palette.foreground),
    background: clampRgb8(palette.background),
  };
}

export function hostPalettesEqual(a: HostPalette, b: HostPalette): boolean {
  return rgbEqual(a.foreground, b.foreground) && rgbEqual(a.background, b.background);
}

export function formatRgb8(value: Rgb8): string {
  const c = clampRgb8(value);
  return `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;
}

/** `#rgb`, `#rrggbb`, or the same without `#`. */
export function parseRgb8(input: string): Rgb8 | null {
  const hex = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return null;
}

/** Expand a packed BitMap into an RGBA buffer using the host palette. */
export function paintBitMapRgba(
  source: BitMap,
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  palette: HostPalette = DEFAULT_HOST_PALETTE,
): void {
  const ink = clampRgb8(palette.foreground);
  const paper = clampRgb8(palette.background);
  const { baseAddr, rowBytes } = source;
  let j = 0;
  for (let y = 0; y < height; y++) {
    const row = y * rowBytes;
    for (let x = 0; x < width; x++, j += 4) {
      const bit = (baseAddr[row + (x >> 3)] >> (7 - (x & 7))) & 1;
      const c = bit ? ink : paper;
      rgba[j] = c.r;
      rgba[j + 1] = c.g;
      rgba[j + 2] = c.b;
      rgba[j + 3] = 255;
    }
  }
}

function clampChannel(n: number): number {
  return Math.max(0, Math.min(255, n | 0));
}

function hex2(n: number): string {
  return n.toString(16).padStart(2, "0");
}

function rgbEqual(a: Rgb8, b: Rgb8): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}
