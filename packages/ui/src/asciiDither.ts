/**
 * ASCII dither: stamp one 8×8 glyph per tile.
 *
 * `blend` (default) — variance mix: per-pixel L1 on structured tiles, `mass` on flats.
 * `mass` — 2×2-cell ink histogram + total ink + spill.
 * `luma` — standalone per-pixel L1; no mass term.
 *
 * Optional Harri-style shape punch (intra-tile exponent + neighbor halo) and
 * catalog-normalize run before lookup. Leftover-ink diffusion is on by default
 * and can be turned off. Output is the `<bitmap>` / `blitPixels` contract:
 * 0 = white, 1 = black.
 */
import type { ImageFrame } from "./dither";

const TILE = 8;
const TILE_PX = TILE * TILE;
const CELL = 2;
const CELLS = TILE / CELL;
const CELL_N = CELLS * CELLS;

export const ASCII_TILE = TILE;
const L = 255;
/** Total-ink term. Lower than the cell term so a slash can beat a same-weight blob. */
const INK_WEIGHT = 3;
/** L1 of the 2×2-cell darkness histogram — this is the shape term. */
const CELL_WEIGHT = 14;
/** Weak preference for drawn characters over filled ovals when masses tie. */
const TRANS_WEIGHT = 0.08;
/** Penalize ink that lands on light pixels so a slash beats a blob on an edge. */
const SPILL_WEIGHT = 10;
/** Per-pixel L1 (`luma` mode), scaled by /255 so it sits near the mass score. */
const LUMA_WEIGHT = 12;
/** Variance at which `luma` mode is pure L1. Below this, mix in `mass`. */
const VAR_REF = 1500;

/** How a tile picks its stamp. */
export type AsciiMatchMode = "mass" | "luma" | "blend";

export const ASCII_MATCH_MODES = ["blend", "luma", "mass"] as const;

/** Intra-tile shape exponent. `1` leaves the descriptor unchanged. */
export const ASCII_PUNCH_MIN = 1;
export const ASCII_PUNCH_MAX = 4;
export const ASCII_PUNCH_DEFAULT = 1;
export const ASCII_DIRECTIONAL_DEFAULT = false;
export const ASCII_NORMALIZE_DEFAULT = false;
/** Leftover-ink carry; matches the historical matcher. */
export const ASCII_DIFFUSE_DEFAULT = true;

export interface AsciiDitherOptions {
  match?: AsciiMatchMode;
  /** Shape-contrast exponent. `1` is identity (baseline). */
  punch?: number;
  /** Punch using a 1-cell halo around the tile. No effect at punch `1`. */
  directional?: boolean;
  /** Stretch cell histograms by the catalog’s per-bin max (solids excluded). */
  normalize?: boolean;
  /** Spread leftover ink to neighboring tiles. Baseline is on. */
  diffuse?: boolean;
}

export interface ResolvedAsciiOptions {
  match: AsciiMatchMode;
  punch: number;
  directional: boolean;
  normalize: boolean;
  diffuse: boolean;
}

export const BASELINE_ASCII: ResolvedAsciiOptions = {
  match: "blend",
  punch: ASCII_PUNCH_DEFAULT,
  directional: ASCII_DIRECTIONAL_DEFAULT,
  normalize: ASCII_NORMALIZE_DEFAULT,
  diffuse: ASCII_DIFFUSE_DEFAULT,
};

export function resolveAsciiOptions(options?: AsciiDitherOptions): ResolvedAsciiOptions {
  const punch = options?.punch;
  return {
    match: matchMode(options),
    punch:
      punch === undefined || !Number.isFinite(punch)
        ? ASCII_PUNCH_DEFAULT
        : Math.min(ASCII_PUNCH_MAX, Math.max(ASCII_PUNCH_MIN, punch)),
    directional: options?.directional === true,
    normalize: options?.normalize === true,
    diffuse: options?.diffuse !== false,
  };
}

export function isBaselineAscii(options?: AsciiDitherOptions): boolean {
  const o = resolveAsciiOptions(options);
  return (
    o.match === BASELINE_ASCII.match &&
    o.punch === BASELINE_ASCII.punch &&
    o.directional === BASELINE_ASCII.directional &&
    o.normalize === BASELINE_ASCII.normalize &&
    o.diffuse === BASELINE_ASCII.diffuse
  );
}

/** Cheap fingerprint for raster `revision` / ditherer cache keys. */
export function asciiOptionsRevision(options?: AsciiDitherOptions): number {
  const o = resolveAsciiOptions(options);
  return (
    Math.round(o.punch * 20) +
    (o.directional ? 200 : 0) +
    (o.normalize ? 400 : 0) +
    (o.diffuse ? 800 : 0) +
    ASCII_MATCH_MODES.indexOf(o.match) * 2000
  );
}

/**
 * 8×8 stamps: original `rawgly` decorations plus the rest of the Commodore
 * VIC-20 / PET chargen (MOS 901460-03, non-reverse). Letterforms are 6×7
 * ink in the 8×8 cell. Catalog build also adds inverses and stroke extras.
 */
