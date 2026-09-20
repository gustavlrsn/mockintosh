/**
 * Named cursors — widgets declare intent; the host presents it.
 *
 * `cursor` on a node is a name (`pointer`, `watch`, …), not a CSS string.
 * Hosts map that name:
 *   - `"css"` — `cssCursor()` → `canvas.style.cursor` (web catalog)
 *   - `"none"` — leave the host pointer alone (OS paints QuickDraw CURS)
 *   - overrides — swap any name for a CSS value, including `url(...)` 1-bit
 *     PNG faces, without changing widget code
 */

import { nodeAt } from "./pointer";
import type { CanvasNode } from "./nodes";

export const DEFAULT_CURSOR = "default";

export type NamedCursor =
  | "default"
  | "arrow"
  | "pointer"
  | "text"
  | "iBeam"
  | "wait"
  | "watch"
  | "crosshair"
  | "cross"
  | "plus"
  | "grab"
  | "grabbing"
  | "none";

/** Semantic cursor name, or a raw CSS cursor for one-off host values. */
export type CursorName = NamedCursor | (string & {});

export type CursorCSSTable = Partial<Record<NamedCursor, string>>;

const CSS_CURSOR: Record<NamedCursor, string> = {
  default: "default",
  arrow: "default",
  pointer: "pointer",
  text: "text",
  iBeam: "text",
  wait: "wait",
  watch: "wait",
  crosshair: "crosshair",
  cross: "crosshair",
  plus: "cell",
  grab: "grab",
  grabbing: "grabbing",
  none: "none",
};

export function isNamedCursor(name: string): name is NamedCursor {
  return Object.prototype.hasOwnProperty.call(CSS_CURSOR, name);
}

/** Walk from `node` to root; first `cursor` handler wins. */
export function cursorOf(node: CanvasNode | null): CursorName {
  let n = node;
  while (n) {
    const value = n._eventHandlers.cursor;
    if (typeof value === "string" && value.length > 0) return value;
    n = n.parent;
  }
  return DEFAULT_CURSOR;
}

/** Cursor name for the topmost painted box under `(x, y)`. */
export function cursorAt(root: CanvasNode, x: number, y: number): CursorName {
  return cursorOf(nodeAt(root, x, y));
}

/**
 * Map a cursor name to a CSS `cursor` value.
 * Unknown names pass through so `not-allowed` or `url(...)` still work.
 */
export function cssCursor(name: CursorName, overrides?: CursorCSSTable): string {
  if (isNamedCursor(name)) return overrides?.[name] ?? CSS_CURSOR[name];
  return name;
}
