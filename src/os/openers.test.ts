import { afterEach, describe, expect, it } from "vitest";
import { FileSystem, IMAGE_TYPES, InMemoryBackend, MIME, ROOT_ID } from "@mockintosh/fs";
import { alternateFileTypes, type FileTypeClaim } from "@mockintosh/sdk";
import { registerApp, unregisterApp } from "./apps";
import { appForFileType, openersForFileType, resolveOpenAction } from "./openers";

const STUBS = ["dither", "trace", "preview"];

function stubApp(id: string, fileTypes: (string | FileTypeClaim)[]): void {
  registerApp({
    id,
    title: id[0].toUpperCase() + id.slice(1),
    icon: "icon/computer",
    defaultSize: { width: 80, height: 80 },
    fileTypes,
    Component: () => null,
  });
}

/** The bundled picture apps, editors registered before the viewer on purpose. */
function stubPictureApps(): void {
  stubApp("dither", alternateFileTypes([MIME.sprite, ...IMAGE_TYPES]));
  stubApp("trace", alternateFileTypes([MIME.sprite, ...IMAGE_TYPES]));
  stubApp("preview", [MIME.sprite, ...IMAGE_TYPES]);
}

afterEach(() => {
  for (const id of STUBS) unregisterApp(id);
});

describe("openers", () => {
  it("prefers a default claim over earlier-registered alternates", () => {
    stubPictureApps();
    expect(appForFileType("image/png")).toBe("preview");
    expect(appForFileType(MIME.sprite)).toBe("preview");
  });

  it("lists every opener, the default first", () => {
    stubPictureApps();
    expect(openersForFileType(MIME.sprite)).toEqual([
      { appId: "preview", title: "Preview", rank: "default" },
      { appId: "dither", title: "Dither", rank: "alternate" },
      { appId: "trace", title: "Trace", rank: "alternate" },
    ]);
    expect(openersForFileType("text/plain")).toEqual([]);
  });

  it("falls back to an alternate when nothing claims the type as default", () => {
    stubApp("dither", alternateFileTypes(IMAGE_TYPES));
    expect(appForFileType("image/png")).toBe("dither");
  });

  it("opens a PNG in Preview with FileDocumentProps", async () => {
    stubPictureApps();
    const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
    const vol = fs.mkdir(ROOT_ID, "HD", { role: "volume" });
    const file = await fs.writeFile(vol.id, "face.png", new Uint8Array([1, 2]), { type: "image/png" });
    await expect(resolveOpenAction(fs, file.id)).resolves.toEqual({
      kind: "launch",
      appId: "preview",
      props: { fileId: file.id, title: "face.png" },
    });
  });

  it("opens a 1-bit sprite save in Preview", async () => {
    stubPictureApps();
    const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
    const vol = fs.mkdir(ROOT_ID, "HD", { role: "volume" });
    const file = await fs.writeJSON(vol.id, "Surface Plot", { width: 1, height: 1, data: "" }, {
      type: MIME.sprite,
    });
    await expect(resolveOpenAction(fs, file.id)).resolves.toEqual({
      kind: "launch",
      appId: "preview",
      props: { fileId: file.id, title: "Surface Plot" },
    });
  });
});
