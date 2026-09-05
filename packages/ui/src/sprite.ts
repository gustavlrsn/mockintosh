/**
 * Sprite — the 1-bit image asset format.
 *
 * Icons, cursors, window chrome, and app-exported artwork are all sprites:
 * 1 byte per pixel (`0` = white, `1` = black) with an optional mask
 * (`0` = transparent). It is deliberately not the framebuffer format —
 * QuickDraw bitmaps are packed 1 bpp — because sprites are authored and
 * inspected as pixels; `<image>` packs each sprite once before drawing it.
 */
import type { Ink } from "./nodes";
import { decodeBase64 } from "./base64";

export const BLACK: Ink = 1;
export const WHITE: Ink = 0;

export interface Sprite {
  width: number;
  height: number;
  /** 1 byte per pixel: 0 = white, 1 = black. */
  data: Uint8Array;
  /** 1 byte per pixel: 0 = transparent, 1 = opaque. Omitted = fully opaque. */
  mask?: Uint8Array;
}

/**
 * Decode a base64-encoded 2 bpp sprite: 4 pixels per byte, MSB first,
 * `00` = transparent, `01` = white, `10` = black.
 */
export function defineSprite(width: number, height: number, b64: string): Sprite {
  const raw = decodeBase64(b64);
  const total = width * height;
  const data = new Uint8Array(total);
  const mask = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const shift = 6 - (i & 3) * 2;
    const val = (raw[i >> 2] >> shift) & 0x03;
    data[i] = val === 2 ? BLACK : WHITE;
    mask[i] = val === 0 ? 0 : 1;
  }
  return { width, height, data, mask };
}

/** Build a sprite from an ASCII grid: `#` black, `.` transparent, anything else white. */
export function fromGrid(width: number, height: number, rows: string[]): Sprite {
  const data = new Uint8Array(width * height);
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const row = rows[y] || "";
    for (let x = 0; x < width; x++) {
      const ch = row[x] || ".";
      const i = y * width + x;
      if (ch === "#") {
        data[i] = BLACK;
        mask[i] = 1;
      } else if (ch === ".") {
        data[i] = WHITE;
        mask[i] = 0;
      } else {
        data[i] = WHITE;
        mask[i] = 1;
      }
    }
  }
  return { width, height, data, mask };
}
