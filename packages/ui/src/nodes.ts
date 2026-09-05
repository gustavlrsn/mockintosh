// -------------------------------------------------------------------------
// Layout style (Yoga-compatible subset)
// -------------------------------------------------------------------------

import type { GrafPort } from "@mockintosh/quickdraw";
import type { Sprite } from "./sprite";

export interface LayoutStyle {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  flexDirection?: "row" | "column";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  /** Cross-axis alignment of children. Defaults to "stretch" (flexbox). */
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  alignSelf?: "auto" | "flex-start" | "center" | "flex-end" | "stretch";
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | "auto";
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  gap?: number;
  position?: "relative" | "absolute";
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  /**
   * Clip children to this node's padding box (inside the border). "scroll"
   * additionally applies `scrollOffset`.
   */
  overflow?: "visible" | "hidden" | "scroll";
  /**
   * Border thickness. Participates in layout like CSS: the border insets the
   * padding box, so children are laid out inside it and can never sit on it.
   * Only takes effect when `borderColor` is set (default 1 in that case).
   */
  borderWidth?: number;
}

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// -------------------------------------------------------------------------
// Pattern names (1-bit dither patterns)
// -------------------------------------------------------------------------

export type PatternName =
  | "checker"
  | "gray75"
  | "gray50"
  | "gray25"
  | "hstripe"
  | "vstripe"
  | "dstripe"
  | "crosshatch"
  | "darkCheckers";

// -------------------------------------------------------------------------
// Event handler types
// -------------------------------------------------------------------------

