/**
 * Pointer dispatch — hit-tests the CanvasNode tree and delivers mouse events
 * with implicit capture: the node that received mousedown keeps receiving
 * drag / mouseup until release.
 */

import {
  hasMouseHandlers,
  resolveBorderWidth,
  type CanvasNode,
  type HitMask,
  type LayoutRect,
  type PointerCaptureEvent,
} from "./nodes";
import type { FocusManager } from "./focus";

export type PointerType =
  | "mousemove"
  | "mousedown"
  | "mouseup"
  | "dblclick"
  | "scroll";

export interface PointerDispatcher {
  dispatch(
    type: PointerType,
    x: number,
    y: number,
    extras?: { deltaY?: number }
  ): void;
}

interface ClipRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function pointInRect(
  x: number,
  y: number,
  r: { x: number; y: number; width: number; height: number }
): boolean {
  return x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height;
}

function intersectClip(a: ClipRect | null, b: ClipRect): ClipRect {
  if (!a) return b;
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}

function hitMaskOk(mask: HitMask | undefined, lx: number, ly: number): boolean {
  if (!mask) return true;
  const mx = Math.floor(lx);
  const my = Math.floor(ly);
  if (mx < 0 || my < 0 || mx >= mask.width || my >= mask.height) return false;
  return mask.data[my * mask.width + mx] !== 0;
}

function visualRect(node: CanvasNode, ox: number, oy: number): LayoutRect {
  return {
    x: node.layout.x + ox,
    y: node.layout.y + oy,
    width: node.layout.width,
    height: node.layout.height,
  };
}

/**
 * Topmost node under (x, y) that has mouse handlers, honoring inert, clip,
 * scroll offsets, and hit masks. Walks children in reverse paint order.
 */
export function hitTest(
  node: CanvasNode,
  x: number,
  y: number,
  ox = 0,
  oy = 0,
  clip: ClipRect | null = null
): CanvasNode | null {
  if (node.props["inert"] === true) return null;
  if (node.type === "_text_content") return null;

  const rect = visualRect(node, ox, oy);
  const overflow = node.style.overflow;
  const clips = overflow === "hidden" || overflow === "scroll";

  if (clips) {
    // Children are clipped to the padding box (inside the border), matching
    // the draw pipeline.
    const bw = resolveBorderWidth(node);
    const nextClip = intersectClip(clip, {
      x: rect.x + bw,
      y: rect.y + bw,
      width: Math.max(0, rect.width - 2 * bw),
      height: Math.max(0, rect.height - 2 * bw),
    });
    if (nextClip.width > 0 && nextClip.height > 0) {
      const childOy = oy - (overflow === "scroll" ? node._scrollOffset : 0);
      for (let i = node.children.length - 1; i >= 0; i--) {
        const hit = hitTest(node.children[i], x, y, ox, childOy, nextClip);
        if (hit) return hit;
      }
    }
    // The box itself (including its border) is hittable within the parent clip.
    if (
      node.type !== "_root" &&
      hasMouseHandlers(node._eventHandlers) &&
      pointInRect(x, y, rect) &&
      (!clip || pointInRect(x, y, clip)) &&
      hitMaskOk(node.props["hitMask"] as HitMask | undefined, x - rect.x, y - rect.y)
    ) {
      return node;
    }
    return null;
  }

  for (let i = node.children.length - 1; i >= 0; i--) {
    const hit = hitTest(node.children[i], x, y, ox, oy, clip);
    if (hit) return hit;
  }

  if (node.type === "_root") return null;
  if (clip && !pointInRect(x, y, clip)) return null;
  if (
    hasMouseHandlers(node._eventHandlers) &&
    pointInRect(x, y, rect) &&
    hitMaskOk(node.props["hitMask"] as HitMask | undefined, x - rect.x, y - rect.y)
  ) {
    return node;
  }
  return null;
}

function localOf(node: CanvasNode, gx: number, gy: number): { lx: number; ly: number } {
  // Walk ancestors to accumulate scroll offsets so local coords match the
  // visual position used by layout + draw.
  let ox = 0;
  let oy = 0;
  let n: CanvasNode | null = node.parent;
  while (n) {
    if (n.style.overflow === "scroll") oy -= n._scrollOffset;
    n = n.parent;
  }
  return {
    lx: gx - (node.layout.x + ox),
    ly: gy - (node.layout.y + oy),
  };
}