const RAW_GLYPHS = [
  "00001000", "00011100", "00111110", "01111111", "01111111", "00011100", "00111110", "00000000",
  "00110110", "01111111", "01111111", "01111111", "00111110", "00011100", "00001000", "00000000",
  "00001000", "00011100", "00111110", "01111111", "00111110", "00011100", "00001000", "00000000",
  "00000000", "00111100", "01111110", "01111110", "01111110", "01111110", "00111100", "00000000",
  "00000000", "00000000", "00000000", "00000000", "00000011", "00000100", "00001000", "00001000",
  "00000000", "00000000", "00000000", "00000000", "11000000", "00100000", "00010000", "00010000",
  "00010000", "00010000", "00100000", "11000000", "00000000", "00000000", "00000000", "00000000",
  "00001000", "00001000", "00000100", "00000011", "00000000", "00000000", "00000000", "00000000",
  "00000000", "00000000", "00000000", "00000000", "00000000", "00001000", "00001000", "00010000",
  "00000000", "00000000", "00000000", "00000000", "10101010", "01010101", "10101010", "01010101",
  "10101010", "01010101", "10101010", "01010101", "00000000", "00000000", "00000000", "00000000",
  "10100000", "01010000", "10100000", "01010000", "10100000", "01010000", "10100000", "01010000",
  "00001010", "00000101", "00001010", "00000101", "00001010", "00000101", "00001010", "00000101",
  "00000000", "00000000", "00000000", "00000000", "00000000", "00011000", "00011000", "00000000",
  "00000100", "00001000", "00010000", "00000000", "00000000", "00000000", "00000000", "00000000",
  "00000100", "00001000", "00010000", "00010000", "00010000", "00001000", "00000100", "00000000",
  "00100000", "00010000", "00001000", "00001000", "00001000", "00010000", "00100000", "00000000",
  "00111100", "01000010", "01000110", "01011010", "01100010", "01000010", "00111100", "00000000",
  "00001000", "00011000", "00101000", "00001000", "00001000", "00001000", "00111110", "00000000",
  "00111100", "01000010", "00000010", "00001100", "00110000", "01000000", "01111110", "00000000",
  "01111110", "01000000", "01111000", "00000100", "00000010", "01000100", "00111000", "00000000",
  "01111110", "01000010", "00000100", "00001000", "00010000", "00010000", "00010000", "00000000",
  "00111100", "01000010", "01000010", "00111110", "00000010", "00000100", "00111000", "00000000",
  "01111100", "00100010", "00100010", "00111100", "00100010", "00100010", "01111100", "00000000",
  "00011100", "00100010", "01000000", "01000000", "01000000", "00100010", "00011100", "00000000",
  "01111110", "01000000", "01000000", "01111000", "01000000", "01000000", "01111110", "00000000",
  "01111000", "00100100", "00100010", "00100010", "00100010", "00100100", "01111000", "00000000",
  "01111100", "01000010", "01000010", "01111100", "01001000", "01000100", "01000010", "00000000",
  "00011100", "00001000", "00001000", "00001000", "00001000", "00001000", "00011100", "00000000",
  "01000010", "01100010", "01010010", "01001010", "01000110", "01000010", "01000010", "00000000",
  "01000010", "01000010", "01000010", "00100100", "00100100", "00011000", "00011000", "00000000",
  "01000010", "01000010", "01000010", "01011010", "01011010", "01100110", "01000010", "00000000",
  "01000010", "01000100", "01001000", "01110000", "01001000", "01000100", "01000010", "00000000",
  "01111110", "00000010", "00000100", "00011000", "00100000", "01000000", "01111110", "00000000",
  "01111110", "01000000", "01000000", "01111000", "01000000", "01000000", "01000000", "00000000",
  "01111100", "01000010", "01000010", "01111100", "01000000", "01000000", "01000000", "00000000",
  "00011100", "00100010", "01000000", "01001110", "01000010", "00100010", "00011100", "00000000",
  "00001110", "00000100", "00000100", "00000100", "00000100", "01000100", "00111000", "00000000",
  "00011000", "00100100", "01000010", "01000010", "01001010", "00100100", "00011010", "00000000",
  "01000010", "01000010", "00100100", "00011000", "00100100", "01000010", "01000010", "00000000",
  "00011100", "00100010", "01001010", "01010110", "01001100", "00100000", "00011110", "00000000",
  "00000000", "01100010", "01100100", "00001000", "00010000", "00100110", "01000110", "00000000",
  "00110000", "01001000", "01001000", "00110000", "01001010", "01000100", "00111010", "00000000",
  "00000000", "01000000", "00100000", "00010000", "00001000", "00000100", "00000010", "00000000",
  "00111110", "00001000", "00001000", "00001000", "00001000", "00001000", "00001000", "00000000",
  "00100100", "00100100", "01111110", "00100100", "01111110", "00100100", "00100100", "00000000",
  "00000000", "00000000", "01111110", "00000000", "01111110", "00000000", "00000000", "00000000",
  "00100100", "00100100", "00100100", "00000000", "00000000", "00000000", "00000000", "00000000",
  "00011000", "00100100", "01000010", "01000010", "01000010", "00100100", "00011000", "00000000",
  "00000000", "00000000", "00000001", "00111110", "01010100", "00010100", "00010100", "00000000",
  "00000000", "00000000", "00010000", "00100000", "01111111", "00100000", "00010000", "00000000",
  "01000000", "01000000", "01000000", "01000000", "01000000", "01000000", "01111110", "00000000",
  "00111100", "01000010", "01000000", "00111100", "00000010", "01000010", "00111100", "00000000",
  // Remaining unique cells from VIC-20 / PET chargen MOS 901460-03 (non-reverse).
  "00011000", "00100100", "01000010", "01111110", "01000010", "01000010", "01000010", "00000000",
  "01000010", "01000010", "01000010", "01111110", "01000010", "01000010", "01000010", "00000000",
  "01000010", "01100110", "01011010", "01011010", "01000010", "01000010", "01000010", "00000000",
  "01000010", "01000010", "01000010", "01000010", "01000010", "01000010", "00111100", "00000000",
  "00100010", "00100010", "00100010", "00011100", "00001000", "00001000", "00001000", "00000000",
  "00111100", "00100000", "00100000", "00100000", "00100000", "00100000", "00111100", "00000000",
  "00001100", "00010000", "00010000", "00111100", "00010000", "01110000", "01101110", "00000000",
  "00111100", "00000100", "00000100", "00000100", "00000100", "00000100", "00111100", "00000000",
  "00000000", "00001000", "00011100", "00101010", "00001000", "00001000", "00001000", "00001000",
  "00001000", "00001000", "00001000", "00001000", "00000000", "00000000", "00001000", "00000000",
  "00001000", "00011110", "00101000", "00011100", "00001010", "00111100", "00001000", "00000000",
  "00001000", "00101010", "00011100", "00111110", "00011100", "00101010", "00001000", "00000000",
  "00000000", "00001000", "00001000", "00111110", "00001000", "00001000", "00000000", "00000000",
  "00000000", "00000000", "00000000", "01111110", "00000000", "00000000", "00000000", "00000000",
  "00000000", "00000010", "00000100", "00001000", "00010000", "00100000", "01000000", "00000000",
  "00111100", "01000010", "00000010", "00011100", "00000010", "01000010", "00111100", "00000000",
  "00000100", "00001100", "00010100", "00100100", "01111110", "00000100", "00000100", "00000000",
  "00011100", "00100000", "01000000", "01111100", "01000010", "01000010", "00111100", "00000000",
  "00111100", "01000010", "01000010", "00111100", "01000010", "01000010", "00111100", "00000000",
  "00000000", "00000000", "00001000", "00000000", "00000000", "00001000", "00000000", "00000000",
  "00000000", "00000000", "00001000", "00000000", "00000000", "00001000", "00001000", "00010000",
  "00001110", "00011000", "00110000", "01100000", "00110000", "00011000", "00001110", "00000000",
  "01110000", "00011000", "00001100", "00000110", "00001100", "00011000", "01110000", "00000000",
  "00111100", "01000010", "00000010", "00001100", "00010000", "00000000", "00010000", "00000000",
  "00000000", "00000000", "00000000", "00000000", "11111111", "00000000", "00000000", "00000000",
  "00010000", "00010000", "00010000", "00010000", "00010000", "00010000", "00010000", "00010000",
  "00000000", "00000000", "00000000", "11111111", "00000000", "00000000", "00000000", "00000000",
  "00000000", "00000000", "11111111", "00000000", "00000000", "00000000", "00000000", "00000000",
  "00000000", "11111111", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000",
  "00000000", "00000000", "00000000", "00000000", "00000000", "11111111", "00000000", "00000000",
  "00100000", "00100000", "00100000", "00100000", "00100000", "00100000", "00100000", "00100000",
  "00000100", "00000100", "00000100", "00000100", "00000100", "00000100", "00000100", "00000100",
  "00000000", "00000000", "00000000", "00000000", "11100000", "00010000", "00001000", "00001000",
  "00001000", "00001000", "00001000", "00000100", "00000011", "00000000", "00000000", "00000000",
  "00001000", "00001000", "00001000", "00010000", "11100000", "00000000", "00000000", "00000000",
  "10000000", "10000000", "10000000", "10000000", "10000000", "10000000", "10000000", "11111111",
  "10000000", "01000000", "00100000", "00010000", "00001000", "00000100", "00000010", "00000001",
  "00000001", "00000010", "00000100", "00001000", "00010000", "00100000", "01000000", "10000000",
  "11111111", "10000000", "10000000", "10000000", "10000000", "10000000", "10000000", "10000000",
  "11111111", "00000001", "00000001", "00000001", "00000001", "00000001", "00000001", "00000001",
  "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "11111111", "00000000",
  "01000000", "01000000", "01000000", "01000000", "01000000", "01000000", "01000000", "01000000",
  "10000001", "01000010", "00100100", "00011000", "00011000", "00100100", "01000010", "10000001",
  "00000000", "00111100", "01000010", "01000010", "01000010", "01000010", "00111100", "00000000",
  "00001000", "00011100", "00101010", "01110111", "00101010", "00001000", "00001000", "00000000",
  "00000010", "00000010", "00000010", "00000010", "00000010", "00000010", "00000010", "00000010",
  "00001000", "00001000", "00001000", "00001000", "11111111", "00001000", "00001000", "00001000",
  "00001000", "00001000", "00001000", "00001000", "00001000", "00001000", "00001000", "00001000",
  "11111111", "01111111", "00111111", "00011111", "00001111", "00000111", "00000011", "00000001",
  "11110000", "11110000", "11110000", "11110000", "11110000", "11110000", "11110000", "11110000",
  "00000000", "00000000", "00000000", "00000000", "11111111", "11111111", "11111111", "11111111",
  "11111111", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000",
  "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "11111111",
  "10000000", "10000000", "10000000", "10000000", "10000000", "10000000", "10000000", "10000000",
  "10101010", "01010101", "10101010", "01010101", "10101010", "01010101", "10101010", "01010101",
  "00000001", "00000001", "00000001", "00000001", "00000001", "00000001", "00000001", "00000001",
  "11111111", "11111110", "11111100", "11111000", "11110000", "11100000", "11000000", "10000000",
  "00000011", "00000011", "00000011", "00000011", "00000011", "00000011", "00000011", "00000011",
  "00001000", "00001000", "00001000", "00001000", "00001111", "00001000", "00001000", "00001000",
  "00000000", "00000000", "00000000", "00000000", "00001111", "00001111", "00001111", "00001111",
  "00001000", "00001000", "00001000", "00001000", "00001111", "00000000", "00000000", "00000000",
  "00000000", "00000000", "00000000", "00000000", "11111000", "00001000", "00001000", "00001000",
  "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "11111111", "11111111",
  "00000000", "00000000", "00000000", "00000000", "00001111", "00001000", "00001000", "00001000",
  "00001000", "00001000", "00001000", "00001000", "11111111", "00000000", "00000000", "00000000",
  "00000000", "00000000", "00000000", "00000000", "11111111", "00001000", "00001000", "00001000",
  "00001000", "00001000", "00001000", "00001000", "11111000", "00001000", "00001000", "00001000",
  "11000000", "11000000", "11000000", "11000000", "11000000", "11000000", "11000000", "11000000",
  "11100000", "11100000", "11100000", "11100000", "11100000", "11100000", "11100000", "11100000",
  "00000111", "00000111", "00000111", "00000111", "00000111", "00000111", "00000111", "00000111",
  "11111111", "11111111", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000",
  "11111111", "11111111", "11111111", "00000000", "00000000", "00000000", "00000000", "00000000",
  "00000000", "00000000", "00000000", "00000000", "00000000", "11111111", "11111111", "11111111",
  "00000001", "00000001", "00000001", "00000001", "00000001", "00000001", "00000001", "11111111",
  "00000000", "00000000", "00000000", "00000000", "11110000", "11110000", "11110000", "11110000",
  "00001111", "00001111", "00001111", "00001111", "00000000", "00000000", "00000000", "00000000",
  "00001000", "00001000", "00001000", "00001000", "11111000", "00000000", "00000000", "00000000",
  "11110000", "11110000", "11110000", "11110000", "00000000", "00000000", "00000000", "00000000",
  "11110000", "11110000", "11110000", "11110000", "00001111", "00001111", "00001111", "00001111",
  "00000000", "00000000", "00111000", "00000100", "00111100", "01000100", "00111010", "00000000",
  "01000000", "01000000", "01011100", "01100010", "01000010", "01100010", "01011100", "00000000",
  "00000000", "00000000", "00111100", "01000010", "01000000", "01000010", "00111100", "00000000",
  "00000010", "00000010", "00111010", "01000110", "01000010", "01000110", "00111010", "00000000",
  "00000000", "00000000", "00111100", "01000010", "01111110", "01000000", "00111100", "00000000",
  "00001100", "00010010", "00010000", "01111100", "00010000", "00010000", "00010000", "00000000",
  "00000000", "00000000", "00111010", "01000110", "01000110", "00111010", "00000010", "00111100",
  "01000000", "01000000", "01011100", "01100010", "01000010", "01000010", "01000010", "00000000",
  "00001000", "00000000", "00011000", "00001000", "00001000", "00001000", "00011100", "00000000",
  "00000100", "00000000", "00001100", "00000100", "00000100", "00000100", "01000100", "00111000",
  "01000000", "01000000", "01000100", "01001000", "01010000", "01101000", "01000100", "00000000",
  "00011000", "00001000", "00001000", "00001000", "00001000", "00001000", "00011100", "00000000",
  "00000000", "00000000", "01110110", "01001001", "01001001", "01001001", "01001001", "00000000",
  "00000000", "00000000", "01011100", "01100010", "01000010", "01000010", "01000010", "00000000",
  "00000000", "00000000", "00111100", "01000010", "01000010", "01000010", "00111100", "00000000",
  "00000000", "00000000", "01011100", "01100010", "01100010", "01011100", "01000000", "01000000",
  "00000000", "00000000", "00111010", "01000110", "01000110", "00111010", "00000010", "00000010",
  "00000000", "00000000", "01011100", "01100010", "01000000", "01000000", "01000000", "00000000",
  "00000000", "00000000", "00111110", "01000000", "00111100", "00000010", "01111100", "00000000",
  "00010000", "00010000", "01111100", "00010000", "00010000", "00010010", "00001100", "00000000",
  "00000000", "00000000", "01000010", "01000010", "01000010", "01000110", "00111010", "00000000",
  "00000000", "00000000", "01000010", "01000010", "01000010", "00100100", "00011000", "00000000",
  "00000000", "00000000", "01000001", "01001001", "01001001", "01001001", "00110110", "00000000",
  "00000000", "00000000", "01000010", "00100100", "00011000", "00100100", "01000010", "00000000",
  "00000000", "00000000", "01000010", "01000010", "01000110", "00111010", "00000010", "00111100",
  "00000000", "00000000", "01111110", "00000100", "00011000", "00100000", "01111110", "00000000",
  "11001100", "11001100", "00110011", "00110011", "11001100", "11001100", "00110011", "00110011",
  "11001100", "01100110", "00110011", "10011001", "11001100", "01100110", "00110011", "10011001",
  "10011001", "00110011", "01100110", "11001100", "10011001", "00110011", "01100110", "11001100",
  "00000001", "00000010", "01000100", "01001000", "01010000", "01100000", "01000000", "00000000",
] as const;

