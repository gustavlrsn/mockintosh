/**
 * Focus system — tracks which node currently receives keyboard events.
 *
 * Rules:
 * - A node is focusable if its `_eventHandlers.tabIndex` is a non-negative number.
 * - Tab / Shift+Tab cycle through focusable nodes in tabIndex ascending order,
 *   using document order (depth-first) as the tiebreaker — matches DOM behavior.
 * - Clicking a focusable node focuses it (handled externally in event dispatch).
 * - `onFocus` fires on the newly focused node; `onBlur` fires on the old one.
 */

import { createSignal, flush, type Accessor } from "solid-js";
import type { CanvasNode, EventHandlers, Modifiers } from "./nodes";

export interface FocusManager {
  readonly focused: CanvasNode | null;
  focus(node: CanvasNode): void;
  blur(): void;
  focusNext(): void;
  focusPrev(): void;
  /** Restrict Tab cycling to descendants of `scope` (or the whole tree if null). */
  setActiveScope(scope: CanvasNode | null): void;
  getActiveScope(): CanvasNode | null;
  dispatchKeyboard(
    type: "keydown" | "keyup" | "keypress",
    key: string,
    modifiers: Modifiers
  ): void;
  /** For use in useFocus() hook — returns reactive accessor for the focused node. */
  getFocusedSignal(): Accessor<CanvasNode | null>;
}

export function createFocusManager(root: CanvasNode): FocusManager {
  const [focusedNode, setFocusedNode] = createSignal<CanvasNode | null>(null, {
    ownedWrite: true,
  });
  let activeScope: CanvasNode | null = null;
  const lastFocusedInScope = new WeakMap<CanvasNode, CanvasNode>();

  function collectFocusable(node: CanvasNode, out: CanvasNode[]): void {
    if (node._eventHandlers.tabIndex !== undefined && node._eventHandlers.tabIndex >= 0) {
      out.push(node);
    }
    for (const child of node.children) {
      collectFocusable(child, out);
    }
  }

  function getSortedFocusable(): CanvasNode[] {
    const nodes: CanvasNode[] = [];
    collectFocusable(activeScope ?? root, nodes);
    // Stable sort: primary key tabIndex ASC, secondary key document order (already DFS)
    return nodes.sort((a, b) => {
      const at = a._eventHandlers.tabIndex ?? 0;
      const bt = b._eventHandlers.tabIndex ?? 0;
      return at - bt;
    });
  }

  const manager: FocusManager = {
    get focused(): CanvasNode | null {
      return focusedNode();
    },

    focus(node: CanvasNode): void {
      const current = focusedNode();
      if (current === node) return;
      if (current) current._eventHandlers.onBlur?.();
      setFocusedNode(node);
      flush();
      node._eventHandlers.onFocus?.();
      if (activeScope) lastFocusedInScope.set(activeScope, node);
    },

    setActiveScope(scope: CanvasNode | null): void {
      activeScope = scope;
      if (!scope) return;
      const last = lastFocusedInScope.get(scope);
      if (last && last.parent) {
        manager.focus(last);
      }
    },

    getActiveScope(): CanvasNode | null {
      return activeScope;
    },

    blur(): void {
      const current = focusedNode();
      if (!current) return;
      current._eventHandlers.onBlur?.();
      setFocusedNode(null);
      flush();
    },

    focusNext(): void {
      const focusable = getSortedFocusable();
      if (focusable.length === 0) return;
      const current = focusedNode();
      if (!current) {
        manager.focus(focusable[0]);
        return;
      }
      const idx = focusable.indexOf(current);
      const next = focusable[(idx + 1) % focusable.length];
      manager.focus(next);
    },

    focusPrev(): void {
      const focusable = getSortedFocusable();
      if (focusable.length === 0) return;
      const current = focusedNode();
      if (!current) {
        manager.focus(focusable[focusable.length - 1]);
        return;
      }
      const idx = focusable.indexOf(current);
      const prev = focusable[(idx - 1 + focusable.length) % focusable.length];
      manager.focus(prev);
    },

    dispatchKeyboard(
      type: "keydown" | "keyup" | "keypress",
      key: string,
      modifiers: Modifiers
    ): void {
      const current = focusedNode();

      // Tab / Shift+Tab are always handled by the focus system
      if (type === "keydown" && key === "Tab") {
        if (modifiers.shift) {
          manager.focusPrev();
        } else {
          manager.focusNext();
        }
        return;
      }

      if (!current) return;
      const handlers = current._eventHandlers;

      if (type === "keydown") {
        handlers.onKeyDown?.(key, modifiers);
      } else if (type === "keyup") {
        handlers.onKeyUp?.(key, modifiers);
      } else if (type === "keypress") {
        handlers.onKeyPress?.(key);
      }
    },

    getFocusedSignal(): Accessor<CanvasNode | null> {
      return focusedNode;
    },
  };

  return manager;
}

// -------------------------------------------------------------------------
// Auto-focus: called after tree is first rendered
// -------------------------------------------------------------------------

export function applyAutoFocus(root: CanvasNode, manager: FocusManager): void {
  function findAutoFocus(node: CanvasNode): CanvasNode | null {
    if (node._eventHandlers.autoFocus) return node;
    for (const child of node.children) {
      const found = findAutoFocus(child);
      if (found) return found;
    }
    return null;
  }
  const target = findAutoFocus(root);
  if (target) manager.focus(target);
}
