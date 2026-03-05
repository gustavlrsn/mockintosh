const FS_DIR = "mockintosh-fs";
const FILES_DIR = "files";
const META_FILE = "meta.json";

export class OPFSBackend {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private filesHandle: FileSystemDirectoryHandle | null = null;

  async init(): Promise<void> {
    const storageRoot = await navigator.storage.getDirectory();
    this.rootHandle = await storageRoot.getDirectoryHandle(FS_DIR, {
      create: true,
    });
    this.filesHandle = await this.rootHandle.getDirectoryHandle(FILES_DIR, {
      create: true,
    });
  }

  async readMeta(): Promise<string | null> {
    try {
      const handle = await this.rootHandle!.getFileHandle(META_FILE);
      const file = await handle.getFile();
      return await file.text();
    } catch {
      return null;
    }
  }

  async writeMeta(json: string): Promise<void> {
    const handle = await this.rootHandle!.getFileHandle(META_FILE, {
      create: true,
    });
    const writable = await (handle as any).createWritable();
    await writable.write(json);
    await writable.close();
  }

  async readFile(id: string): Promise<string | null> {
    try {
      const handle = await this.filesHandle!.getFileHandle(id);
      const file = await handle.getFile();
      return await file.text();
    } catch {
      return null;
    }
  }

  async writeFile(id: string, content: string): Promise<void> {
    const handle = await this.filesHandle!.getFileHandle(id, { create: true });
    const writable = await (handle as any).createWritable();
    await writable.write(content);
    await writable.close();
  }

  async deleteFile(id: string): Promise<void> {
    try {
      await this.filesHandle!.removeEntry(id);
    } catch {
      // file may not exist
    }
  }

  async hasMetaFile(): Promise<boolean> {
    try {
      await this.rootHandle!.getFileHandle(META_FILE);
      return true;
    } catch {
      return false;
    }
  }
}