export interface Modifiers {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

/**
 * Event delivered to `onMouseDownCapture` handlers. Coordinates are local to
 * the node whose handler is running (not the hit target).
 */
export interface PointerCaptureEvent {
  readonly localX: number;
  readonly localY: number;
  readonly globalX: number;
  readonly globalY: number;
  /** True once any capture handler has called `preventDefault()`. */
  readonly defaultPrevented: boolean;
  /**
   * Swallow the press: no further capture handlers run, the hit target never
   * receives `onMouseDown`, and the matching mouseup / click / drag are not
   * delivered either.
   */
  preventDefault(): void;
}

export interface MouseEventHandlers {
  onClick?: (localX: number, localY: number) => void;
  onDoubleClick?: (localX: number, localY: number) => void;
  onMouseDown?: (localX: number, localY: number) => void;
  /**
   * Capture-phase mousedown: runs on every ancestor of the hit target
   * (root-most first, target last) *before* the target's `onMouseDown`.
   * Lets a container enforce policy over its subtree — e.g. a window that
   * must activate before its content reacts to a click.
   */
  onMouseDownCapture?: (event: PointerCaptureEvent) => void;
  onMouseUp?: (localX: number, localY: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onDragStart?: (localX: number, localY: number, globalX: number, globalY: number) => void;
  onDrag?: (localX: number, localY: number, globalX: number, globalY: number) => void;
  onDragEnd?: (localX: number, localY: number, globalX: number, globalY: number) => void;
  onScroll?: (deltaY: number) => void;
  cursor?: string;
}

export interface KeyboardEventHandlers {
  onKeyDown?: (key: string, modifiers: Modifiers) => void;
  onKeyUp?: (key: string, modifiers: Modifiers) => void;
  onKeyPress?: (char: string) => void;
}

export interface FocusEventHandlers {
  onFocus?: () => void;
  onBlur?: () => void;
  tabIndex?: number;
  autoFocus?: boolean;
}

export type EventHandlers = MouseEventHandlers & KeyboardEventHandlers & FocusEventHandlers;

/** True if the node can be a pointer hit target (has any mouse handler or is focusable). */
export function hasMouseHandlers(h: EventHandlers): boolean {
  return !!(
    h.onClick ||
    h.onDoubleClick ||
    h.onMouseDown ||
    h.onMouseDownCapture ||
    h.onMouseUp ||
    h.onMouseEnter ||
    h.onMouseLeave ||
    h.onDragStart ||
    h.onDrag ||
    h.onDragEnd ||
    h.onScroll ||
    h.tabIndex !== undefined
  );
}

// -------------------------------------------------------------------------
// Hit mask — per-pixel mask for non-rectangular clickable regions
// -------------------------------------------------------------------------

export interface HitMask {
  /** 1 byte per pixel: 0 = not clickable, 1 = clickable */
  data: Uint8Array;
  width: number;
  height: number;
}

// -------------------------------------------------------------------------
// Hit rect (output of draw pass, consumed by host for event dispatch)
// -------------------------------------------------------------------------

export interface HitRect {
  rect: LayoutRect;
  handlers: EventHandlers;
  nodeId: number;
  zIndex: number;
  /** When set, only pixels with mask[y * width + x] !== 0 receive events. */
  hitMask?: HitMask;
}

// -------------------------------------------------------------------------
// Intrinsic element prop types
// -------------------------------------------------------------------------

/** A 1-bit pixel value: `0` = white, `1` = black. The screen has no other colours. */
export type Ink = 0 | 1;

export interface BoxProps extends LayoutStyle, EventHandlers {
  /** Solid ink or dither pattern name */
  background?: Ink | PatternName;
  borderColor?: Ink;
  /** default: "solid" */
  borderStyle?: "solid" | "dotted" | "dashed";
  borderRadius?: number;
  /** Transfer mode for fills and borders. */
  penMode?: "copy" | "xor";
  /** Skip this subtree in hit-testing (e.g. windows behind a modal). */
  inert?: boolean;
  /** Treat this node as a Tab-cycle / last-focus scope. */
  focusScope?: boolean;
  /** Vertical scroll offset in pixels (requires overflow="scroll") */
  scrollOffset?: number;
  /** Per-pixel hit mask — limits clickable area to non-zero mask pixels. */
  hitMask?: HitMask;
  children?: unknown;
}

export type TextAlign = "left" | "center" | "right";
export type TextVerticalAlign = "top" | "middle" | "bottom";

export interface TextProps extends LayoutStyle, EventHandlers {
  font?: string;
  color?: Ink;
  /** Solid background behind the text */
  background?: Ink;
  /**
   * Horizontal alignment of each line within this node's content box
   * (CSS `text-align`). Distinct from `alignSelf`, which positions the node
   * itself inside its parent.
   */
  align?: TextAlign;
  /** Vertical alignment of the line block within this node's content box. */
  verticalAlign?: TextVerticalAlign;
  /** Word-wrap lines to the node's content width. Explicit `\n` always breaks. */
  wrap?: boolean;
  /**
   * Draw text with a checkerboard overlay to simulate disabled/dimmed appearance.
   * Matches Classic Mac System's "grayed text" technique.
   */
  stipple?: boolean;
  children?: string;
}

export interface ImageProps extends LayoutStyle, EventHandlers {
  src: Sprite;
  mode?: "normal" | "inverted" | "outline";
}

export interface RasterPaintRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * What a `<raster>` gets handed each frame. Pixel access goes through this
 * surface so apps never depend on how the framebuffer is laid out in memory
 * (it is packed 1 bpp — see `packedBits.ts` in QuickDraw).
 *
 * `setPixel` / `blitPixels` / `fill` take raster-local coordinates and clip
 * to the raster. For anything more, `port` is the current QuickDraw port
 * (already clipped to `rect`); offset QuickDraw coordinates by `rect.x` /
 * `rect.y`.
 */
export interface RasterSurface {
  readonly port: GrafPort;
  /** The raster's box in port coordinates. */
  readonly rect: RasterPaintRect;
  /** Set one pixel; out-of-range writes are ignored. */
  setPixel(x: number, y: number, ink: Ink): void;
  /**
   * Copy a 1-byte-per-pixel buffer (`0` = white, non-zero = black, rows
   * `width` apart) into the raster with its top-left at local `(x, y)`.
   */
  blitPixels(pixels: Uint8Array, width: number, height: number, x?: number, y?: number): void;
  /** Paint the whole raster one ink. */
  fill(ink: Ink): void;
}

/** Immediate-mode paint callback for `<raster onPaint>`. */
export type RasterPaintFn = (surface: RasterSurface) => void;

export interface RasterProps extends LayoutStyle, EventHandlers {
  onPaint?: RasterPaintFn;
  /**
   * Bump to repaint. `onPaint` runs at paint time, outside any reactive scope,
   * so a raster whose pixels come from elsewhere (a camera, a decoder) sets
   * `revision` from a signal to have the frame redrawn when the source changes.
   */
  revision?: number;
}

// -------------------------------------------------------------------------
// CanvasNode — the internal tree node
// -------------------------------------------------------------------------

let nextNodeId = 1;

export type NodeType = "box" | "text" | "image" | "raster" | "_root" | "_text_content";

export interface CanvasNode {
  id: number;
  type: NodeType;
  props: Record<string, unknown>;
  style: LayoutStyle;
  layout: LayoutRect;
  children: CanvasNode[];
  parent: CanvasNode | null;
  /** Text content for `_text_content` nodes (Solid text nodes). */
  textContent: string;
  _dirty: boolean;
  _eventHandlers: EventHandlers;
  _scrollOffset: number;
}

export function createNode(type: NodeType): CanvasNode {
  return {
    id: nextNodeId++,
    type,
    props: {},
    style: {},
    layout: { x: 0, y: 0, width: 0, height: 0 },
    children: [],
    parent: null,
    textContent: "",
    _dirty: true,
    _eventHandlers: {},
    _scrollOffset: 0,
  };
}

export function markDirty(node: CanvasNode): void {
  let n: CanvasNode | null = node;
  while (n) {
    n._dirty = true;
    n = n.parent;
  }
}

/**
 * Insert `node` into `parent` before `anchor` (or at the end).
 *
 * DOM `insertBefore` semantics: a node that is already attached — to this
 * parent or another — is detached first, so the call *moves* it. Solid's
 * control flow (`<For>` reordering) relies on this; without it, reordering
 * leaves duplicate references in `children`.
 */
export function insertChild(
  parent: CanvasNode,
  node: CanvasNode,
  anchor: CanvasNode | null
): void {
  if (anchor === node) return;
  if (node.parent) removeChild(node.parent, node);

  node.parent = parent;
  if (anchor === null) {
    parent.children.push(node);
  } else {
    const idx = parent.children.indexOf(anchor);
    if (idx === -1) {
      parent.children.push(node);
    } else {
      parent.children.splice(idx, 0, node);
    }
  }
  markDirty(parent);
}

export function removeChild(parent: CanvasNode, node: CanvasNode): void {
  const idx = parent.children.indexOf(node);
  if (idx !== -1) {
    parent.children.splice(idx, 1);
    node.parent = null;
    markDirty(parent);
  }
}

// -------------------------------------------------------------------------
// Prop classification helpers
// -------------------------------------------------------------------------

export const LAYOUT_PROP_NAMES = new Set<string>([
  "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "flexDirection", "justifyContent", "alignItems", "alignSelf",
  "flexGrow", "flexShrink", "flexBasis",
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "gap", "position", "top", "left", "right", "bottom", "overflow",
  "borderWidth",
]);

/**
 * Effective border thickness of a node: the drawn border (`borderColor` set)
 * with `borderWidth` defaulting to 1. Shared by layout, draw and hit-testing so
 * the three can never disagree about where the padding box starts.
 */
export function resolveBorderWidth(node: CanvasNode): number {
  if (node.type !== "box") return 0;
  if (node.props["borderColor"] === undefined) return 0;
  return Math.max(0, node.style.borderWidth ?? 1);
}

export const EVENT_PROP_NAMES = new Set<string>([
  "onClick", "onDoubleClick", "onMouseDown", "onMouseDownCapture", "onMouseUp",
  "onMouseEnter", "onMouseLeave", "onDragStart", "onDrag", "onDragEnd",
  "onScroll",
  "onKeyDown", "onKeyUp", "onKeyPress",
  "onFocus", "onBlur", "tabIndex", "autoFocus", "cursor",
]);

export function setNodeProperty(node: CanvasNode, name: string, value: unknown): void {
  if (name === "scrollOffset") {
    node._scrollOffset = (value as number) || 0;
    markDirty(node);
    return;
  }
  if (LAYOUT_PROP_NAMES.has(name)) {
    (node.style as Record<string, unknown>)[name] = value;
    markDirty(node);
  } else if (EVENT_PROP_NAMES.has(name)) {
    (node._eventHandlers as Record<string, unknown>)[name] = value;
  } else {
    node.props[name] = value;
    markDirty(node);
  }
}
