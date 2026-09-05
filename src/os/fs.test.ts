import { describe, it, expect } from "vitest";
import { FileSystem, InMemoryBackend, MIME } from "@mockintosh/fs";
import { bootstrapFileSystem, STARTUP_VOLUME_NAME } from "./fsBootstrap";
import { createAppStorage } from "./appStorage";

async function bootedFS() {
  const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
  await bootstrapFileSystem(fs);
  return fs;
}

describe("bootstrapFileSystem", () => {
  it("creates the startup volume with every role folder and the desktop shortcuts", async () => {
    const fs = await bootedFS();
    const hd = fs.locate("volume")!;
    expect(hd.name).toBe(STARTUP_VOLUME_NAME);
    for (const role of ["desktop", "trash", "applications", "system", "preferences"] as const) {
      expect(fs.locate(role, hd.id), role).toBeDefined();
    }
    expect(fs.pathOf(fs.locate("preferences")!.id)).toBe(`/${STARTUP_VOLUME_NAME}/System Folder/Preferences`);
    const shortcuts = fs.children(fs.locate("desktop")!.id);
    expect(shortcuts.length).toBeGreaterThan(0);
    expect(shortcuts.every((n) => n.kind === "file" && n.type === MIME.appShortcut)).toBe(true);
  });

  it("repairs missing role folders without touching user renames", async () => {
    const fs = await bootedFS();
    const trash = fs.locate("trash")!;
    fs.rename(trash.id, "Bin");
    await fs.remove(fs.locate("system")!.id);
    await bootstrapFileSystem(fs);
    expect(fs.locate("trash")?.name).toBe("Bin");
    expect(fs.locate("system")).toBeDefined();
    expect(fs.locate("preferences")).toBeDefined();
  });
});

describe("createAppStorage", () => {
  it("keeps each app's keys in its own Preferences folder", async () => {
    const fs = await bootedFS();
    const a = createAppStorage(fs, "alpha");
    const b = createAppStorage(fs, "beta");

    expect(await a.read("settings.json")).toBeNull();
    await a.write("settings.json", '{"x":1}');
    await a.write("notes", "hello");
    await b.write("settings.json", '{"x":2}');

    expect(await a.read("settings.json")).toBe('{"x":1}');
    expect(await b.read("settings.json")).toBe('{"x":2}');
    expect((await a.list()).sort()).toEqual(["notes", "settings.json"]);

    const prefs = fs.locate("preferences")!;
    expect(fs.children(prefs.id).map((n) => n.name)).toEqual(["alpha", "beta"]);
    const folder = fs.child(prefs.id, "alpha")!;
    expect(fs.child(folder.id, "settings.json")).toMatchObject({ kind: "file", type: MIME.json });
    expect(fs.child(folder.id, "notes")).toMatchObject({ kind: "file", type: MIME.text });

    await a.remove("notes");
    expect(await a.list()).toEqual(["settings.json"]);
    await a.remove("missing"); // no-op
  });
});
