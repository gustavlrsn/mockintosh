import { describe, expect, it, vi } from "vitest";
import { FileSystem, InMemoryBackend, MIME, ROOT_ID } from "@mockintosh/fs";
import {
  readImageFile,
  spriteToImageFrame,
  writeSpriteFile,
  type ImageService,
} from "@mockintosh/sdk";

async function openDesktop() {
  const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
  const vol = fs.mkdir(ROOT_ID, "HD", { role: "volume" });
  const desktop = fs.mkdir(vol.id, "Desktop", { role: "desktop" });
  return { fs, desktop };
}

function throwingImages(): ImageService {
  return {
    decode: vi.fn(async () => {
      throw new Error("decode should not run for sprite files");
    }),
  };
}

describe("readImageFile", () => {
  it("loads a Dither Save 1-bit sprite without calling images.decode", async () => {
    const { fs, desktop } = await openDesktop();
    const pixels = new Uint8Array([0, 1, 1, 0]);
    const file = await writeSpriteFile(fs, desktop.id, "circle 1-bit", {
      width: 2,
      height: 2,
      data: pixels,
    });
    const images = throwingImages();

    const frame = await readImageFile(fs, images, file.id);

    expect(images.decode).not.toHaveBeenCalled();
    expect(frame.width).toBe(2);
    expect(frame.height).toBe(2);
    expect([...frame.rgba]).toEqual([
      255, 255, 255, 255,
      0, 0, 0, 255,
      0, 0, 0, 255,
      255, 255, 255, 255,
    ]);
  });

  it("decodes browser stills through ImageService", async () => {
    const { fs, desktop } = await openDesktop();
    const file = await fs.writeFile(desktop.id, "face.png", new Uint8Array([1, 2, 3]), {
      type: "image/png",
    });
    const images: ImageService = {
      decode: vi.fn(async () => ({
        width: 1,
        height: 1,
        rgba: new Uint8ClampedArray([10, 20, 30, 255]),
      })),
    };

    const frame = await readImageFile(fs, images, file.id, { maxWidth: 800, maxHeight: 800 });

    expect(images.decode).toHaveBeenCalledWith(expect.any(Uint8Array), "image/png", {
      maxWidth: 800,
      maxHeight: 800,
    });
    expect([...frame.rgba]).toEqual([10, 20, 30, 255]);
  });
});

describe("spriteToImageFrame", () => {
  it("maps 1 = black and 0 = white", () => {
    const frame = spriteToImageFrame({
      width: 2,
      height: 1,
      data: new Uint8Array([1, 0]),
    });
    expect([...frame.rgba.slice(0, 4)]).toEqual([0, 0, 0, 255]);
    expect([...frame.rgba.slice(4)]).toEqual([255, 255, 255, 255]);
  });
});