interface Glyph {
  /** 0 = white, 1 = black. */
  bits: Uint8Array;
  /** Number of black pixels in `bits`. */
  ink: number;
  /** Ink in each 2×2 cell (0–4), row-major. */
  cells: Float32Array;
  /** Horizontal + vertical ink transitions — how “drawn” the stamp is. */
  trans: number;
}

function luma8(r: number, g: number, b: number): number {
  return (r * 77 + g * 150 + b * 29) >> 8;
}

function uniquePatterns(patterns: number[][]): number[][] {
  const seen = new Set<string>();
  const out: number[][] = [];
  for (const p of patterns) {
    const key = p.join("");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function paintGlyph(ink: (x: number, y: number) => boolean): number[] {
  const bits: number[] = [];
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) bits.push(ink(x, y) ? 1 : 0);
  }
  return bits;
}

function fromRows(rows: readonly string[]): number[][] {
  const glyphs: number[][] = [];
  for (let i = 0; i < rows.length; i += TILE) {
    const bits: number[] = [];
    for (let y = 0; y < TILE; y++) {
      const row = rows[i + y];
      for (let x = 0; x < TILE; x++) bits.push(row[x] === "1" ? 1 : 0);
    }
    glyphs.push(bits);
  }
  return glyphs;
}

function cellAt(x: number, y: number): number {
  return (y >> 1) * CELLS + (x >> 1);
}

