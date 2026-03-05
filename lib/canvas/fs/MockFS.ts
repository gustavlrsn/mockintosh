import { Sprite } from "../BitCanvas";
import { SpriteRegistry, defineSprite } from "../SpriteRegistry";
import { OPFSBackend } from "./OPFSBackend";

// ---- Types ----

export interface FSNode {
  id: string;
  name: string;
  kind: "file" | "directory";
  parentId: string | null;
  createdAt: number;
  modifiedAt: number;
  icon?: string;
  /** Custom icon position within the parent container (desktop or folder window). */
  position?: { x: number; y: number };
}

export interface FSFile extends FSNode {
  kind: "file";
  fileType: "text" | "image" | "app" | "app-shortcut" | "binary";
  mimeType?: string;
  size: number;
}

export interface FSDirectory extends FSNode {
  kind: "directory";
}

export interface FileSystemMetadata {
  version: number;
  nodes: Record<string, FSNode>;
}

export interface SpriteFileContent {
  width: number;
  height: number;
  data: string;
}

export type FSChangeCallback = () => void;

// ---- Helpers ----

const FILE_TYPE_ICONS: Record<string, string> = {
  text: "icon/file",
  image: "icon/camera",
  app: "icon/appstore-smr-32x32",
  "app-shortcut": "icon/computer",
  binary: "icon/file",
};

