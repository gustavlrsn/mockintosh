/**
 * Solid universal renderer wired to the CanvasNode tree.
 *
 * Uses `createRenderer` from `solid-js/universal` to translate Solid JSX
 * into CanvasNode mutations. The rendered result is a retained node tree
 * that the draw pass traverses each frame.
 */

import { createRenderer } from "solid-js/universal";
import {
  createNode,
  insertChild,
  removeChild,
  markDirty,
  setNodeProperty,
  type CanvasNode,
  type NodeType,
} from "./nodes";
import { applySelectable } from "./selectable";

const ELEMENT_TYPES = new Set(["box", "text", "image", "raster", "bitmap"]);

function toNodeType(tagName: string): NodeType {
  if (ELEMENT_TYPES.has(tagName)) return tagName as NodeType;
  // Unknown element types fall back to box (safe default for composition)
  return "box";
}

// Module-level repaint hook — set by createUI so any reactive tree mutation
// automatically schedules a host repaint. Components never need to call
// scheduleRender() explicitly.
let _repaintHook: () => void = () => {};
export function _setRepaintHook(fn: () => void): void {
  _repaintHook = fn;
}

/** Host repaint from non-Solid mutations (e.g. overflow=scroll wheel). */
export function scheduleRepaint(): void {
  _repaintHook();
}

export const {
  render,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps,
  use,
} = createRenderer<CanvasNode>({
  createElement(type: string): CanvasNode {
    return createNode(toNodeType(type));
  },

  createTextNode(value: string): CanvasNode {
    const node = createNode("_text_content");
    node.textContent = value;
    return node;
  },

  replaceText(node: CanvasNode, value: string): void {
    node.textContent = value;
    markDirty(node);
    _repaintHook();
  },

  setProperty(node: CanvasNode, name: string, value: unknown): void {
    setNodeProperty(node, name, value);
    if (name === "selectable") applySelectable(node, value);
    _repaintHook();
  },

  insertNode(parent: CanvasNode, node: CanvasNode, anchor: CanvasNode | null): void {
    insertChild(parent, node, anchor);
    _repaintHook();
  },

  removeNode(parent: CanvasNode, node: CanvasNode): void {
    applySelectable(node, false);
    removeChild(parent, node);
    _repaintHook();
  },

  isTextNode(node: CanvasNode): boolean {
    return node.type === "_text_content";
  },

  getParentNode(node: CanvasNode): CanvasNode | null {
    return node.parent;
  },

  getFirstChild(node: CanvasNode): CanvasNode | null {
    return node.children[0] ?? null;
  },

  getNextSibling(node: CanvasNode): CanvasNode | null {
    const parent = node.parent;
    if (!parent) return null;
    const idx = parent.children.indexOf(node);
    return parent.children[idx + 1] ?? null;
  },
});