function glyphStats(bits: Uint8Array): { cells: Float32Array; trans: number } {
  const cells = new Float32Array(CELL_N);
  let trans = 0;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const i = y * TILE + x;
      cells[cellAt(x, y)] += bits[i];
      if (x < TILE - 1 && bits[i] !== bits[i + 1]) trans++;
      if (y < TILE - 1 && bits[i] !== bits[i + TILE]) trans++;
    }
  }
  return { cells, trans };
}

function finalize(bits: number[]): Glyph {
  const out = new Uint8Array(TILE_PX);
  let ink = 0;
  for (let i = 0; i < TILE_PX; i++) {
    const black = bits[i] ? 1 : 0;
    out[i] = black;
    ink += black;
  }
  return { bits: out, ink, ...glyphStats(out) };
}

function buildGlyphs(): Glyph[] {
  const patterns: number[][] = [];
  for (let i = 0; i < TILE; i++) patterns.push(paintGlyph((x) => x === i));
  for (let i = 0; i < TILE; i++) patterns.push(paintGlyph((_x, y) => y === i));
  patterns.push(paintGlyph((x, y) => ((x + y) & 1) === 0));
  patterns.push(paintGlyph((x, y) => x === y));
  patterns.push(paintGlyph((x, y) => x + y === 7));
  patterns.push(paintGlyph((x, y) => x === y || x + y === 7));
  patterns.push(paintGlyph((x, y) => x === 0 || y === 7));
  patterns.push(paintGlyph((x, y) => x === 7 || y === 7));
  patterns.push(paintGlyph((x, y) => x === 0 || y === 0));
  patterns.push(paintGlyph((x, y) => x === 7 || y === 0));
  patterns.push(...fromRows(RAW_GLYPHS));

  const inverted = patterns.map((g) => g.map((bit) => (bit === 1 ? 0 : 1)));
  return uniquePatterns([...patterns, ...inverted]).map(finalize);
}

