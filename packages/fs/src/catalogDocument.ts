/**
 * The persisted catalog document and its migrations.
 *
 * Every on-disk shape ever shipped is a `version`; `parseCatalog` upgrades
 * whatever it finds to `CURRENT_CATALOG_VERSION` before the file system sees
 * it. Add a migration step (never edit an old one) when the shape changes.
 */
import { inferMimeType } from "./mime";
import {
  MIME,
  ROOT_ID,
  type AttributeValue,
  type FSDirectory,
  type FSFile,
  type FSNode,
  type NodeAttributes,
  type NodeId,
  type NodeRole,
} from "./types";

export const CURRENT_CATALOG_VERSION = 2;

export interface CatalogDocument {
  version: typeof CURRENT_CATALOG_VERSION;
  nodes: Record<NodeId, FSNode>;
  attributes: Record<NodeId, NodeAttributes>;
}

export function emptyCatalog(now: number): CatalogDocument {
  const root: FSDirectory = {
    id: ROOT_ID,
    name: "/",
    kind: "directory",
    parentId: null,
    createdAt: now,
    modifiedAt: now,
    role: "root",
  };
  return { version: CURRENT_CATALOG_VERSION, nodes: { [ROOT_ID]: root }, attributes: {} };
}

/**
 * Parse and migrate a raw catalog. Unparseable or structurally invalid input
 * yields a fresh catalog rather than throwing: a corrupt meta file must not
 * brick the machine (the blobs are still on disk for manual recovery).
 */
export function parseCatalog(raw: string | null, now: number): CatalogDocument {
  if (!raw) return emptyCatalog(now);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyCatalog(now);
  }
  if (!isRecord(parsed) || !isRecord(parsed.nodes)) return emptyCatalog(now);

  let doc: unknown = parsed;
  const version = typeof parsed.version === "number" ? parsed.version : 1;
  for (let v = version; v < CURRENT_CATALOG_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) return emptyCatalog(now);
    doc = step(doc);
  }
  return ensureRoot(doc as CatalogDocument, now);
}

// ---------------------------------------------------------------------------
// v1 → v2
// ---------------------------------------------------------------------------

/** Shape written by the original `FileManager`. */
interface V1Node {
  id: string;
  name: string;
  kind: "file" | "directory";
  parentId: string | null;
  createdAt: number;
  modifiedAt: number;
  icon?: string;
  position?: { x: number; y: number };
  zOrder?: number;
  fileType?: "text" | "image" | "app" | "app-shortcut" | "binary";
  mimeType?: string;
  size?: number;
}

interface V1Document {
  version?: number;
  nodes: Record<string, V1Node>;
}

const V1_ROLE_BY_NAME: Readonly<Record<string, NodeRole>> = {
  "Desktop Folder": "desktop",
  Trash: "trash",
  Applications: "applications",
};

function v1FileType(node: V1Node): string {
  if (node.mimeType) return node.mimeType;
  switch (node.fileType) {
    case "image":
      return MIME.sprite;
    case "app":
      return MIME.app;
    case "app-shortcut":
      return MIME.appShortcut;
    case "text": {
      const inferred = inferMimeType(node.name);
      return inferred === MIME.binary ? MIME.text : inferred;
    }
    default:
      return inferMimeType(node.name);
  }
}

function migrateV1ToV2(input: unknown): CatalogDocument {
  const v1 = input as V1Document;
  const nodes: Record<NodeId, FSNode> = {};
  const attributes: Record<NodeId, NodeAttributes> = {};

  for (const n of Object.values(v1.nodes)) {
    if (!n || typeof n.id !== "string") continue;
    const base = {
      id: n.id,
      name: n.name,
      parentId: n.parentId,
      createdAt: n.createdAt,
      modifiedAt: n.modifiedAt,
    };
    if (n.kind === "directory") {
      const dir: FSDirectory = { ...base, kind: "directory" };
      if (n.id === ROOT_ID) dir.role = "root";
      else if (n.parentId === ROOT_ID) dir.role = "volume";
      else if (V1_ROLE_BY_NAME[n.name]) dir.role = V1_ROLE_BY_NAME[n.name];
      nodes[n.id] = dir;
    } else {
      const file: FSFile = { ...base, kind: "file", type: v1FileType(n), size: n.size ?? 0 };
      nodes[n.id] = file;
    }
    const attrs: Record<string, AttributeValue> = {};
    if (n.icon) attrs.icon = n.icon;
    if (n.position) attrs.position = { x: n.position.x, y: n.position.y };
    if (n.zOrder != null) attrs.zOrder = n.zOrder;
    if (Object.keys(attrs).length) attributes[n.id] = attrs;
  }

  // Roles must be unique per volume; if two "Trash" folders existed, keep the oldest.
  dedupeRoles(nodes);

  return { version: 2, nodes, attributes };
}

function dedupeRoles(nodes: Record<NodeId, FSNode>): void {
  const volumeOf = (id: NodeId): NodeId | undefined => {
    let cur = nodes[id];
    while (cur && cur.parentId !== null) {
      if (cur.parentId === ROOT_ID) return cur.id;
      cur = nodes[cur.parentId];
    }
    return undefined;
  };
  const seen = new Set<string>();
  for (const n of Object.values(nodes).sort((a, b) => a.createdAt - b.createdAt)) {
    if (!n.role || n.role === "root" || n.role === "volume") continue;
    const key = `${volumeOf(n.id)}/${n.role}`;
    if (seen.has(key)) delete n.role;
    else seen.add(key);
  }
}

const MIGRATIONS: Readonly<Record<number, (doc: unknown) => unknown>> = {
  1: migrateV1ToV2,
};

// ---------------------------------------------------------------------------

function ensureRoot(doc: CatalogDocument, now: number): CatalogDocument {
  if (!doc.attributes) doc.attributes = {};
  const root = doc.nodes[ROOT_ID];
  if (!root) {
    doc.nodes[ROOT_ID] = emptyCatalog(now).nodes[ROOT_ID];
  } else if (root.role !== "root") {
    root.role = "root";
  }
  // Drop nodes not reachable from the root — they'd be invisible forever.
  const childrenOf = new Map<NodeId, NodeId[]>();
  for (const n of Object.values(doc.nodes)) {
    if (n.parentId === null) continue;
    const list = childrenOf.get(n.parentId) ?? [];
    list.push(n.id);
    childrenOf.set(n.parentId, list);
  }
  const reachable = new Set<NodeId>([ROOT_ID]);
  const queue: NodeId[] = [ROOT_ID];
  while (queue.length) {
    for (const child of childrenOf.get(queue.pop()!) ?? []) {
      if (!reachable.has(child)) {
        reachable.add(child);
        queue.push(child);
      }
    }
  }
  for (const id of Object.keys(doc.nodes)) {
    if (!reachable.has(id)) {
      delete doc.nodes[id];
      delete doc.attributes[id];
    }
  }
  for (const id of Object.keys(doc.attributes)) {
    if (!doc.nodes[id]) delete doc.attributes[id];
  }
  return doc;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
