/**
 * ESC/POS command encoder for thermal receipt printers.
 *
 * Only the handful of commands Mockintosh needs: initialise, raster image,
 * paper feed and cut. Pure — no I/O, no platform APIs — so the bytes can be
 * unit-tested and sent over any {@link PrinterTransport}.
 *
 * Bitmaps are QuickDraw `BitMap`s (1 byte per pixel, `1` = black) and are
 * packed to the printer's 1-bit-per-pixel row format here. When QuickDraw
 * moves to packed 1bpp storage this becomes a straight copy.
 */
import type { BitMap } from "@mockintosh/quickdraw";

const ESC = 0x1b;
const GS = 0x1d;

/**
 * Maximum rows per `GS v 0` raster command. Printers accept up to 65535 in
 * principle, but many have small receive buffers; banding keeps each command
 * modest and lets the printer start on the first band while later ones arrive.
 */
export const RASTER_BAND_ROWS = 128;

export interface CutOptions {
  /** `"partial"` leaves a small bridge of paper; `"full"` severs it. */
  mode?: "full" | "partial";
}

/** Builds an ESC/POS byte stream. Chain calls, then `encode()`. */
export class EscPosEncoder {
  private readonly chunks: Uint8Array[] = [];

  /** `ESC @` — reset the printer to its power-on state. */
  initialize(): this {
    return this.raw([ESC, 0x40]);
  }

  /**
   * `GS v 0` — print `bits` as a raster image at the current position, one
   * band at a time. The image is left-aligned; pad the bitmap to centre it.
   *
   * @param bits  Packed 1-bit bitmap, `1` = black. Its `bounds` define the area.
   */
  raster(bits: BitMap): this {
    const width = bits.bounds.right - bits.bounds.left;
    const height = bits.bounds.bottom - bits.bounds.top;
    if (width <= 0 || height <= 0) return this;

    const bytesPerRow = Math.ceil(width / 8);
    for (let bandTop = 0; bandTop < height; bandTop += RASTER_BAND_ROWS) {
      const bandRows = Math.min(RASTER_BAND_ROWS, height - bandTop);
      this.raw([
        GS, 0x76, 0x30, 0x00,
        bytesPerRow & 0xff, (bytesPerRow >> 8) & 0xff,
        bandRows & 0xff, (bandRows >> 8) & 0xff,
      ]);
      this.chunks.push(packRows(bits, bandTop, bandRows, bytesPerRow));
    }
    return this;
  }

  /** `ESC J n` — advance the paper by `dots` (any length; split into ≤255-dot steps). */
  feed(dots: number): this {
    let remaining = Math.max(0, Math.round(dots));
    while (remaining > 0) {
      const step = Math.min(255, remaining);
      this.raw([ESC, 0x4a, step]);
      remaining -= step;
    }
    return this;
  }

  /** `GS V m` — cut the paper. */
  cut(options: CutOptions = {}): this {
    return this.raw([GS, 0x56, options.mode === "partial" ? 0x01 : 0x00]);
  }

  /** Append literal bytes (for printer-specific commands). */
  raw(bytes: ArrayLike<number>): this {
    this.chunks.push(bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes));
    return this;
  }

  /** Concatenate everything appended so far. */
  encode(): Uint8Array {
    let length = 0;
    for (const c of this.chunks) length += c.length;
    const out = new Uint8Array(length);
    let offset = 0;
    for (const c of this.chunks) {
      out.set(c, offset);
      offset += c.length;
    }
    return out;
  }
}

/**
 * Copy `rows` rows of a bitmap starting at `firstRow` into ESC/POS raster
 * format. QuickDraw bitmaps already use the printer's layout (MSB leftmost,
 * `1` = black), so this is a row-by-row copy that drops the bitmap's word
 * padding: each output row is exactly `bytesPerRow` bytes.
 */
export function packRows(bits: BitMap, firstRow: number, rows: number, bytesPerRow: number): Uint8Array {
  const out = new Uint8Array(bytesPerRow * rows);
  for (let y = 0; y < rows; y++) {
    const src = (firstRow + y) * bits.rowBytes;
    out.set(bits.baseAddr.subarray(src, src + bytesPerRow), y * bytesPerRow);
  }
  return out;
}
