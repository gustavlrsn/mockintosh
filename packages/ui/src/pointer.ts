/**
 * Pointer dispatch — hit-tests the CanvasNode tree and delivers mouse events
 * with implicit capture: the node that received mousedown keeps receiving
 * drag / mouseup until release. A `kind: "touch"` press becomes overflow
 * scroll after slop when the gesture is vertical; mouse still uses wheel.
 */

import {
  hasMouseHandlers,
  resolveBorderWidth,
  shadowRaise,
  type CanvasNode,
  type HitMask,
  type LayoutRect,
  type PointerCaptureEvent,
} from "./nodes";
import type { FocusManager } from "./focus";
import { scheduleRepaint } from "./renderer";
import { scrollOverflow } from "./scroll";

export { scrollOverflow } from "./scroll";

export type PointerType =
  | "mousemove"
  | "mousedown"
  | "mouseup"
  | "dblclick"
  | "scroll";

/** Host pointer. `"touch"` (and coarse fingers reported as mouse) can pan overflow. */
export type PointerKind = "mouse" | "touch" | "pen";

export interface PointerExtras {
  deltaY?: number;
  kind?: PointerKind;
  /** `mouseup` that must not click — `pointercancel`, or a pan that already consumed the press. */
  cancel?: boolean;
}

/** Movement before a touch press becomes a pan or a widget drag. */
export const TOUCH_SLOP = 8;

/** Mac `DoubleTime` / `DoubleSpace` — same window the OS and the kit web host use. */
export const DOUBLE_CLICK_MS = 500;
export const DOUBLE_CLICK_DIST = 4;

/**
 * Classify a pointer-down as the second click of a double.
 * Hosts must still dispatch `mousedown` first — `dblclick` is extra, like the DOM.
 */
export function createDoubleClickTracker(options?: {
  ms?: number;
  dist?: number;
}): { down(x: number, y: number, now: number): boolean; reset(): void } {
  const ms = options?.ms ?? DOUBLE_CLICK_MS;
  const dist = options?.dist ?? DOUBLE_CLICK_DIST;
  let lastTime = -Infinity;
  let lastX = 0;
  let lastY = 0;
  return {
    down(x: number, y: number, now: number): boolean {
      const isDouble =
        now - lastTime < ms && Math.abs(x - lastX) < dist && Math.abs(y - lastY) < dist;
      if (isDouble) {
        lastTime = -Infinity;
        return true;
      }
      lastTime = now;
      lastX = x;
      lastY = y;
      return false;
    },
    reset() {
      lastTime = -Infinity;
    },
  };
}

