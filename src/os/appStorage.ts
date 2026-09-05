/**
 * Per-app key/value storage on top of the file system.
 *
 * Each app owns `System Folder/Preferences/<appId>/`; a key is a file in that
 * folder. Nothing is hidden from the user — the Finder shows exactly what an
 * app has stored, and trashing the folder resets the app.
 */
import { inferMimeType, MIME, type FileSystem, type FSDirectory } from "@mockintosh/fs";
import type { AppStorage } from "@mockintosh/sdk";

/** The app's storage folder, created on first use. */
export function appStorageFolder(fs: FileSystem, appId: string): FSDirectory {
  const prefs = fs.locate("preferences");
  if (!prefs) throw new Error("File system has no Preferences folder");
  const existing = fs.child(prefs.id, appId);
  if (existing?.kind === "directory") return existing;
  return fs.mkdir(prefs.id, appId);
}

export function createAppStorage(fs: FileSystem, appId: string): AppStorage {
  return {
    async read(key) {
      const prefs = fs.locate("preferences");
      const folder = prefs ? fs.child(prefs.id, appId) : undefined;
      const file = folder ? fs.child(folder.id, key) : undefined;
      return file?.kind === "file" ? fs.readText(file.id) : null;
    },
    async write(key, value) {
      const folder = appStorageFolder(fs, appId);
      const inferred = inferMimeType(key);
      await fs.writeFile(folder.id, key, value, {
        type: inferred === MIME.binary ? MIME.text : inferred,
      });
    },
    async remove(key) {
      const prefs = fs.locate("preferences");
      const folder = prefs ? fs.child(prefs.id, appId) : undefined;
      const file = folder ? fs.child(folder.id, key) : undefined;
      if (file) await fs.remove(file.id);
    },
    async list() {
      const prefs = fs.locate("preferences");
      const folder = prefs ? fs.child(prefs.id, appId) : undefined;
      return folder ? fs.children(folder.id).filter((n) => n.kind === "file").map((n) => n.name) : [];
    },
  };
}
