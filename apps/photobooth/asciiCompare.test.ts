import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { asciiToBits, type ImageFrame } from "@mockintosh/sdk";
import { applyAdjust, applyContrast } from "./adjust";
import { sampledFrame } from "./crop";

const COMPARE_SIZE = 200;

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

async function loadPng(name: string): Promise<ImageFrame> {
  const buf = readFileSync(join(fixtures, name));
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, rgba: new Uint8ClampedArray(data) };
}

function thresholdBits(frame: ImageFrame): Uint8Array {
  const out = new Uint8Array(frame.width * frame.height);
  const { rgba } = frame;
  for (let i = 0; i < out.length; i++) {
    const p = i * 4;
    const y = rgba[p] * 0.299 + rgba[p + 1] * 0.587 + rgba[p + 2] * 0.114;
    out[i] = y < 128 ? 1 : 0;
  }
  return out;
}

describe("applyContrast", () => {
  it("leaves pixels unchanged at 1×", () => {
    const src = {
      width: 1,
      height: 1,
      rgba: new Uint8ClampedArray([64, 128, 200, 255]),
    };
    expect([...applyContrast(src, 1).rgba]).toEqual([64, 128, 200, 255]);
  });

  it("pushes midtones away from 128 when raised", () => {
    const src = {
      width: 1,
      height: 1,
      rgba: new Uint8ClampedArray([64, 128, 192, 255]),
    };
    expect([...applyContrast(src, 2).rgba]).toEqual([0, 128, 255, 255]);
  });

  it("adds brightness after contrast", () => {
    const src = {
      width: 1,
      height: 1,
      rgba: new Uint8ClampedArray([128, 128, 128, 255]),
    };
    expect([...applyAdjust(src, { contrast: 1, brightness: 20 }).rgba]).toEqual([148, 148, 148, 255]);
  });
});

describe("fstark 200×200 reference", () => {
  it("keeps both fixtures at the compare size", async () => {
    const src = await loadPng("fstark-original.png");
    const exp = await loadPng("fstark-expected.png");
    expect(src).toMatchObject({ width: COMPARE_SIZE, height: COMPARE_SIZE });
    expect(exp).toMatchObject({ width: COMPARE_SIZE, height: COMPARE_SIZE });
  });

  it("runs the ASCII ditherer at 200×200 so we can score against the expected bits", async () => {
    const src = await loadPng("fstark-original.png");
    const exp = await loadPng("fstark-expected.png");
    const expected = thresholdBits(exp);
    for (const match of ["luma", "blend", "mass"] as const) {
      const ours = asciiToBits(src, { match });
      expect(ours.length).toBe(COMPARE_SIZE * COMPARE_SIZE);
      let differ = 0;
      for (let i = 0; i < ours.length; i++) if (ours[i] !== expected[i]) differ++;
      expect(differ, match).toBeGreaterThan(0);
      expect(differ, match).toBeLessThan(ours.length);
    }
  });

  it("identity crop matches a direct dither; a pan changes the bits", async () => {
    const src = await loadPng("fstark-original.png");
    const direct = asciiToBits(src);
    const identity = asciiToBits(sampledFrame(src, COMPARE_SIZE, { scale: 1, panX: 0, panY: 0 }));
    expect([...identity]).toEqual([...direct]);
    const panned = asciiToBits(sampledFrame(src, COMPARE_SIZE, { scale: 1, panX: 8, panY: 0 }));
    let differ = 0;
    for (let i = 0; i < direct.length; i++) if (panned[i] !== direct[i]) differ++;
    expect(differ).toBeGreaterThan(direct.length * 0.05);
  });
});