const GLYPHS = buildGlyphs();
const SOLID_BLACK: Glyph = { bits: new Uint8Array(TILE_PX).fill(1), ink: TILE_PX, ...glyphStats(new Uint8Array(TILE_PX).fill(1)) };
const SOLID_WHITE: Glyph = { bits: new Uint8Array(TILE_PX), ink: 0, ...glyphStats(new Uint8Array(TILE_PX)) };
const CATALOG = [SOLID_WHITE, ...GLYPHS, SOLID_BLACK];

/** Per-bin ink ceiling across letter/stroke stamps only — solids would flatten this. */
const CELL_MAX = new Float32Array(CELL_N);
for (const g of GLYPHS) {
  for (let c = 0; c < CELL_N; c++) {
    if (g.cells[c] > CELL_MAX[c]) CELL_MAX[c] = g.cells[c];
  }
}
for (let c = 0; c < CELL_N; c++) {
  if (CELL_MAX[c] < 1e-6) CELL_MAX[c] = 1;
}

const HALO = CELLS + 2;
const HALO_N = HALO * HALO;

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function punchVector(values: Float32Array, n: number, exponent: number): void {
  if (exponent === 1) return;
  let max = 0;
  for (let i = 0; i < n; i++) if (values[i] > max) max = values[i];
  if (max <= 0) return;
  for (let i = 0; i < n; i++) {
    values[i] = Math.pow(values[i] / max, exponent) * max;
  }
}

