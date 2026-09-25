import type { FileSystem } from "./fileSystem";
import type { NodeId } from "./types";

/**
 * A name that is free in `parentId`: `photo.png`, then `photo 2.png`, … Writing
 * to an existing name replaces that file, so a "save a new copy" action picks
 * its name through this.
 */
export function uniqueChildName(fs: Pick<FileSystem, "child">, parentId: NodeId, name: string): string {
  const cleaned = name.trim() || "untitled";
  if (!fs.child(parentId, cleaned)) return cleaned;
  const dot = cleaned.lastIndexOf(".");
  const stem = dot > 0 ? cleaned.slice(0, dot) : cleaned;
  const ext = dot > 0 ? cleaned.slice(dot) : "";
  for (let n = 2; ; n++) {
    const candidate = `${stem} ${n}${ext}`;
    if (!fs.child(parentId, candidate)) return candidate;
  }
}
