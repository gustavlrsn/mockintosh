import type { FSBackend } from "@mockintosh/fs";

const FS_DIR = "mockintosh-fs";
const FILES_DIR = "files";
const CATALOG_FILE = "meta.json";

/** Whether OPFS is available in this context (secure origin + storage access). */
export function isOPFSAvailable(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.storage?.getDirectory === "function"
  );
}

/**
 * Origin Private File System backend. Layout on disk is unchanged from the
 * original `FileManager` so existing user data keeps loading:
 *
 *   mockintosh-fs/meta.json     catalog
 *   mockintosh-fs/files/<id>    one blob per file node
 */
export class OPFSBackend implements FSBackend {
  private root: FileSystemDirectoryHandle | null = null;
  private files: FileSystemDirectoryHandle | null = null;

  async init(): Promise<void> {
    const storageRoot = await navigator.storage.getDirectory();
    this.root = await storageRoot.getDirectoryHandle(FS_DIR, { create: true });
    this.files = await this.root.getDirectoryHandle(FILES_DIR, { create: true });
  }

  private get rootHandle(): FileSystemDirectoryHandle {
    if (!this.root) throw new Error("OPFSBackend used before init()");
    return this.root;
  }

  private get filesHandle(): FileSystemDirectoryHandle {
    if (!this.files) throw new Error("OPFSBackend used before init()");
    return this.files;
  }

  async readCatalog(): Promise<string | null> {
    try {
      const handle = await this.rootHandle.getFileHandle(CATALOG_FILE);
      return await (await handle.getFile()).text();
    } catch {
      return null;
    }
  }

  async writeCatalog(json: string): Promise<void> {
    await writeWhole(this.rootHandle, CATALOG_FILE, json);
  }

  async readBlob(id: string): Promise<Uint8Array | null> {
    try {
      const handle = await this.filesHandle.getFileHandle(id);
      return new Uint8Array(await (await handle.getFile()).arrayBuffer());
    } catch {
      return null;
    }
  }

  async writeBlob(id: string, bytes: Uint8Array): Promise<void> {
    await writeWhole(this.filesHandle, id, bytes);
  }

  async deleteBlob(id: string): Promise<void> {
    try {
      await this.filesHandle.removeEntry(id);
    } catch {
      // Already gone — deleting is idempotent.
    }
  }
}

async function writeWhole(
  dir: FileSystemDirectoryHandle,
  name: string,
  data: string | Uint8Array
): Promise<void> {
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(data as FileSystemWriteChunkType);
  await writable.close();
}
