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
import { decodeBase64, encodeBase64 } from "./base64";

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

/**
 * Encode a sprite as base64 2 bpp — the inverse of `defineSprite`, and the
 * pixel format of sprite files. A sprite without a mask is fully opaque.
 */
export function encodeSprite(sprite: Sprite): string {
  const total = sprite.width * sprite.height;
  const raw = new Uint8Array((total + 3) >> 2);
  for (let i = 0; i < total; i++) {
    const opaque = sprite.mask ? sprite.mask[i] !== 0 : true;
    const val = !opaque ? 0 : sprite.data[i] === BLACK ? 2 : 1;
    raw[i >> 2] |= val << (6 - (i & 3) * 2);
  }
  return encodeBase64(raw);
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

const smallIcons = new WeakMap<Sprite, Sprite>();

/**
 * The 16×16 icon the menu bar shows. A sprite that is already 16×16 is
 * returned as-is; a larger one (the usual 32×32 `ICN#`) is reduced by
 * majority vote of each block, ties going to black so a one-pixel stroke
 * survives. This is the stand-in for a hand-drawn `ics#`.
 */
export function smallIcon(sprite: Sprite, size = 16): Sprite {
  if (sprite.width === size && sprite.height === size) return sprite;
  const cached = smallIcons.get(sprite);
  if (cached && cached.width === size && cached.height === size) return cached;
  const data = new Uint8Array(size * size);
  const mask = sprite.mask ? new Uint8Array(size * size) : undefined;
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor((y * sprite.height) / size);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * sprite.height) / size));
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor((x * sprite.width) / size);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * sprite.width) / size));
      let opaque = 0;
      let black = 0;
      let total = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = sy * sprite.width + sx;
          total++;
          if (sprite.mask && sprite.mask[i] === 0) continue;
          opaque++;
          if (sprite.data[i] === BLACK) black++;
        }
      }
      const out = y * size + x;
      data[out] = opaque > 0 && black * 2 >= opaque ? BLACK : WHITE;
      if (mask) mask[out] = opaque * 2 >= total ? 1 : 0;
    }
  }
  const reduced: Sprite = mask ? { width: size, height: size, data, mask } : { width: size, height: size, data };
  smallIcons.set(sprite, reduced);
  return reduced;
}
