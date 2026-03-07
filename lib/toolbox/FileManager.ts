/**
 * FileManager.ts — Macintosh Toolbox File Manager
 *
 * Single source of truth for all filesystem operations. Incorporates the
 * former MockFS in-memory tree, OPFSBackend persistence, change listeners,
 * and exposes both the low-level methods that apps use directly AND the
 * Mac-aligned high-level API (FSpCreate, FSRead, etc.).
 *
 * Original Mac routines mapped:
 *   FSpCreate    → FSpCreate(spec, creator, type)
 *   FSpDelete    → FSpDelete(spec)
 *   FSRead       → FSRead(spec)
 *   FSWrite      → FSWrite(spec, data)
 *   FSpGetFInfo  → FSpGetFInfo(spec)
 *   FSpSetFInfo  → FSpSetFInfo(spec, info)
 *   PBGetCatInfo → PBGetCatInfo(spec)
 *   FSMakeFSSpec → FSMakeFSSpec(path)
 *
 * Dropped: ParamBlockRec, async callbacks, volume refs, resource forks.
 */

import type { Sprite } from "../canvas/BitCanvas";
import { ResourceManager, defineSprite } from "./ResourceManager";
import { OPFSBackend } from "../canvas/fs/OPFSBackend";

// -------------------------------------------------------------------------
// Types (formerly in MockFS.ts)
// -------------------------------------------------------------------------

export interface FSNode {
  id: string;
  name: string;
  kind: "file" | "directory";
  parentId: string | null;
  createdAt: number;
  modifiedAt: number;
  icon?: string;
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

export const ROOT_ID = "__root__";

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

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

// -------------------------------------------------------------------------
// Mac-style type mappings
// -------------------------------------------------------------------------

export interface FInfo {
  fdType: string;
  fdCreator: string;
}

export interface FSSpec {
  path: string;
}

export interface CatInfoRec {
  name: string;
  kind: "file" | "directory";
  size: number;
  createdAt: number;
  modifiedAt: number;
  fdType: string;
  fdCreator: string;
}

const FILE_TYPE_MAP: Record<string, string> = {
  text: "TEXT",
  image: "PICT",
  app: "APPL",
  "app-shortcut": "ALIK",
  binary: "BINA",
};

const REVERSE_TYPE_MAP: Record<string, FSFile["fileType"]> = {
  TEXT: "text",
  PICT: "image",
  APPL: "app",
  ALIK: "app-shortcut",
  BINA: "binary",
};

// -------------------------------------------------------------------------
// FileManager
// -------------------------------------------------------------------------

export class FileManager {
  private meta: FileSystemMetadata = { version: 1, nodes: {} };
  private backend: OPFSBackend;
  private sprites: ResourceManager;
  private listeners: FSChangeCallback[] = [];
  private metaDirty = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  /** Monotonically increasing counter, bumped on every mutation. */
  version = 0;

  constructor(backend: OPFSBackend, sprites: ResourceManager) {
    this.backend = backend;
    this.sprites = sprites;
  }

  // =====================================================================
  // Lifecycle
  // =====================================================================

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

  // =====================================================================
  // Reads
  // =====================================================================

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

  // =====================================================================
  // Writes
  // =====================================================================

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

  // =====================================================================
  // Change subscriptions
  // =====================================================================

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

  // =====================================================================
  // Persistence
  // =====================================================================

  private schedulePersist(): void {
    this.metaDirty = true;
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      if (this.metaDirty) {
        this.metaDirty = false;
        this.backend
          .writeMeta(JSON.stringify(this.meta))
          .catch((e) => console.error("FileManager persist error:", e));
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

  // =====================================================================
  // Mac-style high-level API
  // =====================================================================

  FSMakeFSSpec(path: string): FSSpec {
    return { path };
  }

  async FSpCreate(spec: FSSpec, creator: string, type: string): Promise<void> {
    const { parentPath, name } = this._splitPath(spec.path);
    const parent = this._resolveDir(parentPath);
    if (!parent) throw new Error(`Directory not found: ${parentPath}`);

    const fileType = REVERSE_TYPE_MAP[type] ?? "binary";
    await this.writeFile(parent.id, name, "", fileType);
  }

  async FSpDelete(spec: FSSpec): Promise<void> {
    const node = this.resolvePath(spec.path);
    if (!node) throw new Error(`Not found: ${spec.path}`);
    await this.remove(node.id);
  }

  async FSRead(spec: FSSpec): Promise<string | null> {
    const node = this.resolvePath(spec.path);
    if (!node || node.kind !== "file") return null;
    return this.readFile(node.id);
  }

  async FSWrite(spec: FSSpec, data: string): Promise<void> {
    const node = this.resolvePath(spec.path);
    if (node && node.kind === "file") {
      const file = node as FSFile;
      const { parentPath, name } = this._splitPath(spec.path);
      const parent = this._resolveDir(parentPath);
      if (parent) {
        await this.writeFile(parent.id, name, data, file.fileType);
      }
    } else {
      const { parentPath, name } = this._splitPath(spec.path);
      const parent = this._resolveDir(parentPath);
      if (!parent) throw new Error(`Directory not found: ${parentPath}`);
      await this.writeFile(parent.id, name, data, "text");
    }
  }

  async FSpGetFInfo(spec: FSSpec): Promise<FInfo> {
    const node = this.resolvePath(spec.path);
    if (!node || node.kind !== "file") {
      throw new Error(`File not found: ${spec.path}`);
    }
    const file = node as FSFile;
    return {
      fdType: FILE_TYPE_MAP[file.fileType] ?? "BINA",
      fdCreator: "MOCK",
    };
  }

  async FSpSetFInfo(spec: FSSpec, info: FInfo): Promise<void> {
    const node = this.resolvePath(spec.path);
    if (!node || node.kind !== "file") {
      throw new Error(`File not found: ${spec.path}`);
    }
    const file = node as FSFile;
    const newType = REVERSE_TYPE_MAP[info.fdType];
    if (newType) {
      (file as any).fileType = newType;
    }
  }

  async PBGetCatInfo(spec: FSSpec): Promise<CatInfoRec> {
    const node = this.resolvePath(spec.path);
    if (!node) throw new Error(`Not found: ${spec.path}`);

    if (node.kind === "file") {
      const file = node as FSFile;
      return {
        name: node.name,
        kind: "file",
        size: file.size,
        createdAt: node.createdAt,
        modifiedAt: node.modifiedAt,
        fdType: FILE_TYPE_MAP[file.fileType] ?? "BINA",
        fdCreator: "MOCK",
      };
    }

    return {
      name: node.name,
      kind: "directory",
      size: 0,
      createdAt: node.createdAt,
      modifiedAt: node.modifiedAt,
      fdType: "",
      fdCreator: "",
    };
  }

  DirCreate(spec: FSSpec): void {
    const { parentPath, name } = this._splitPath(spec.path);
    const parent = this._resolveDir(parentPath);
    if (!parent) throw new Error(`Directory not found: ${parentPath}`);
    this.mkdir(parent.id, name);
  }

  // ---- Internal helpers ----

  private _splitPath(path: string): { parentPath: string; name: string } {
    const parts = path.split("/").filter(Boolean);
    const name = parts.pop() ?? "";
    return { parentPath: "/" + parts.join("/"), name };
  }

  private _resolveDir(path: string): FSNode | null {
    if (path === "/" || path === "") {
      return this.getNode(ROOT_ID) ?? null;
    }
    return this.resolvePath(path);
  }
}
