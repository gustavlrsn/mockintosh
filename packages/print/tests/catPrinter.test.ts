import { describe, it, expect } from "vitest";
import { bitMapFromPixels } from "@mockintosh/quickdraw/bits";
import {
  CatPrinterEncoder,
  PROFILE_CAT_58MM,
  catFrame,
  crc8,
  encoderForProfile,
} from "../src";

describe("cat printer framing", () => {
  it("crc8 matches the published 12000-energy vector", () => {
    expect(crc8([0xe0, 0x2e])).toBe(0x89);
    expect([...catFrame(0xaf, [0xe0, 0x2e])]).toEqual([
      0x51, 0x78, 0xaf, 0x00, 0x02, 0x00, 0xe0, 0x2e, 0x89, 0xff,
    ]);
  });

  it("begin + cut + end is quality, lattice, energy, rows, lattice-end", () => {
    const bytes = new CatPrinterEncoder({ energy: 0x2ee0 }).begin().cut().end();
    expect(bytes[0]).toBe(0x51);
    expect(bytes[2]).toBe(0xa4);
    expect(bytes[bytes.length - 1]).toBe(0xff);
    expect(bytes.includes(0xa6)).toBe(true);
    expect(bytes.includes(0xa1)).toBe(true);
  });

  it("raster emits one 0xA2 frame per row", () => {
    const bits = bitMapFromPixels(Uint8Array.from([1, 0, 0, 1, 1, 1, 0, 0]), 8, 1);
    const out = new CatPrinterEncoder().raster(bits).end();
    const draw = [...out].indexOf(0xa2);
    expect(out[draw]).toBe(0xa2);
    expect(out[draw + 2]).toBe(1);
  });

  it("encoderForProfile picks the cat encoder", () => {
    const enc = encoderForProfile(PROFILE_CAT_58MM);
    expect(enc.begin().end().length).toBeGreaterThan(20);
  });
});
