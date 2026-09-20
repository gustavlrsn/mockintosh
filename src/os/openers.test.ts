import { afterEach, describe, expect, it } from "vitest";
import { FileSystem, IMAGE_TYPES, InMemoryBackend, MIME, ROOT_ID } from "@mockintosh/fs";
import { registerApp, unregisterApp } from "./apps";
import { appForFileType, resolveOpenAction } from "./openers";

function stubApp(id: string, fileTypes: string[]): void {
  registerApp({
    id,
    title: id,
    icon: "icon/computer",
    defaultSize: { width: 80, height: 80 },
    fileTypes,
    Component: () => null,
  });
}

afterEach(() => {
  unregisterApp("dither");
  unregisterApp("picture");
});

describe("openers", () => {
  it("gives a type to the first registered app that lists it", () => {
    stubApp("dither", [MIME.sprite, ...IMAGE_TYPES]);
    stubApp("picture", [MIME.sprite, ...IMAGE_TYPES]);
    expect(appForFileType("image/png")).toBe("dither");
    expect(appForFileType(MIME.sprite)).toBe("dither");
  });

  it("opens a PNG in Dither with FileDocumentProps", async () => {
    stubApp("dither", [MIME.sprite, ...IMAGE_TYPES]);
    stubApp("picture", [MIME.sprite, ...IMAGE_TYPES]);
    const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
    const vol = fs.mkdir(ROOT_ID, "HD", { role: "volume" });
    const file = await fs.writeFile(vol.id, "face.png", new Uint8Array([1, 2]), { type: "image/png" });
    await expect(resolveOpenAction(fs, file.id)).resolves.toEqual({
      kind: "launch",
      appId: "dither",
      props: { fileId: file.id, title: "face.png" },
    });
  });

  it("opens a 1-bit sprite save in Dither", async () => {
    stubApp("dither", [MIME.sprite, ...IMAGE_TYPES]);
    stubApp("picture", [MIME.sprite, ...IMAGE_TYPES]);
    const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
    const vol = fs.mkdir(ROOT_ID, "HD", { role: "volume" });
    const file = await fs.writeJSON(vol.id, "circle 1-bit", { width: 1, height: 1, data: "" }, {
      type: MIME.sprite,
    });
    await expect(resolveOpenAction(fs, file.id)).resolves.toEqual({
      kind: "launch",
      appId: "dither",
      props: { fileId: file.id, title: "circle 1-bit" },
    });
  });
});