function punchLumaInPlace(block: Uint8Array, exponent: number): void {
  if (exponent === 1) return;
  let maxD = 0;
  for (let i = 0; i < TILE_PX; i++) {
    const d = (L - block[i]) / L;
    if (d > maxD) maxD = d;
  }
  if (maxD <= 0) return;
  for (let i = 0; i < TILE_PX; i++) {
    const d = (L - block[i]) / L;
    block[i] = clampByte(Math.round(L - Math.pow(d / maxD, exponent) * maxD * L));
  }
}

function sampleDarkness(luma: Uint8Array, width: number, height: number, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= width || y >= height) return 0;
  return (L - luma[y * width + x]) / L;
}

function fillHalo(
  luma: Uint8Array,
  width: number,
  height: number,
  tx: number,
  ty: number,
  halo: Float32Array,
): void {
  for (let hy = 0; hy < HALO; hy++) {
    for (let hx = 0; hx < HALO; hx++) {
      const px = tx - CELL + hx * CELL;
      const py = ty - CELL + hy * CELL;
      let sum = 0;
      for (let y = 0; y < CELL; y++) {
        for (let x = 0; x < CELL; x++) sum += sampleDarkness(luma, width, height, px + x, py + y);
      }
      halo[hy * HALO + hx] = sum;
    }
  }
}

function ringMax(halo: Float32Array, cx: number, cy: number): number {
  let m = 0;
  const hx = cx + 1;
  const hy = cy + 1;
  const consider = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= HALO || y >= HALO) return;
    if (x !== 0 && x !== HALO - 1 && y !== 0 && y !== HALO - 1) return;
    const v = halo[y * HALO + x];
    if (v > m) m = v;
  };
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) consider(hx + dx, hy + dy);
  }
  if (cy <= 1) {
    for (let dx = -1; dx <= 1; dx++) consider(hx + dx, 0);
  }
  if (cy >= CELLS - 2) {
    for (let dx = -1; dx <= 1; dx++) consider(hx + dx, HALO - 1);
  }
  if (cx <= 1) {
    for (let dy = -1; dy <= 1; dy++) consider(0, hy + dy);
  }
  if (cx >= CELLS - 2) {
    for (let dy = -1; dy <= 1; dy++) consider(HALO - 1, hy + dy);
  }
  return m;
}

function directionalPunch(cells: Float32Array, halo: Float32Array, exponent: number): void {
  if (exponent === 1) return;
  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) {
      const i = cy * CELLS + cx;
      const value = cells[i];
      const maxValue = Math.max(value, ringMax(halo, cx, cy));
      if (maxValue <= 0) continue;
      cells[i] = Math.pow(value / maxValue, exponent) * maxValue;
    }
  }
}