/**
 * Run the capture phase for a mousedown on `target`: every ancestor's
 * `onMouseDownCapture` fires root-most first, then the target's own.
 * Returns true if any handler called `preventDefault()`.
 */
function runMouseDownCapture(target: CanvasNode, gx: number, gy: number): boolean {
  const chain: CanvasNode[] = [];
  for (let n: CanvasNode | null = target; n; n = n.parent) {
    if (n._eventHandlers.onMouseDownCapture) chain.push(n);
  }
  let prevented = false;
  for (let i = chain.length - 1; i >= 0; i--) {
    const node = chain[i];
    const { lx, ly } = localOf(node, gx, gy);
    const event: PointerCaptureEvent = {
      localX: lx,
      localY: ly,
      globalX: gx,
      globalY: gy,
      get defaultPrevented() {
        return prevented;
      },
      preventDefault() {
        prevented = true;
      },
    };
    node._eventHandlers.onMouseDownCapture!(event);
    if (prevented) return true;
  }
  return false;
}

function nearestFocusable(node: CanvasNode | null): CanvasNode | null {
  let n = node;
  while (n) {
    const tab = n._eventHandlers.tabIndex;
    if (tab !== undefined && tab >= 0) return n;
    n = n.parent;
  }
  return null;
}

export function createPointerDispatcher(
  root: CanvasNode,
  focusManager: FocusManager
): PointerDispatcher {
  let hovered: CanvasNode | null = null;
  let captured: CanvasNode | null = null;
  let dragging = false;

  function setHovered(next: CanvasNode | null): void {
    if (next === hovered) return;
    hovered?._eventHandlers.onMouseLeave?.();
    hovered = next;
    hovered?._eventHandlers.onMouseEnter?.();
  }

  return {
    dispatch(type, x, y, extras) {
      if (type === "scroll") {
        const hit = hitTest(root, x, y);
        hit?._eventHandlers.onScroll?.(extras?.deltaY ?? 0);
        return;
      }

      if (type === "mousemove") {
        const hit = hitTest(root, x, y);
        if (!captured) setHovered(hit);
        if (captured) {
          const { lx, ly } = localOf(captured, x, y);
          if (!dragging) {
            dragging = true;
            captured._eventHandlers.onDragStart?.(lx, ly, x, y);
          }
          captured._eventHandlers.onDrag?.(lx, ly, x, y);
        }
        return;
      }

      if (type === "mousedown") {
        const hit = hitTest(root, x, y);
        dragging = false;
        setHovered(hit);
        if (!hit) {
          captured = null;
          return;
        }

        // A press inside a focus scope activates that scope (restoring its
        // last-focused node), even if the press is swallowed below — so
        // keyboard focus follows whatever the user clicked into.
        const scope = findScope(hit);
        if (scope !== focusManager.getActiveScope()) focusManager.setActiveScope(scope);

        if (runMouseDownCapture(hit, x, y)) {
          captured = null;
          return;
        }

        captured = hit;
        const { lx, ly } = localOf(hit, x, y);
        hit._eventHandlers.onMouseDown?.(lx, ly);
        const focusable = nearestFocusable(hit);
        if (focusable) focusManager.focus(focusable);
        return;
      }

      if (type === "mouseup") {
        const target = captured;
        const hit = hitTest(root, x, y);
        if (target) {
          const { lx, ly } = localOf(target, x, y);
          if (dragging) {
            target._eventHandlers.onDragEnd?.(lx, ly, x, y);
          }
          target._eventHandlers.onMouseUp?.(lx, ly);
          if (hit === target) {
            target._eventHandlers.onClick?.(lx, ly);
          }
        }
        captured = null;
        dragging = false;
        setHovered(hit);
        return;
      }

      if (type === "dblclick") {
        const hit = hitTest(root, x, y);
        if (hit) {
          const { lx, ly } = localOf(hit, x, y);
          hit._eventHandlers.onDoubleClick?.(lx, ly);
        }
      }
    },
  };
}

function findScope(node: CanvasNode): CanvasNode | null {
  let n: CanvasNode | null = node;
  while (n) {
    if (n.props["focusScope"] === true) return n;
    n = n.parent;
  }
  return null;
}
