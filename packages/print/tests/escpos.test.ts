import { describe, it, expect } from "vitest";
import { InitGraf, PaintRect, globals, type BitMap } from "@mockintosh/quickdraw";
import { bitMapFromPixels, getBit, makeRect, newBitMap } from "@mockintosh/quickdraw/bits";
import { EscPosEncoder, RASTER_BAND_ROWS, packRows, createPrintPage, drawOnPage } from "../src";

function bitmapFromRows(rows: string[]): BitMap {
  const width = rows[0].length;
  const data = new Uint8Array(width * rows.length);
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x++) data[y * width + x] = row[x] === "#" ? 1 : 0;
  });
  return bitMapFromPixels(data, width, rows.length);
}

describe("EscPosEncoder", () => {
  it("initialize emits ESC @", () => {
    expect([...new EscPosEncoder().initialize().encode()]).toEqual([0x1b, 0x40]);
  });

  it("feed splits long advances into 255-dot steps", () => {
    expect([...new EscPosEncoder().feed(600).encode()]).toEqual([
      0x1b, 0x4a, 255, 0x1b, 0x4a, 255, 0x1b, 0x4a, 90,
    ]);
    expect(new EscPosEncoder().feed(0).encode().length).toBe(0);
  });

  it("cut defaults to a full cut", () => {
    expect([...new EscPosEncoder().cut().encode()]).toEqual([0x1d, 0x56, 0x00]);
    expect([...new EscPosEncoder().cut({ mode: "partial" }).encode()]).toEqual([0x1d, 0x56, 0x01]);
  });

  it("cut sends the configured command", () => {
    const feedCut = new EscPosEncoder({ cutCommand: "gs-v-feed" });
    expect([...feedCut.cut().encode()]).toEqual([0x1d, 0x56, 0x41, 0x00]);
    expect([...new EscPosEncoder({ cutCommand: "esc-i" }).cut().encode()]).toEqual([0x1b, 0x69]);
    expect([...new EscPosEncoder({ cutCommand: "esc-i" }).cut({ mode: "partial" }).encode()]).toEqual([0x1b, 0x6d]);
  });

  it("raster packs pixels MSB-first, 1 = black, rows padded to bytes", () => {
    const bits = bitmapFromRows([
      "#........#",   // 10 px → 2 bytes/row; x=9 is bit 6 of the second byte
      "##########",
    ]);
    const bytes = [...new EscPosEncoder().raster(bits).encode()];
    expect(bytes).toEqual([
      0x1d, 0x76, 0x30, 0x00, // GS v 0, normal
      2, 0,                   // bytes per row
      2, 0,                   // rows
      0b10000000, 0b01000000,
      0b11111111, 0b11000000,
    ]);
  });

  it("raster bands tall images", () => {
    const height = RASTER_BAND_ROWS * 2 + 5;
    const out = new EscPosEncoder().raster(newBitMap(8, height)).encode();
    // 3 bands × (8-byte header + rows × 1 byte)
    expect(out.length).toBe(3 * 8 + height);
    // Last band header advertises the 5 remaining rows.
    const lastHeader = 2 * (8 + RASTER_BAND_ROWS);
    expect(out[lastHeader + 6]).toBe(5);
    expect(out[lastHeader + 7]).toBe(0);
  });

  it("sends a whole page as one raster command when the band is tall enough", () => {
    const out = new EscPosEncoder({ rasterBandRows: 2048 }).raster(newBitMap(8, 792)).encode();
    expect(out.length).toBe(8 + 792);
    // yL yH = 792 = 0x0318
    expect([out[6], out[7]]).toEqual([0x18, 0x03]);
  });

  it("prepends blank lead-in rows inside the raster command", () => {
    const image = newBitMap(8, 2);
    image.baseAddr.fill(0xff);
    const out = new EscPosEncoder({ rasterLeadInRows: 3 }).raster(image).encode();
    expect(out[6]).toBe(5);
    expect([...out.subarray(8)]).toEqual([0, 0, 0, 0xff, 0xff]);
  });

  it("lead-in spanning a band boundary still yields every image row once", () => {
    const image = newBitMap(8, 3);
    image.baseAddr.set([1, 0, 2, 0, 3, 0]);
    const out = new EscPosEncoder({ rasterLeadInRows: 3, rasterBandRows: 2 }).raster(image).encode();
    // Bands of 2, 2, 2 rows: [0,0] [0,1] [2,3]
    expect([...out.subarray(8, 10), ...out.subarray(18, 20), ...out.subarray(28, 30)]).toEqual([0, 0, 0, 1, 2, 3]);
  });

  it("begin() sends the tuning after ESC @", () => {
    const bytes = (tuning: ConstructorParameters<typeof EscPosEncoder>[0]) => [...new EscPosEncoder(tuning).begin().encode()];
    expect(bytes({ tuning: { command: "gs-k", speed: 1, density: -2 } })).toEqual([
      0x1b, 0x40,
      0x1d, 0x28, 0x4b, 0x02, 0x00, 0x31, 0xfe,
      0x1d, 0x28, 0x4b, 0x02, 0x00, 0x32, 0x01,
    ]);
    expect(bytes({ tuning: { command: "dc2-density", density: 15, breakTime: 2 } })).toEqual([0x1b, 0x40, 0x12, 0x23, 0x4f]);
    expect(bytes({ tuning: { command: "esc-7", heatingDots: 3, heatingTime: 160, heatingInterval: 20 } })).toEqual([
      0x1b, 0x40, 0x1b, 0x37, 3, 160, 20,
    ]);
  });

  it("packRows drops the bitmap's row padding", () => {
    // 2 pixels wide, but QuickDraw pads rows to a 16-bit word (rowBytes = 2).
    const bits = bitMapFromPixels(Uint8Array.from([1, 0, 0, 1]), 2, 2);
    expect(bits.rowBytes).toBe(2);
    expect([...packRows(bits, 0, 2, 1)]).toEqual([0b10000000, 0b01000000]);
  });
});

describe("createPrintPage", () => {
  it("is a white QuickDraw port the size of the paper that drawing lands on", () => {
    InitGraf(newBitMap(16, 16));
    const screen = globals.screenBits;

    const page = createPrintPage(24, 4);
    expect(page.bits.baseAddr.every((p) => p === 0)).toBe(true);

    drawOnPage(page, () => PaintRect(makeRect(1, 0, 3, 24)));

    const row = (y: number) => Array.from({ length: 24 }, (_, x) => getBit(page.bits, x, y));
    expect(row(0).every((p) => p === 0)).toBe(true);
    expect(row(1).every((p) => p === 1)).toBe(true);
    expect(row(2).every((p) => p === 1)).toBe(true);
    expect(row(3).every((p) => p === 0)).toBe(true);
    // Nothing leaked onto the screen.
    expect(screen.baseAddr.every((p) => p === 0)).toBe(true);
  });
});
