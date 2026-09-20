/**
 * Storage backend contract. The catalog is one JSON document; file bodies are
 * opaque blobs keyed by node id. Backends know nothing about the tree.
 */
export interface FSBackend {
  init(): Promise<void>;
  readCatalog(): Promise<string | null>;
  writeCatalog(json: string): Promise<void>;
  readBlob(id: string): Promise<Uint8Array | null>;
  writeBlob(id: string, bytes: Uint8Array): Promise<void>;
  deleteBlob(id: string): Promise<void>;
  /** Drop the catalog and every blob — a formatted disk. */
  clear(): Promise<void>;
}

/**
 * Backend that keeps everything in memory. Used by tests and anywhere OPFS is
 * unavailable (SSR, previews, private browsing contexts that deny storage).
 */
export class InMemoryBackend implements FSBackend {
  private catalog: string | null = null;
  private blobs = new Map<string, Uint8Array>();

  constructor(seedCatalog?: string) {
    this.catalog = seedCatalog ?? null;
  }

  async init(): Promise<void> {}

  async readCatalog(): Promise<string | null> {
    return this.catalog;
  }

  async writeCatalog(json: string): Promise<void> {
    this.catalog = json;
  }

  async readBlob(id: string): Promise<Uint8Array | null> {
    const b = this.blobs.get(id);
    return b ? b.slice() : null;
  }

  async writeBlob(id: string, bytes: Uint8Array): Promise<void> {
    this.blobs.set(id, bytes.slice());
  }

  async deleteBlob(id: string): Promise<void> {
    this.blobs.delete(id);
  }

  async clear(): Promise<void> {
    this.catalog = null;
    this.blobs.clear();
  }

  /** Test helper: ids of every stored blob. */
  blobIds(): string[] {
    return [...this.blobs.keys()];
  }
}
