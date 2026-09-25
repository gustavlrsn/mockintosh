import { describe, expect, it } from "vitest";
import { FileSystem, InMemoryBackend } from "@mockintosh/fs";
import { bootstrapFileSystem } from "./fsBootstrap";
import {
  importHostFile,
  isImportableImage,
  resolveImportTarget,
  uniqueChildName,
} from "./hostImport";
import type { OSWindow } from "./state";

async function bootedFS() {
  const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
  await bootstrapFileSystem(fs);
  return fs;
}

function folderWindow(directoryId: string): OSWindow {
  return {
    id: "w1",
    appId: "finder",
    title: "Folder",
    x: 40,
    y: 40,
    width: 200,
    height: 120,
    kind: "finder-folder",
    props: { directoryId },
    scrollY: 0,
    scrollX: 0,
    contentHeight: 120,
    contentWidth: 200,
    scrollable: true,
    resizable: true,
  };
}

describe("hostImport", () => {
  it("uniqueChildName adds a numeric suffix before the extension", async () => {
    const fs = await bootedFS();
    const desktop = fs.locate("desktop")!;
    await fs.writeFile(desktop.id, "face.png", new Uint8Array([1]));
    expect(uniqueChildName(fs, desktop.id, "face.png")).toBe("face 2.png");
    await fs.writeFile(desktop.id, "face 2.png", new Uint8Array([1]));
    expect(uniqueChildName(fs, desktop.id, "face.png")).toBe("face 3.png");
  });

  it("isImportableImage accepts host MIME or a known extension", () => {
    expect(isImportableImage({ name: "a", type: "image/png", bytes: new Uint8Array() })).toBe(true);
    expect(isImportableImage({ name: "shot.JPEG", type: "", bytes: new Uint8Array() })).toBe(true);
    expect(isImportableImage({ name: "notes.txt", type: "text/plain", bytes: new Uint8Array() })).toBe(false);
  });

  it("writes the image on the desktop with a camera icon", async () => {
    const fs = await bootedFS();
    const desktop = fs.locate("desktop")!;
    const file = await importHostFile(
      fs,
      desktop.id,
      { name: "portrait.png", type: "image/png", bytes: new Uint8Array([9, 8, 7]) },
      { x: 12, y: 24 },
    );
    expect(file.type).toBe("image/png");
    expect(file.size).toBe(3);
    expect(fs.attributes(file.id)).toMatchObject({
      icon: "icon/camera",
      position: { x: 12, y: 24 },
    });
    expect(await fs.readBytes(file.id)).toEqual(new Uint8Array([9, 8, 7]));
  });

  it("resolveImportTarget prefers a Finder folder under the pointer", async () => {
    const fs = await bootedFS();
    const apps = fs.locate("applications")!;
    const target = resolveImportTarget(fs, [folderWindow(apps.id)], 80, 80, 20);
    expect(target?.parentId).toBe(apps.id);
    expect(target?.openIn).toBeUndefined();
  });

  it("resolveImportTarget opens Dither when the drop hits its window", async () => {
    const fs = await bootedFS();
    const desktop = fs.locate("desktop")!;
    const dither: OSWindow = {
      id: "d1",
      appId: "dither",
      title: "Dither",
      x: 10,
      y: 30,
      width: 200,
      height: 160,
      kind: "document",
      props: {},
      scrollY: 0,
      scrollX: 0,
      contentHeight: 160,
      contentWidth: 200,
      scrollable: false,
      resizable: true,
    };
    const target = resolveImportTarget(fs, [dither], 40, 80, 20);
    expect(target?.parentId).toBe(desktop.id);
    expect(target?.openIn).toBe("dither");
  });

  it("resolveImportTarget opens Trace when the drop hits its window", async () => {
    const fs = await bootedFS();
    const desktop = fs.locate("desktop")!;
    const trace: OSWindow = {
      id: "t1",
      appId: "trace",
      title: "Trace",
      x: 10,
      y: 30,
      width: 200,
      height: 160,
      kind: "document",
      props: {},
      scrollY: 0,
      scrollX: 0,
      contentHeight: 160,
      contentWidth: 200,
      scrollable: false,
      resizable: true,
    };
    const target = resolveImportTarget(fs, [trace], 40, 80, 20);
    expect(target?.parentId).toBe(desktop.id);
    expect(target?.openIn).toBe("trace");
  });
});
