/**
 * GB0x / MX0x “cat printer” command encoder.
 *
 * These BLE printers (GB01, GT01, MX05, …) speak a framed protocol, not
 * ESC/POS: `51 78 CMD 00 LEN_L LEN_H PAYLOAD CRC8(payload) FF`. Bits are
 * packed the same way as QuickDraw / ESC/POS (MSB left, 1 = black).
 *
 * Framing matches NaitLee/Cat-Printer and the public GB01 dumps. There is
 * no cut command — `cut()` feeds a little extra paper so the tear bar is
 * past the print head.
 */
import type { BitMap } from "@mockintosh/quickdraw";
import type { PrinterEncoder } from "./encoder";
import type { CutOptions } from "./encoder";
import { packRows } from "./escpos";

const CMD_FEED = 0xa1;
const CMD_DRAW = 0xa2;
const CMD_QUALITY = 0xa4;
const CMD_LATTICE = 0xa6;
const CMD_ENERGY = 0xaf;
const CMD_SPEED = 0xbd;
const CMD_MODE = 0xbe;

const LATTICE_START = [0xaa, 0x55, 0x17, 0x38, 0x44, 0x5f, 0x5f, 0x5f, 0x44, 0x38, 0x2c];
const LATTICE_END = [0xaa, 0x55, 0x17, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17];

/** CRC-8, poly 0x07, init 0 — checksum of the payload only. */
const CRC8_TABLE = (() => {
  const table = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let bit = 0; bit < 8; bit++) {
      c = c & 0x80 ? ((c << 1) ^ 0x07) & 0xff : (c << 1) & 0xff;
    }
    table[i] = c;
  }
  return table;
})();

export function crc8(data: ArrayLike<number>): number {
  let crc = 0;
  for (let i = 0; i < data.length; i++) {
    crc = CRC8_TABLE[(crc ^ data[i]) & 0xff]!;
  }
  return crc;
}

/** One host→printer frame. Exported so tests can check known vectors. */
export function catFrame(command: number, payload: ArrayLike<number> = []): Uint8Array {
  const length = payload.length;
  const out = new Uint8Array(8 + length);
  out[0] = 0x51;
  out[1] = 0x78;
  out[2] = command;
  out[3] = 0x00;
  out[4] = length & 0xff;
  out[5] = (length >> 8) & 0xff;
  out.set(payload, 6);
  out[6 + length] = crc8(payload);
  out[7 + length] = 0xff;
  return out;
}

export interface CatPrinterOptions {
  /** Thermal energy, 1–0xFFFF. Default 0x2EE0 (12000), a moderate GB01 value. */
  energy?: number;
  /** Quality byte; GB01's APK always sends 0x33. */
  quality?: number;
  /** Speed byte sent before image rows. */
  speed?: number;
}

export class CatPrinterEncoder implements PrinterEncoder {
  private readonly chunks: Uint8Array[] = [];
  private readonly energy: number;
  private readonly quality: number;
  private readonly speed: number;

  constructor(options: CatPrinterOptions = {}) {
    this.energy = options.energy ?? 0x2ee0;
    this.quality = options.quality ?? 0x33;
    this.speed = options.speed ?? 0x23;
  }

  begin(): this {
    const energy = this.energy & 0xffff;
    this.chunks.push(
      catFrame(CMD_QUALITY, [this.quality]),
      catFrame(CMD_LATTICE, LATTICE_START),
      catFrame(CMD_ENERGY, [energy & 0xff, (energy >> 8) & 0xff]),
      catFrame(CMD_MODE, [0x00]),
      catFrame(CMD_SPEED, [this.speed]),
    );
    return this;
  }

  raster(bits: BitMap): this {
    const width = bits.bounds.right - bits.bounds.left;
    const height = bits.bounds.bottom - bits.bounds.top;
    if (width <= 0 || height <= 0) return this;
    const bytesPerRow = Math.ceil(width / 8);
    for (let y = 0; y < height; y++) {
      this.chunks.push(catFrame(CMD_DRAW, packRows(bits, y, 1, bytesPerRow)));
    }
    return this;
  }

  feed(dots: number): this {
    let remaining = Math.max(0, Math.round(dots));
    while (remaining > 0) {
      const step = Math.min(255, remaining);
      this.chunks.push(catFrame(CMD_FEED, [step, 0x00]));
      remaining -= step;
    }
    return this;
  }

  /** No cutter; feed a little so the tear bar is past the last row. */
  cut(_options: CutOptions = {}): this {
    return this.feed(40);
  }

  end(): Uint8Array {
    this.chunks.push(catFrame(CMD_LATTICE, LATTICE_END));
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