function directionalPunchLuma(
  luma: Uint8Array,
  width: number,
  height: number,
  tx: number,
  ty: number,
  block: Uint8Array,
  out: Uint8Array,
  exponent: number,
): void {
  if (exponent === 1) {
    out.set(block);
    return;
  }
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const i = y * TILE + x;
      const d = (L - block[i]) / L;
      let maxD = d;
      if (y <= 1) maxD = Math.max(maxD, sampleDarkness(luma, width, height, tx + x, ty - CELL));
      if (y >= TILE - 2) maxD = Math.max(maxD, sampleDarkness(luma, width, height, tx + x, ty + TILE + CELL - 1));
      if (x <= 1) maxD = Math.max(maxD, sampleDarkness(luma, width, height, tx - CELL, ty + y));
      if (x >= TILE - 2) maxD = Math.max(maxD, sampleDarkness(luma, width, height, tx + TILE + CELL - 1, ty + y));
      out[i] = maxD <= 0 ? block[i] : clampByte(Math.round(L - Math.pow(d / maxD, exponent) * maxD * L));
    }
  }
}

function scoreLuma(
  luma: Uint8Array,
  width: number,
  height: number,
  tx: number,
  ty: number,
  block: Uint8Array,
  punched: Uint8Array,
  punch: number,
  directional: boolean,
): Uint8Array {
  if (punch === 1) return block;
  if (directional) directionalPunchLuma(luma, width, height, tx, ty, block, punched, punch);
  else punched.set(block);
  punchLumaInPlace(punched, punch);
  return punched;
}

function fillTileStats(block: Uint8Array, cells: Float32Array): { targetInk: number; variance: number } {
  let sum = 0;
  let sumSq = 0;
  cells.fill(0);
  for (let i = 0; i < TILE_PX; i++) {
    const v = block[i];
    sum += v;
    sumSq += v * v;
    cells[cellAt(i & 7, i >> 3)] += (L - v) / L;
  }
  const mean = sum / TILE_PX;
  return {
    targetInk: ((L - mean) * TILE_PX) / L,
    variance: sumSq / TILE_PX - mean * mean,
  };
}

function massScore(
  g: Glyph,
  block: Uint8Array,
  cells: Float32Array,
  targetInk: number,
  normalize: boolean,
): number {
  let quad = 0;
  for (let c = 0; c < CELL_N; c++) {
    const gc = normalize ? g.cells[c] / CELL_MAX[c] : g.cells[c];
    const ic = normalize ? cells[c] / CELL_MAX[c] : cells[c];
    quad += Math.abs(gc - ic);
  }
  let spill = 0;
  for (let p = 0; p < TILE_PX; p++) {
    if (g.bits[p]) spill += block[p];
  }
  return (
    quad * CELL_WEIGHT +
    Math.abs(g.ink - targetInk) * INK_WEIGHT +
    (spill / L) * SPILL_WEIGHT -
    g.trans * TRANS_WEIGHT
  );
}

function lumaScore(g: Glyph, block: Uint8Array): number {
  let l1 = 0;
  for (let p = 0; p < TILE_PX; p++) {
    l1 += g.bits[p] ? block[p] : L - block[p];
  }
  return (l1 / L) * LUMA_WEIGHT;
}

function pickGlyph(
  block: Uint8Array,
  cells: Float32Array,
  mode: AsciiMatchMode,
  targetInk: number,
  variance: number,
  scoreBlock: Uint8Array,
  normalize: boolean,
): Glyph {
  if (targetInk < 1.5) return SOLID_WHITE;
  if (targetInk > TILE_PX - 1.5) return SOLID_BLACK;

  const structure = variance <= 0 ? 0 : variance >= VAR_REF ? 1 : variance / VAR_REF;
  let best = CATALOG[0];
  let bestScore = Infinity;
  for (let i = 0; i < CATALOG.length; i++) {
    const g = CATALOG[i];
    let score: number;
    if (mode === "luma") {
      score = lumaScore(g, scoreBlock);
    } else {
      const mass = massScore(g, block, cells, targetInk, normalize);
      score = mode === "mass" ? mass : structure * lumaScore(g, scoreBlock) + (1 - structure) * mass;
    }
    if (score < bestScore) {
      bestScore = score;
      best = g;
    }
  }
  return best;
}

function fillLuma(frame: ImageFrame, luma: Uint8Array): void {
  const { rgba } = frame;
  const n = frame.width * frame.height;
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    luma[i] = luma8(rgba[p], rgba[p + 1], rgba[p + 2]);
  }
}

function addError(carry: Float32Array, cols: number, rows: number, col: number, row: number, amount: number): void {
  if (col < 0 || row < 0 || col >= cols || row >= rows) return;
  carry[row * cols + col] += amount;
}

