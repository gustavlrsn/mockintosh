/**
 * The OS's cursors, as QuickDraw `Cursor`s (16×16 data + mask + hot spot).
 *
 * The arrow is QuickDraw's own (`globals.arrow`, from `GrafAsm.a`). The rest
 * are converted from 1-byte-per-pixel sprite art at load time. Change the
 * cursor with `SetCursor(cursors.watch)`; `drawCursor` in `cursor.ts` paints
 * whatever `cursorState` holds.
 */
import { globals, type Cursor, type Point } from "@mockintosh/quickdraw";
import { defineSprite, type Sprite } from "@mockintosh/ui";

/**
 * Pack a sprite of at most 16×16 (data + mask, 1 byte per pixel) into a
 * QuickDraw cursor, top-left aligned; the rest of the 16×16 is transparent.
 */
export function cursorFromSprite(sprite: Sprite, hotSpot: Point): Cursor {
  if (sprite.width > 16 || sprite.height > 16) {
    throw new Error(`Cursors are at most 16×16; got ${sprite.width}×${sprite.height}`);
  }
  const data = new Uint16Array(16);
  const mask = new Uint16Array(16);
  for (let v = 0; v < sprite.height; v++) {
    let d = 0;
    let m = 0;
    for (let h = 0; h < sprite.width; h++) {
      const i = v * sprite.width + h;
      const bit = 0x8000 >> h;
      if (sprite.mask[i]) {
        m |= bit;
        if (sprite.data[i]) d |= bit;
      }
    }
    data[v] = d;
    mask[v] = m;
  }
  return { data, mask, hotSpot };
}

const GRAB_SPRITE = defineSprite(
  16,
  16,
  "AAKAAAKJagAJaWWACWlliAJZZaYCWWWWKJVVlpaVVVaVlVVYJVVVWAlVVVgJVVVgAlVVYACVVYAAJVWAACVVgA=="
);
const GRABBING_SPRITE = defineSprite(
  16,
  16,
  "AAAAAAAAAAAAAAAAAAAAAACiigACWWWgAlVVmACVVVgClVVYCVVVWAlVVVgJVVVgAlVVYACVVYAAJVWAACVVgA=="
);
const IBEAM_SPRITE = defineSprite(
  7,
  16,
  "oCgiACAAgAIACAAgAIACAAgAIACAAgAIAIgoCg=="
);
const WATCH_SPRITE = defineSprite(
  11,
  16,
  "CqoAKqgAqqACqoAlVYJVlYlWViVZWpalalVViVVWCVVgCqoAKqgAqqACqoA="
);

export const cursors = {
  arrow: globals.arrow,
  grab: cursorFromSprite(GRAB_SPRITE, { v: 8, h: 8 }),
  grabbing: cursorFromSprite(GRABBING_SPRITE, { v: 8, h: 8 }),
  iBeam: cursorFromSprite(IBEAM_SPRITE, { v: 7, h: 3 }),
  watch: cursorFromSprite(WATCH_SPRITE, { v: 8, h: 8 }),
} satisfies Record<string, Cursor>;