export function getIconForNode(node: FSNode): string {
  if (node.icon) return node.icon;
  if (node.kind === "directory") return "icon/folder";
  const f = node as FSFile;
  return FILE_TYPE_ICONS[f.fileType] ?? "icon/file";
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---- MockFS ----

export const ROOT_ID = "__root__";

export class MockFS {
  private meta: FileSystemMetadata = { version: 1, nodes: {} };
  private backend: OPFSBackend;
  private sprites: SpriteRegistry;
  private listeners: FSChangeCallback[] = [];
  private metaDirty = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  /** Monotonically increasing counter, bumped on every mutation. Use in useMemo deps to react to FS changes. */
  version = 0;

  constructor(backend: OPFSBackend, sprites: SpriteRegistry) {
    this.backend = backend;
    this.sprites = sprites;
  }

  async init(): Promise<void> {
    await this.backend.init();
    const raw = await this.backend.readMeta();
    if (raw) {
      try {
        this.meta = JSON.parse(raw);
      } catch {
        this.meta = { version: 1, nodes: {} };
      }
    }
    if (!this.meta.nodes[ROOT_ID]) {
      this.meta.nodes[ROOT_ID] = {
        id: ROOT_ID,
        name: "/",
        kind: "directory",
        parentId: null,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };
      this.schedulePersist();
    }
  }

  // ---- Reads ----

  getNode(id: string): FSNode | undefined {
    return this.meta.nodes[id];
  }

  readDir(dirId: string): FSNode[] {
    const children: FSNode[] = [];
    for (const node of Object.values(this.meta.nodes)) {
      if (node.parentId === dirId) {
        children.push(node);
      }
    }
    children.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return children;
  }

  async readFile(fileId: string): Promise<string | null> {
    const node = this.meta.nodes[fileId];
    if (!node || node.kind !== "file") return null;
    return this.backend.readFile(fileId);
  }

  resolvePath(path: string): FSNode | null {
    const parts = path.split("/").filter(Boolean);
    let currentId = ROOT_ID;
    for (const part of parts) {
      const children = this.readDir(currentId);
      const match = children.find((c) => c.name === part);
      if (!match) return null;
      currentId = match.id;
    }
    return this.meta.nodes[currentId] ?? null;
  }

  findByName(parentId: string, name: string): FSNode | undefined {
    for (const node of Object.values(this.meta.nodes)) {
      if (node.parentId === parentId && node.name === name) return node;
    }
    return undefined;
  }

  // ---- Writes ----

  async writeFile(
    parentId: string,
    name: string,
    content: string,
    fileType: FSFile["fileType"],
    opts?: { icon?: string; mimeType?: string }
  ): Promise<FSFile> {
    const existing = this.findByName(parentId, name);
    const id = existing?.id ?? generateId();
    const now = Date.now();

    const file: FSFile = {
      id,
      name,
      kind: "file",
      parentId,
      createdAt: existing?.createdAt ?? now,
      modifiedAt: now,
      fileType,
      size: content.length,
      icon: opts?.icon,
      mimeType: opts?.mimeType,
    };

    this.meta.nodes[id] = file;
    await this.backend.writeFile(id, content);
    this.schedulePersist();
    this.notify();
    return file;
  }

  async writeImage(
    parentId: string,
    name: string,
    sprite: SpriteFileContent,
    opts?: { icon?: string }
  ): Promise<FSFile> {
    const content = JSON.stringify(sprite);
    const file = await this.writeFile(parentId, name, content, "image", opts);
    const decoded = defineSprite(sprite.width, sprite.height, sprite.data);
    this.sprites.register(`fs:${file.id}`, decoded);
    return file;
  }

  async loadSprite(fileId: string): Promise<Sprite | null> {
    const key = `fs:${fileId}`;
    const cached = this.sprites.get(key);
    if (cached) return cached;

    const raw = await this.readFile(fileId);
    if (!raw) return null;
    try {
      const parsed: SpriteFileContent = JSON.parse(raw);
      const sprite = defineSprite(parsed.width, parsed.height, parsed.data);
      this.sprites.register(key, sprite);
      return sprite;
    } catch {
      return null;
    }
  }

  mkdir(parentId: string, name: string): FSDirectory {
    const existing = this.findByName(parentId, name);
    if (existing && existing.kind === "directory")
      return existing as FSDirectory;

    const id = generateId();
    const now = Date.now();
    const dir: FSDirectory = {
      id,
      name,
      kind: "directory",
      parentId,
      createdAt: now,
      modifiedAt: now,
    };
    this.meta.nodes[id] = dir;
    this.schedulePersist();
    this.notify();
    return dir;
  }

  rename(nodeId: string, newName: string): void {
    const node = this.meta.nodes[nodeId];
    if (!node || nodeId === ROOT_ID) return;
    node.name = newName;
    node.modifiedAt = Date.now();
    this.schedulePersist();
    this.notify();
  }

  move(nodeId: string, newParentId: string): void {
    const node = this.meta.nodes[nodeId];
    if (!node || nodeId === ROOT_ID) return;
    node.parentId = newParentId;
    node.position = undefined;
    node.modifiedAt = Date.now();
    this.schedulePersist();
    this.notify();
  }

  setPosition(
    nodeId: string,
    position: { x: number; y: number } | undefined
  ): void {
    const node = this.meta.nodes[nodeId];
    if (!node || nodeId === ROOT_ID) return;
    node.position = position;
    this.schedulePersist();
    this.notify();
  }

  clearPositions(parentId: string): void {
    for (const node of Object.values(this.meta.nodes)) {
      if (node.parentId === parentId && node.position) {
        node.position = undefined;
      }
    }
    this.schedulePersist();
    this.notify();
  }

  async remove(nodeId: string): Promise<void> {
    if (nodeId === ROOT_ID) return;
    const node = this.meta.nodes[nodeId];
    if (!node) return;

    if (node.kind === "directory") {
      const children = this.readDir(nodeId);
      for (const child of children) {
        await this.remove(child.id);
      }
    } else {
      await this.backend.deleteFile(nodeId);
    }

    delete this.meta.nodes[nodeId];
    this.schedulePersist();
    this.notify();
  }

  // ---- Change subscriptions ----

  onChange(callback: FSChangeCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    this.version++;
    for (const cb of this.listeners) {
      try {
        cb();
      } catch {}
    }
  }

  // ---- Persistence ----

  private schedulePersist(): void {
    this.metaDirty = true;
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      if (this.metaDirty) {
        this.metaDirty = false;
        this.backend
          .writeMeta(JSON.stringify(this.meta))
          .catch((e) => console.error("MockFS persist error:", e));
      }
    }, 500);
  }

  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.metaDirty) {
      this.metaDirty = false;
      await this.backend.writeMeta(JSON.stringify(this.meta));
    }
  }
}
