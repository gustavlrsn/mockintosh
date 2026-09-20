import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { encodePng1bit } from "../src/png";

describe("encodePng1bit", () => {
  it("writes a PNG signature and IHDR for the given size", () => {
    const png = encodePng1bit(new Uint8Array([0]), 1, 1);
    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(png[12]).toBe(0x49); // I
    expect(png[13]).toBe(0x48); // H
    expect(png[16]).toBe(0);
    expect(png[19]).toBe(1); // width
    expect(png[23]).toBe(1); // height
    expect(png[24]).toBe(1); // bit depth
    expect(png[25]).toBe(0); // greyscale
  });

  it("round-trips white=0 / black=1 through a real decoder", async () => {
    const src = new Uint8Array([
      0, 1, 1, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 1, 0, 0, 1,
    ]);
    const png = encodePng1bit(src, 8, 2);
    const { data, info } = await sharp(Buffer.from(png)).raw().toBuffer({ resolveWithObject: true });
    expect(info.width).toBe(8);
    expect(info.height).toBe(2);
    const luma = [...data].filter((_, i) => i % info.channels === 0);
    expect(luma.map((v) => (v < 128 ? 1 : 0))).toEqual([...src]);
  });

  it("rejects empty sizes", () => {
    expect(() => encodePng1bit(new Uint8Array(), 0, 1)).toThrow(/1×1/);
  });
});