function asciiApply(
  luma: Uint8Array,
  width: number,
  height: number,
  out: Uint8Array,
  block: Uint8Array,
  cells: Float32Array,
  carry: Float32Array,
  halo: Float32Array,
  punched: Uint8Array,
  opts: ResolvedAsciiOptions,
): void {
  const tileW = width - (width % TILE);
  const tileH = height - (height % TILE);
  const cols = tileW / TILE;
  const rows = tileH / TILE;
  carry.fill(0);

  for (let row = 0; row < rows; row++) {
    const ty = row * TILE;
    for (let col = 0; col < cols; col++) {
      const tx = col * TILE;
      const bias = opts.diffuse ? carry[row * cols + col] : 0;
      let bi = 0;
      for (let y = 0; y < TILE; y++) {
        const src = (ty + y) * width + tx;
        for (let x = 0; x < TILE; x++) block[bi++] = clampByte(luma[src + x] + bias);
      }
      const { targetInk, variance } = fillTileStats(block, cells);
      if (opts.directional && opts.punch !== 1) {
        fillHalo(luma, width, height, tx, ty, halo);
        directionalPunch(cells, halo, opts.punch);
      }
      punchVector(cells, CELL_N, opts.punch);
      const scoreBlock = scoreLuma(
        luma,
        width,
        height,
        tx,
        ty,
        block,
        punched,
        opts.punch,
        opts.directional,
      );
      const glyph = pickGlyph(block, cells, opts.match, targetInk, variance, scoreBlock, opts.normalize);
      bi = 0;
      for (let y = 0; y < TILE; y++) {
        const dst = (ty + y) * width + tx;
        for (let x = 0; x < TILE; x++) out[dst + x] = glyph.bits[bi++];
      }
      if (!opts.diffuse) continue;
      let sum = 0;
      for (let i = 0; i < TILE_PX; i++) sum += block[i];
      const leftover = ((L - sum / TILE_PX) * TILE_PX) / L;
      const q = ((glyph.ink - leftover) * (L / TILE_PX)) / 8;
      addError(carry, cols, rows, col + 1, row, q);
      addError(carry, cols, rows, col + 2, row, q);
      addError(carry, cols, rows, col - 1, row + 1, q);
      addError(carry, cols, rows, col, row + 1, q);
      addError(carry, cols, rows, col + 1, row + 1, q);
      addError(carry, cols, rows, col, row + 2, q);
    }
  }

  if (tileW === width && tileH === height) return;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    const x0 = y < tileH ? tileW : 0;
    for (let x = x0; x < width; x++) out[row + x] = luma[row + x] < 128 ? 1 : 0;
  }
}

function matchMode(options?: AsciiDitherOptions): AsciiMatchMode {
  const match = options?.match;
  return match === "mass" || match === "blend" || match === "luma" ? match : "blend";
}

/** One-shot conversion. Default matcher is `blend`. */
export function asciiToBits(frame: ImageFrame, options?: AsciiDitherOptions): Uint8Array {
  const luma = new Uint8Array(frame.width * frame.height);
  const out = new Uint8Array(frame.width * frame.height);
  const cols = Math.floor(frame.width / TILE);
  const rows = Math.floor(frame.height / TILE);
  fillLuma(frame, luma);
  asciiApply(
    luma,
    frame.width,
    frame.height,
    out,
    new Uint8Array(TILE_PX),
    new Float32Array(CELL_N),
    new Float32Array(Math.max(1, cols * rows)),
    new Float32Array(HALO_N),
    new Uint8Array(TILE_PX),
    resolveAsciiOptions(options),
  );
  return out;
}

/** Every stamp the matcher may emit, including the solid black/white extremes. */
export function listAsciiGlyphs(): Uint8Array[] {
  return CATALOG.map((g) => g.bits);
}

/** Pack the glyph set into a 1-bit atlas (`0` = white, `1` = black) with a 1px gutter. */
export function renderAsciiGlyphAtlas(width: number, height: number): Uint8Array {
  const glyphs = listAsciiGlyphs();
  const cell = TILE + 1;
  const cols = Math.max(1, Math.floor((width + 1) / cell));
  const out = new Uint8Array(width * height);
  for (let i = 0; i < glyphs.length; i++) {
    const gx = (i % cols) * cell;
    const gy = Math.floor(i / cols) * cell;
    if (gy + TILE > height) break;
    const bits = glyphs[i];
    for (let y = 0; y < TILE; y++) {
      const dst = (gy + y) * width + gx;
      const src = y * TILE;
      for (let x = 0; x < TILE; x++) {
        if (gx + x < width) out[dst + x] = bits[src + x];
      }
    }
  }
  return out;
}

/** Same conversion, reusing a caller-owned buffer for the viewfinder loop. */
export function createAsciiDitherer(
  width: number,
  height: number,
  options?: AsciiDitherOptions,
): (frame: ImageFrame, out: Uint8Array) => void {
  const block = new Uint8Array(TILE_PX);
  const cells = new Float32Array(CELL_N);
  const luma = new Uint8Array(width * height);
  const cols = Math.floor(width / TILE);
  const rows = Math.floor(height / TILE);
  const carry = new Float32Array(Math.max(1, cols * rows));
  const halo = new Float32Array(HALO_N);
  const punched = new Uint8Array(TILE_PX);
  const opts = resolveAsciiOptions(options);
  return (frame, out) => {
    if (frame.width !== width || frame.height !== height) {
      throw new Error(`Ditherer is ${width}×${height}, frame is ${frame.width}×${frame.height}`);
    }
    fillLuma(frame, luma);
    asciiApply(luma, width, height, out, block, cells, carry, halo, punched, opts);
  };
}
