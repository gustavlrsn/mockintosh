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
import type { CutOptions, EscPosCutCommand, EscPosPrintTuning, PrinterEncoder } from "./encoder";

export type { CutOptions } from "./encoder";

const DC2 = 0x12;
const ESC = 0x1b;
const GS = 0x1d;

/**
 * Default maximum rows per `GS v 0` raster command. The printer stops the
 * paper between commands, which leaves a faint line at each band boundary,
 * so fewer, taller bands print cleaner. Small bands only matter on links
 * without flow control, where a printer's receive buffer can overflow.
 */
export const RASTER_BAND_ROWS = 128;

export interface EscPosEncoderOptions {
  /** Which cut command `cut()` sends. Default `gs-v`. */
  cutCommand?: EscPosCutCommand;
  /** Rows per `GS v 0` command (1–65535). Default {@link RASTER_BAND_ROWS}. */
  rasterBandRows?: number;
  /** Speed / heat setting `begin()` sends after `ESC @`, which may reset it. */
  tuning?: EscPosPrintTuning;
  /**
   * Blank rows prepended inside each raster command, so the paper motor is
   * up to speed before the image starts (its first millimetres band otherwise).
   */
  rasterLeadInRows?: number;
}

/** Builds an ESC/POS byte stream. Chain calls, then `encode()` / `end()`. */
export class EscPosEncoder implements PrinterEncoder {
  private readonly chunks: Uint8Array[] = [];
  private readonly cutCommand: EscPosCutCommand;
  private readonly bandRows: number;
  private readonly tuning: EscPosPrintTuning | undefined;
  private readonly leadInRows: number;

  constructor(options: EscPosEncoderOptions = {}) {
    this.cutCommand = options.cutCommand ?? "gs-v";
    this.bandRows = Math.min(0xffff, Math.max(1, Math.floor(options.rasterBandRows ?? RASTER_BAND_ROWS)));
    this.tuning = options.tuning;
    this.leadInRows = Math.max(0, Math.floor(options.rasterLeadInRows ?? 0));
  }

  /** `ESC @` — reset the printer to its power-on state. */
  initialize(): this {
    return this.raw([ESC, 0x40]);
  }

  begin(): this {
    this.initialize();
    return this.tuning ? this.tune(this.tuning) : this;
  }

  /** Send a speed / heat setting (see {@link EscPosPrintTuning}). */
  tune(tuning: EscPosPrintTuning): this {
    const byte = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));
    switch (tuning.command) {
      case "gs-k":
        if (tuning.density !== undefined) {
          // −6…−1 are sent as 0xFA…0xFF.
          const d = byte(tuning.density, -6, 8);
          this.raw([GS, 0x28, 0x4b, 0x02, 0x00, 0x31, d < 0 ? 0x100 + d : d]);
        }
        if (tuning.speed !== undefined) this.raw([GS, 0x28, 0x4b, 0x02, 0x00, 0x32, byte(tuning.speed, 1, 13)]);
        return this;
      case "dc2-density":
        return this.raw([DC2, 0x23, (byte(tuning.breakTime, 0, 7) << 5) | byte(tuning.density, 0, 31)]);
      case "esc-7":
        return this.raw([
          ESC,
          0x37,
          byte(tuning.heatingDots, 0, 255),
          byte(tuning.heatingTime, 0, 255),
          byte(tuning.heatingInterval, 0, 255),
        ]);
    }
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
    const lead = this.leadInRows;
    const total = lead + height;
    for (let bandTop = 0; bandTop < total; bandTop += this.bandRows) {
      const bandRows = Math.min(this.bandRows, total - bandTop);
      this.raw([
        GS, 0x76, 0x30, 0x00,
        bytesPerRow & 0xff, (bytesPerRow >> 8) & 0xff,
        bandRows & 0xff, (bandRows >> 8) & 0xff,
      ]);
      const blankRows = Math.min(bandRows, Math.max(0, lead - bandTop));
      if (blankRows === 0) {
        this.chunks.push(packRows(bits, bandTop - lead, bandRows, bytesPerRow));
        continue;
      }
      const band = new Uint8Array(bytesPerRow * bandRows);
      if (bandRows > blankRows) band.set(packRows(bits, 0, bandRows - blankRows, bytesPerRow), blankRows * bytesPerRow);
      this.chunks.push(band);
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

  /** Print a line in the printer's built-in font, then `LF`. Non-ASCII characters become `?`. */
  text(line: string): this {
    const bytes = Array.from(line, (ch) => {
      const code = ch.charCodeAt(0);
      return code >= 0x20 && code < 0x7f ? code : 0x3f;
    });
    return this.raw([...bytes, 0x0a]);
  }

  /** Cut the paper with the configured {@link EscPosCutCommand}. */
  cut(options: CutOptions = {}): this {
    const partial = options.mode === "partial";
    switch (this.cutCommand) {
      case "gs-v":
        return this.raw([GS, 0x56, partial ? 0x01 : 0x00]);
      case "gs-v-feed":
        return this.raw([GS, 0x56, partial ? 0x42 : 0x41, 0x00]);
      case "esc-i":
        return this.raw([ESC, partial ? 0x6d : 0x69]);
    }
  }

  /** Append literal bytes (for printer-specific commands). */
  raw(bytes: ArrayLike<number>): this {
    this.chunks.push(bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes));
    return this;
  }

  /** Concatenate everything appended so far. */
  end(): Uint8Array {
    return this.encode();
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
