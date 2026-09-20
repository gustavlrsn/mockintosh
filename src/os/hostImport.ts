/**
 * Host file import — a file the user dragged from the real computer onto the
 * Mockintosh screen becomes an ordinary FS node. Dither (and later others)
 * then open it the usual Finder way.
 */
import { inferMimeType, isImageType, type FileSystem, type FSFile } from "@mockintosh/fs";
import type { HostFileDrop } from "../platform/types";
import type { OSWindow } from "./state";
import { windowContentRect, windowTotalHeight } from "./windowGeometry";

export const DITHER_APP_ID = "dither";
export const IMPORTED_IMAGE_ICON = "icon/camera";

export interface ImportTarget {
  parentId: string;
  position: { x: number; y: number };
  /** When the drop landed on this app's window, open the new file there. */
  openIn?: string;
}

/** A unique name in `parentId`: `photo.png`, then `photo 2.png`, … */
export function uniqueChildName(fs: FileSystem, parentId: string, name: string): string {
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

export function isImportableImage(file: HostFileDrop): boolean {
  if (isImageType(file.type)) return true;
  return isImageType(inferMimeType(file.name));
}

/**
 * Frontmost window under `(x, y)` that should receive the drop: Dither opens
 * the file; a Finder folder keeps it; everything else falls through to the
 * desktop.
 */
export function resolveImportTarget(
  fs: FileSystem,
  windows: readonly OSWindow[],
  x: number,
  y: number,
  menubarHeight: number,
): ImportTarget | null {
  const desktop = fs.locate("desktop");
  if (!desktop) return null;

  for (const win of [...windows].reverse()) {
    const height = windowTotalHeight(win);
    const inside =
      x >= win.x && x < win.x + win.width && y >= win.y && y < win.y + height;
    if (!inside) continue;

    if (win.appId === DITHER_APP_ID) {
      return {
        parentId: desktop.id,
        position: desktopPosition(x, y, menubarHeight),
        openIn: DITHER_APP_ID,
      };
    }
    if (win.kind === "finder-folder") {
      const dirId = win.props.directoryId;
      if (typeof dirId !== "string") break;
      const content = windowContentRect(win);
      return {
        parentId: dirId,
        position: {
          x: Math.max(0, x - content.x + win.scrollX),
          y: Math.max(0, y - content.y + win.scrollY),
        },
      };
    }
    break;
  }

  return { parentId: desktop.id, position: desktopPosition(x, y, menubarHeight) };
}

function desktopPosition(x: number, y: number, menubarHeight: number): { x: number; y: number } {
  return { x: Math.max(0, x - 32), y: Math.max(0, y - menubarHeight - 16) };
}

export async function importHostFile(
  fs: FileSystem,
  parentId: string,
  file: HostFileDrop,
  position: { x: number; y: number },
): Promise<FSFile> {
  const type = isImageType(file.type) ? file.type : inferMimeType(file.name);
  const name = uniqueChildName(fs, parentId, file.name.trim() || "untitled");
  return fs.writeFile(parentId, name, file.bytes, {
    type,
    attributes: {
      icon: IMPORTED_IMAGE_ICON,
      position: { x: position.x, y: position.y },
    },
  });
}
