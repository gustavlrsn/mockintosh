/**
 * Pointer dispatch — hit-tests the CanvasNode tree and delivers mouse events
 * with implicit capture: the node that received mousedown keeps receiving
 * drag / mouseup until release.
 */

import {
  hasMouseHandlers,
  markDirty,
  resolveBorderWidth,
  type CanvasNode,
  type HitMask,
  type LayoutRect,
  type PointerCaptureEvent,
} from "./nodes";
import type { FocusManager } from "./focus";
import { scheduleRepaint } from "./renderer";

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

function paddingEdge(node: CanvasNode, edge: "top" | "right" | "bottom" | "left"): number {
  const base = node.style.padding ?? 0;
  if (edge === "top") return node.style.paddingTop ?? base;
  if (edge === "right") return node.style.paddingRight ?? base;
  if (edge === "bottom") return node.style.paddingBottom ?? base;
  return node.style.paddingLeft ?? base;
}

/** How far `overflow: scroll` can move, from laid-out children. */
export function scrollOverflow(node: CanvasNode): number {
  const bw = resolveBorderWidth(node);
  let maxBottom = node.layout.y + bw + paddingEdge(node, "top");
  for (const child of node.children) {
    if ((child.style.position ?? "relative") === "absolute") continue;
    maxBottom = Math.max(maxBottom, child.layout.y + child.layout.height);
  }
  const contentH = maxBottom - node.layout.y + bw + paddingEdge(node, "bottom");
  return Math.max(0, contentH - node.layout.height);
}

/**
 * Innermost node whose box contains (x, y), including boxes with no mouse
 * handlers. Wheel uses this so `overflow: scroll` works without onScroll.
 */
export function nodeAt(
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
  const childOy = overflow === "scroll" ? oy - node._scrollOffset : oy;

  if (clips) {
    const bw = resolveBorderWidth(node);
    const nextClip = intersectClip(clip, {
      x: rect.x + bw,
      y: rect.y + bw,
      width: Math.max(0, rect.width - 2 * bw),
      height: Math.max(0, rect.height - 2 * bw),
    });
    if (nextClip.width > 0 && nextClip.height > 0) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        const hit = nodeAt(node.children[i], x, y, ox, childOy, nextClip);
        if (hit) return hit;
      }
    }
  } else {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const hit = nodeAt(node.children[i], x, y, ox, oy, clip);
      if (hit) return hit;
    }
  }

  if (node.type === "_root") return null;
  if (clip && !pointInRect(x, y, clip)) return null;
  if (!pointInRect(x, y, rect)) return null;
  return node;
}

function applyWheel(node: CanvasNode, dy: number): boolean {
  const max = scrollOverflow(node);
  const next = Math.max(0, Math.min(max, node._scrollOffset + dy));
  if (next === node._scrollOffset) return false;
  node._scrollOffset = next;
  markDirty(node);
  scheduleRepaint();
  return true;
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
  focusManager: FocusManager,
  onError?: (error: unknown) => void,
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
      try {
        dispatchInner(type, x, y, extras);
      } catch (error) {
        onError?.(error);
      }
    },
  };

  function dispatchInner(type: PointerType, x: number, y: number, extras?: { deltaY?: number }) {
      if (type === "scroll") {
        // Start from the box under the pointer, not only a hit-target. An
        // overflow:scroll pane (ChatGippity's message list) has no handlers
        // of its own; hitTest would miss it and the window would eat the wheel.
        const dy = extras?.deltaY ?? 0;
        let node = nodeAt(root, x, y) ?? hitTest(root, x, y);
        while (node) {
          const canScroll = node.style.overflow === "scroll";
          const onScroll = node._eventHandlers.onScroll;
          if (canScroll) {
            const moved = applyWheel(node, dy);
            if (onScroll) {
              onScroll(dy);
              return;
            }
            if (moved) return;
          } else if (onScroll) {
            onScroll(dy);
            return;
          }
          node = node.parent;
        }
        return;
      }

      if (type === "mousemove") {
        const hit = hitTest(root, x, y);
        // Hover tracks the pointer even while a press is captured, like the
        // DOM: drop targets highlight under a drag, a pressed button unpresses
        // when the pointer leaves it, menus highlight on press-drag.
        setHovered(hit);
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
  }
}

function findScope(node: CanvasNode): CanvasNode | null {
  let n: CanvasNode | null = node;
  while (n) {
    if (n.props["focusScope"] === true) return n;
    n = n.parent;
  }
  return null;
}