export interface PointerDispatcher {
  dispatch(
    type: PointerType,
    x: number,
    y: number,
    extras?: PointerExtras
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
  const raise = shadowRaise(node);
  return {
    x: node.layout.x + ox - raise,
    y: node.layout.y + oy - raise,
    width: node.layout.width,
    height: node.layout.height,
  };
}

function childPaintOffset(node: CanvasNode, ox: number, oy: number): { ox: number; oy: number } {
  const raise = shadowRaise(node);
  return {
    ox: ox - raise,
    oy: (node.style.overflow === "scroll" ? oy - node._scrollOffset : oy) - raise,
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
      const next = childPaintOffset(node, ox, oy);
      for (let i = node.children.length - 1; i >= 0; i--) {
        const hit = hitTest(node.children[i], x, y, next.ox, next.oy, nextClip);
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

  const next = childPaintOffset(node, ox, oy);
  for (let i = node.children.length - 1; i >= 0; i--) {
    const hit = hitTest(node.children[i], x, y, next.ox, next.oy, clip);
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
  clip: ClipRect | null = null,
  skip?: (node: CanvasNode) => boolean,
): CanvasNode | null {
  if (skip?.(node)) return null;
  if (node.props["inert"] === true) return null;
  if (node.type === "_text_content") return null;

  const rect = visualRect(node, ox, oy);
  const overflow = node.style.overflow;
  const clips = overflow === "hidden" || overflow === "scroll";
  const next = childPaintOffset(node, ox, oy);

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
        const hit = nodeAt(node.children[i], x, y, next.ox, next.oy, nextClip, skip);
        if (hit) return hit;
      }
    }
  } else {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const hit = nodeAt(node.children[i], x, y, next.ox, next.oy, clip, skip);
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
  // Offset is paint-only. markDirty would recompute flex on every wheel.
  scheduleRepaint();
  return true;
}

function localOf(node: CanvasNode, gx: number, gy: number): { lx: number; ly: number } {
  // Walk ancestors to accumulate scroll offsets and shadow raises so local
  // coords match the visual position used by layout + draw.
  let ox = -shadowRaise(node);
  let oy = -shadowRaise(node);
  let n: CanvasNode | null = node.parent;
  while (n) {
    ox -= shadowRaise(n);
    oy -= shadowRaise(n);
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
  let pressKind: PointerKind = "mouse";
  let pressX = 0;
  let pressY = 0;
  let lastPanY = 0;
  let pressing = false;
  let panning = false;
  let touchDecided = false;

  function setHovered(next: CanvasNode | null): void {
    if (next === hovered) return;
    const prevChain: CanvasNode[] = [];
    for (let n = hovered; n; n = n.parent) prevChain.push(n);
    const nextChain: CanvasNode[] = [];
    for (let n = next; n; n = n.parent) nextChain.push(n);
    let i = prevChain.length - 1;
    let j = nextChain.length - 1;
    while (i >= 0 && j >= 0 && prevChain[i] === nextChain[j]) {
      i--;
      j--;
    }
    for (let k = 0; k <= i; k++) prevChain[k]._eventHandlers.onMouseLeave?.();
    for (let k = j; k >= 0; k--) nextChain[k]._eventHandlers.onMouseEnter?.();
    hovered = next;
  }

  function rememberPress(extras: PointerExtras | undefined, x: number, y: number): void {
    pressKind = extras?.kind ?? "mouse";
    pressX = x;
    pressY = y;
    lastPanY = y;
    pressing = true;
    panning = false;
    touchDecided = pressKind !== "touch";
  }

  function endPress(): void {
    pressing = false;
    panning = false;
    touchDecided = false;
    pressKind = "mouse";
    captured = null;
    dragging = false;
  }

  function applyScroll(x: number, y: number, dy: number): void {
    // Start from the box under the pointer, not only a hit-target. An
    // overflow:scroll pane (ChatGippity's message list) has no handlers
    // of its own; hitTest would miss it and the window would eat the wheel.
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
  }

  function canPanFrom(x: number, y: number, dy: number): boolean {
    let node = nodeAt(root, x, y) ?? hitTest(root, x, y);
    while (node) {
      if (node.style.overflow === "scroll") {
        const max = scrollOverflow(node);
        if (max > 0) {
          if (dy > 0 && node._scrollOffset < max) return true;
          if (dy < 0 && node._scrollOffset > 0) return true;
        }
      } else if (node._eventHandlers.onScroll) {
        return true;
      }
      node = node.parent;
    }
    return false;
  }

  function stealPressForPan(): void {
    // Leave, not mouseup — Button/createPress treats mouseup as activate.
    setHovered(null);
    captured = null;
    dragging = false;
    panning = true;
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

  function dispatchInner(type: PointerType, x: number, y: number, extras?: PointerExtras) {
      if (type === "scroll") {
        applyScroll(x, y, extras?.deltaY ?? 0);
        return;
      }

      if (type === "mousemove") {
        if (pressing && pressKind === "touch") {
          if (panning) {
            const dy = lastPanY - y;
            lastPanY = y;
            if (dy !== 0) applyScroll(x, y, dy);
            return;
          }
          if (!touchDecided) {
            const dx = x - pressX;
            const dy = y - pressY;
            if (dx * dx + dy * dy < TOUCH_SLOP * TOUCH_SLOP) {
              setHovered(hitTest(root, x, y));
              return;
            }
            touchDecided = true;
            const gestureDy = pressY - y;
            if (Math.abs(dy) >= Math.abs(dx) && canPanFrom(pressX, pressY, gestureDy)) {
              stealPressForPan();
              lastPanY = y;
              if (gestureDy !== 0) applyScroll(x, y, gestureDy);
              return;
            }
          }
        }

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
        rememberPress(extras, x, y);
        const hit = hitTest(root, x, y);
        dragging = false;
        setHovered(hit);
        if (!hit) {
          captured = null;
          focusManager.blur();
          return;
        }

        // A press inside a focus scope activates that scope (restoring its
        // last-focused node), even if the press is swallowed below — so
        // keyboard focus follows whatever the user clicked into.
        const scope = findScope(hit);
        if (scope !== focusManager.getActiveScope()) focusManager.setActiveScope(scope);

        if (runMouseDownCapture(hit, x, y)) {
          captured = null;
          touchDecided = true;
          return;
        }

        captured = hit;
        const { lx, ly } = localOf(hit, x, y);
        hit._eventHandlers.onMouseDown?.(lx, ly);
        const focusable = nearestFocusable(hit);
        if (focusable) focusManager.focus(focusable);
        else focusManager.blur();
        return;
      }

      if (type === "mouseup") {
        const cancel = extras?.cancel === true || panning;
        if (cancel) {
          setHovered(null);
          endPress();
          return;
        }
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
        const kind = pressKind;
        endPress();
        // A finger leaves no pointer. Do not keep the last box hovered.
        setHovered(kind === "touch" ? null : hit);
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
