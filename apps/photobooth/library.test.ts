import { describe, expect, it } from "vitest";
import { FileSystem, InMemoryBackend, ROOT_ID } from "@mockintosh/fs";
import { createAppStorage } from "../../src/os/appStorage";
import {
  ensurePhotoLibrary,
  findPhotoLibrary,
  listStoredPhotos,
  PHOTO_LIBRARY_NAME,
  storePhoto,
} from "./library";

const APP_ID = "photobooth";

async function openDisk() {
  const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
  const volume = fs.mkdir(ROOT_ID, "HD", { role: "volume" });
  const desktop = fs.mkdir(volume.id, "Desktop Folder", { role: "desktop" });
  const pictures = fs.mkdir(volume.id, "Pictures", { role: "pictures" });
  const system = fs.mkdir(volume.id, "System Folder", { role: "system" });
  fs.mkdir(system.id, "Preferences", { role: "preferences" });
  return { fs, desktop, pictures, storage: createAppStorage(fs, APP_ID) };
}

describe("photo library", () => {
  it("keeps pictures in Pictures/Photo Booth across a fresh lookup", async () => {
    const { fs, desktop, pictures, storage } = await openDisk();
    const folder = await ensurePhotoLibrary(fs, storage);
    expect(folder.name).toBe(PHOTO_LIBRARY_NAME);
    expect(fs.child(pictures.id, PHOTO_LIBRARY_NAME)?.id).toBe(folder.id);
    expect(fs.child(desktop.id, PHOTO_LIBRARY_NAME)).toBeUndefined();

    const first = await storePhoto(fs, folder.id, {
      pixels: new Uint8Array([1, 0, 0, 1]),
      width: 2,
      height: 2,
      timestamp: Date.parse("2026-09-24T12:00:00"),
    });
    const second = await storePhoto(fs, folder.id, {
      pixels: new Uint8Array([0, 1]),
      width: 2,
      height: 1,
      timestamp: Date.parse("2026-09-24T12:00:05"),
    });

    const again = await findPhotoLibrary(fs, createAppStorage(fs, APP_ID));
    expect(again?.id).toBe(folder.id);
    const photos = await listStoredPhotos(fs, again!.id);
    expect(photos.map((p) => p.fileId)).toEqual([first.fileId, second.fileId]);
    expect([...photos[0].pixels]).toEqual([1, 0, 0, 1]);
    expect(photos[0].width).toBe(2);
    expect(photos[0].height).toBe(2);
    expect([...photos[1].pixels]).toEqual([0, 1]);
  });

  it("still finds the folder after it is renamed", async () => {
    const { fs, storage } = await openDisk();
    const folder = await ensurePhotoLibrary(fs, storage);
    fs.rename(folder.id, "Snaps");
    const found = await findPhotoLibrary(fs, createAppStorage(fs, APP_ID));
    expect(found?.id).toBe(folder.id);
    expect(found?.name).toBe("Snaps");
  });

  it("gives two pictures taken in the same second different names", async () => {
    const { fs, storage } = await openDisk();
    const folder = await ensurePhotoLibrary(fs, storage);
    const timestamp = Date.parse("2026-09-24T12:00:01");
    await storePhoto(fs, folder.id, { pixels: new Uint8Array([1]), width: 1, height: 1, timestamp });
    await storePhoto(fs, folder.id, { pixels: new Uint8Array([0]), width: 1, height: 1, timestamp });
    const names = fs.children(folder.id).map((n) => n.name).sort();
    expect(names).toEqual(["Photo 2026-09-24 12.00.01", "Photo 2026-09-24 12.00.01 2"]);
  });

  it("moves a desktop Photo Booth Pictures folder into Pictures", async () => {
    const { fs, desktop, pictures, storage } = await openDisk();
    const legacy = fs.mkdir(desktop.id, "Photo Booth Pictures");
    await fs.writeFile(legacy.id, "note", "kept");
    const folder = await ensurePhotoLibrary(fs, storage);
    expect(folder.id).toBe(legacy.id);
    expect(fs.child(pictures.id, "Photo Booth")?.id).toBe(legacy.id);
    expect(fs.child(desktop.id, "Photo Booth Pictures")).toBeUndefined();
    expect(await fs.readText(fs.child(folder.id, "note")!.id)).toBe("kept");
  });

  it("drops a picture when its file is removed", async () => {
    const { fs, storage } = await openDisk();
    const folder = await ensurePhotoLibrary(fs, storage);
    const stored = await storePhoto(fs, folder.id, {
      pixels: new Uint8Array([1, 1]),
      width: 2,
      height: 1,
      timestamp: Date.parse("2026-09-24T12:01:00"),
    });
    await fs.remove(stored.fileId);
    expect(await listStoredPhotos(fs, folder.id)).toEqual([]);
  });
});
