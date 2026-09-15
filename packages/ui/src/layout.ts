/**
 * Flexbox layout engine — pure TypeScript, zero dependencies.
 *
 * Implements a Yoga-compatible subset of CSS Flexbox.
 * The single entry point `computeLayout(root, w, h, measure)` populates
 * `node.layout` (LayoutRect) on every node in the tree.
 *
 * Algorithm: 3-pass
 *   1. Top-down sizing   — propagate available space, resolve fixed/% sizes
 *   2. Bottom-up measure — leaf nodes call MeasureFunc; parents accumulate
 *   3. Top-down position — distribute flex, apply alignment, place absolutely
 */

import { resolveBorderWidth, type CanvasNode } from "./nodes";
import type { LayoutStyle, LayoutRect } from "./nodes";

export type { LayoutStyle, LayoutRect };

/** Flexbox default: children fill the cross axis unless sized or aligned explicitly. */
const DEFAULT_ALIGN_ITEMS: NonNullable<LayoutStyle["alignItems"]> = "stretch";

export type MeasureFunc = (
  node: CanvasNode,
  availableWidth: number,
  availableHeight: number
) => { width: number; height: number };

// -------------------------------------------------------------------------
// Padding / margin helpers
// -------------------------------------------------------------------------

interface Edges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function resolvePadding(s: LayoutStyle): Edges {
  const base = s.padding ?? 0;
  return {
    top: s.paddingTop ?? base,
    right: s.paddingRight ?? base,
    bottom: s.paddingBottom ?? base,
    left: s.paddingLeft ?? base,
  };
}

/**
 * Inset from the border box to the content box: border + padding on each side.
 * Relative (flow) children are laid out inside this inset.
 */
function resolveContentInset(node: CanvasNode): Edges {
  const pad = resolvePadding(node.style);
  const bw = resolveBorderWidth(node);
  return {
    top: pad.top + bw,
    right: pad.right + bw,
    bottom: pad.bottom + bw,
    left: pad.left + bw,
  };
}

function resolveMargin(s: LayoutStyle): Edges {
  const base = s.margin ?? 0;
  return {
    top: s.marginTop ?? base,
    right: s.marginRight ?? base,
    bottom: s.marginBottom ?? base,
    left: s.marginLeft ?? base,
  };
}

function resolveSize(
  value: number | `${number}%` | undefined,
  available: number | undefined
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  // percentage
  const pct = parseFloat(value) / 100;
  return available !== undefined ? available * pct : undefined;
}

// -------------------------------------------------------------------------
// Intrinsic content size
// -------------------------------------------------------------------------

/**
 * Fill in `node.layout.width / height` from explicit style or MeasureFunc.
 * Does NOT position the node — only sets its own size.
 */
function measureNode(
  node: CanvasNode,
  availableWidth: number,
  availableHeight: number,
  measure: MeasureFunc
): void {
  const s = node.style;
  const pad = resolvePadding(s);

  const explicitW = resolveSize(s.width, availableWidth);
  const explicitH = resolveSize(s.height, availableHeight);

  if (node.type === "_root" || node.type === "box") {
    // _root always fills the container (it represents the viewport)
    if (node.type === "_root") {
      node.layout.width = availableWidth;
      node.layout.height = availableHeight;
    } else {
      if (explicitW !== undefined) node.layout.width = clamp(explicitW, s);
      if (explicitH !== undefined) node.layout.height = clamp(explicitH, s, "height");
    }

    // Flow children live in the content box (inside border + padding);
    // absolute children are sized against the padding box (inside border).
    const inset = resolveContentInset(node);
    const bw = resolveBorderWidth(node);
    const isRoot = node.type === "_root";
    const contentW = isRoot
      ? availableWidth
      : explicitW !== undefined ? Math.max(0, explicitW - inset.left - inset.right) : availableWidth;
    const contentH = isRoot
      ? availableHeight
      : explicitH !== undefined ? Math.max(0, explicitH - inset.top - inset.bottom) : availableHeight;
    const paddingBoxW = isRoot
      ? availableWidth
      : explicitW !== undefined ? Math.max(0, explicitW - 2 * bw) : availableWidth;
    const paddingBoxH = isRoot
      ? availableHeight
      : explicitH !== undefined ? Math.max(0, explicitH - 2 * bw) : availableHeight;

    // Recurse to size children first
    const relativeChildren = node.children.filter(
      (c) => (c.style.position ?? "relative") === "relative"
    );
    const absoluteChildren = node.children.filter(
      (c) => c.style.position === "absolute"
    );

    for (const child of relativeChildren) {
      measureNode(child, contentW, contentH, measure);
    }
    for (const child of absoluteChildren) {
      measureNode(child, paddingBoxW, paddingBoxH, measure);
    }

    // If no explicit width/height, derive from children (flex axis).
    // _root always uses the container size (set above).
    if (!isRoot) {
      if (explicitW === undefined) {
        const w = deriveContainerSize(node, "cross-or-main", "width", inset);
        node.layout.width = clamp(w, s);
      }
      if (explicitH === undefined) {
        const h = deriveContainerSize(node, "cross-or-main", "height", inset);
        node.layout.height = clamp(h, s, "height");
      }
    }
  } else if (
    node.type === "text" ||
    node.type === "image" ||
    node.type === "raster" ||
    node.type === "bitmap" ||
    node.type === "_text_content"
  ) {
    if (node.type === "text") {
      // Text is measured against its content box so wrapping respects padding
      // and an explicit width.
      const contentW = Math.max(0, (explicitW ?? availableWidth) - pad.left - pad.right);
      const contentH = Math.max(0, (explicitH ?? availableHeight) - pad.top - pad.bottom);
      const measured = measure(node, contentW, contentH);
      node.layout.width = clamp(explicitW ?? (measured.width + pad.left + pad.right), s);
      node.layout.height = clamp(explicitH ?? (measured.height + pad.top + pad.bottom), s, "height");
    } else {
      const measured = measure(node, availableWidth, availableHeight);
      node.layout.width = clamp(explicitW ?? measured.width, s);
      node.layout.height = clamp(explicitH ?? measured.height, s, "height");
    }
  }
}

/** `pad` is the full content inset (border + padding). */
function deriveContainerSize(
  node: CanvasNode,
  _axis: string,
  dim: "width" | "height",
  pad: Edges
): number {
  const s = node.style;
  const dir = s.flexDirection ?? "column";
  const isRow = dir === "row";
  const isMainAxis = (dim === "width" && isRow) || (dim === "height" && !isRow);

  const relativeChildren = node.children.filter(
    (c) => (c.style.position ?? "relative") === "relative"
  );

  if (relativeChildren.length === 0) {
    return dim === "width" ? pad.left + pad.right : pad.top + pad.bottom;
  }

  const gap = s.gap ?? 0;

  if (isMainAxis) {
    // Sum along main axis
    let total = 0;
    for (let i = 0; i < relativeChildren.length; i++) {
      const child = relativeChildren[i];
      const margin = resolveMargin(child.style);
      total +=
        dim === "width"
          ? child.layout.width + margin.left + margin.right
          : child.layout.height + margin.top + margin.bottom;
      if (i < relativeChildren.length - 1) total += gap;
    }
    return (dim === "width" ? pad.left + pad.right : pad.top + pad.bottom) + total;
  } else {
    // Max along cross axis
    let maxSize = 0;
    for (const child of relativeChildren) {
      const margin = resolveMargin(child.style);
      const childSize =
        dim === "width"
          ? child.layout.width + margin.left + margin.right
          : child.layout.height + margin.top + margin.bottom;
      maxSize = Math.max(maxSize, childSize);
    }
    return (dim === "width" ? pad.left + pad.right : pad.top + pad.bottom) + maxSize;
  }
}

function clamp(
  value: number,
  s: LayoutStyle,
  axis: "width" | "height" = "width"
): number {
  if (axis === "width") {
    const min = s.minWidth ?? 0;
    const max = s.maxWidth ?? Infinity;
    return Math.max(min, Math.min(max, Math.max(0, value)));
  } else {
    const min = s.minHeight ?? 0;
    const max = s.maxHeight ?? Infinity;
    return Math.max(min, Math.min(max, Math.max(0, value)));
  }
}

// -------------------------------------------------------------------------
// Position pass (top-down, assigns x/y to each node)
// -------------------------------------------------------------------------

function positionNode(
  node: CanvasNode,
  originX: number,
  originY: number,
  containerWidth: number,
  containerHeight: number
): void {
  // Snap to the pixel grid. Centering, percentages and space-* distribution
  // can yield fractions; QuickDraw draws nothing at half-pixels, so every node
  // lands on whole coordinates (Yoga does the same pixel rounding).
  node.layout.x = Math.floor(originX);
  node.layout.y = Math.floor(originY);
  node.layout.width = Math.round(node.layout.width);
  node.layout.height = Math.round(node.layout.height);

  if (node.type !== "_root" && node.type !== "box") return;

  const s = node.style;
  const inset = resolveContentInset(node);
  const bw = resolveBorderWidth(node);
  const dir = s.flexDirection ?? "column";
  const isRow = dir === "row";
  const gap = s.gap ?? 0;

  // Content box — where flow children go.
  const innerX = originX + inset.left;
  const innerY = originY + inset.top;
  const innerW = Math.max(0, node.layout.width - inset.left - inset.right);
  const innerH = Math.max(0, node.layout.height - inset.top - inset.bottom);

  // Separate relative and absolute children
  const relativeChildren = node.children.filter(
    (c) => (c.style.position ?? "relative") === "relative"
  );
  const absoluteChildren = node.children.filter(
    (c) => c.style.position === "absolute"
  );

  // --- Flex layout for relative children ---
  // flexBasis (when a number) replaces the measured main size before grow/shrink.
  // flexShrink defaults to 0 so existing layouts that omit it stay stable,
  // except overflow:scroll/hidden — CSS treats those as min-size 0 and they
  // must shrink or the pane grows with its content and never scrolls.
  function flexShrinkOf(child: CanvasNode): number {
    if (child.style.flexShrink !== undefined) return child.style.flexShrink;
    const overflow = child.style.overflow;
    return overflow === "scroll" || overflow === "hidden" ? 1 : 0;
  }

  function baseMainSize(child: CanvasNode): number {
    const margin = resolveMargin(child.style);
    const basis = child.style.flexBasis;
    const content = isRow
      ? child.layout.width + margin.left + margin.right
      : child.layout.height + margin.top + margin.bottom;
    if (typeof basis === "number") {
      return isRow
        ? basis + margin.left + margin.right
        : basis + margin.top + margin.bottom;
    }
    return content;
  }

  let totalFixed = 0;
  let totalFlexGrow = 0;
  let totalFlexShrink = 0;

  for (let i = 0; i < relativeChildren.length; i++) {
    const child = relativeChildren[i];
    const fg = child.style.flexGrow ?? 0;
    const fs = flexShrinkOf(child);
    const childMainSize = baseMainSize(child);
    // Include grow items' base size (content / padding / flex-basis). Free
    // space is what remains after every sibling — CSS flexbox's hypothetical
    // main size. Skipping it made `flexGrow` panes with padding overflow and
    // clip a following fixed row (ChatGippity's compose bar).
    totalFixed += childMainSize;
    totalFlexGrow += fg;
    totalFlexShrink += fs;
    if (i < relativeChildren.length - 1) totalFixed += gap;
  }

  const availableMain = isRow ? innerW : innerH;
  const remainingSpace = availableMain - totalFixed;
  const growUnit = totalFlexGrow > 0 && remainingSpace > 0 ? remainingSpace / totalFlexGrow : 0;

  const childMainSizes: number[] = relativeChildren.map((child) => {
    const margin = resolveMargin(child.style);
    const fg = child.style.flexGrow ?? 0;
    const fs = flexShrinkOf(child);
    const base = baseMainSize(child);
    if (fg > 0 && remainingSpace > 0) {
      return base + growUnit * fg;
    }
    if (fs > 0 && remainingSpace < 0 && totalFlexShrink > 0) {
      const share = (fs / totalFlexShrink) * -remainingSpace;
      const minMain = isRow
        ? (child.style.minWidth ?? 0) + margin.left + margin.right
        : (child.style.minHeight ?? 0) + margin.top + margin.bottom;
      return Math.max(minMain, base - share);
    }
    return base;
  });

  // justifyContent: distribute along main axis
  const justify = s.justifyContent ?? "flex-start";
  let cursor = 0;
  let extraGap = gap;

  if (justify === "center") {
    const totalSize = childMainSizes.reduce((a, b) => a + b, 0) + gap * (relativeChildren.length - 1);
    cursor = Math.max(0, Math.floor((availableMain - totalSize) / 2));
  } else if (justify === "flex-end") {
    const totalSize = childMainSizes.reduce((a, b) => a + b, 0) + gap * (relativeChildren.length - 1);
    cursor = Math.max(0, availableMain - totalSize);
  } else if (justify === "space-between") {
    const totalSize = childMainSizes.reduce((a, b) => a + b, 0);
    const spaces = relativeChildren.length - 1;
    extraGap = spaces > 0 ? Math.max(gap, (availableMain - totalSize) / spaces) : 0;
    cursor = 0;
  } else if (justify === "space-around") {
    const totalSize = childMainSizes.reduce((a, b) => a + b, 0);
    const spaces = relativeChildren.length;
    const space = (availableMain - totalSize) / (spaces * 2);
    cursor = Math.max(0, space);
    extraGap = Math.max(gap, space * 2);
  }

  // Position each relative child
  for (let i = 0; i < relativeChildren.length; i++) {
    const child = relativeChildren[i];
    const margin = resolveMargin(child.style);
    const childMainSize = childMainSizes[i];
    const fg = child.style.flexGrow ?? 0;
    const fs = child.style.flexShrink ?? 0;

    // Apply grow / shrink / flexBasis to the child's laid-out main size
    if (fg > 0 || fs > 0 || typeof child.style.flexBasis === "number") {
      if (isRow) {
        child.layout.width = clamp(Math.max(0, childMainSize - margin.left - margin.right), child.style);
      } else {
        child.layout.height = clamp(Math.max(0, childMainSize - margin.top - margin.bottom), child.style, "height");
      }
      childMainSizes[i] = isRow
        ? child.layout.width + margin.left + margin.right
        : child.layout.height + margin.top + margin.bottom;
    }

    // Resolve alignSelf / alignItems (cross axis).
    // Default is "stretch" (flexbox / Yoga): a child with an auto cross size
    // fills the container's cross axis, so `<text align="center">` centers
    // within its parent without a manual width.
    const crossAxisAvailable = isRow ? innerH : innerW;
    const align =
      child.style.alignSelf === "auto" || child.style.alignSelf === undefined
        ? s.alignItems ?? DEFAULT_ALIGN_ITEMS
        : child.style.alignSelf;

    let crossOffset = 0;
    const childCrossSize = isRow
      ? child.layout.height + margin.top + margin.bottom
      : child.layout.width + margin.left + margin.right;

    if (align === "center") {
      crossOffset = Math.max(0, Math.floor((crossAxisAvailable - childCrossSize) / 2));
    } else if (align === "flex-end") {
      crossOffset = Math.max(0, crossAxisAvailable - childCrossSize);
    } else if (align === "stretch") {
      // Only an auto cross size stretches; explicit width/height wins.
      const crossExplicit = isRow ? child.style.height : child.style.width;
      if (crossExplicit === undefined) {
        if (isRow) {
          child.layout.height = clamp(
            Math.max(0, crossAxisAvailable - margin.top - margin.bottom),
            child.style,
            "height"
          );
        } else {
          child.layout.width = clamp(
            Math.max(0, crossAxisAvailable - margin.left - margin.right),
            child.style
          );
        }
      }
    }

    let childX: number;
    let childY: number;

    if (isRow) {
      childX = innerX + cursor + margin.left;
      childY = innerY + crossOffset + margin.top;
    } else {
      childX = innerX + crossOffset + margin.left;
      childY = innerY + cursor + margin.top;
    }

    positionNode(child, childX, childY, child.layout.width, child.layout.height);
    cursor += childMainSize + (i < relativeChildren.length - 1 ? extraGap : 0);
  }

  // Position absolute children relative to the padding box (inside the
  // border), as CSS does. Without left/right (top/bottom) they fall back to
  // the content-box origin.
  const padX = originX + bw;
  const padY = originY + bw;
  const padW = Math.max(0, node.layout.width - 2 * bw);
  const padH = Math.max(0, node.layout.height - 2 * bw);
  for (const child of absoluteChildren) {
    const as = child.style;
    const margin = resolveMargin(as);
    let childX = innerX + margin.left;
    let childY = innerY + margin.top;

    if (as.left !== undefined) childX = padX + as.left;
    else if (as.right !== undefined)
      childX = padX + padW - as.right - child.layout.width;

    if (as.top !== undefined) childY = padY + as.top;
    else if (as.bottom !== undefined)
      childY = padY + padH - as.bottom - child.layout.height;

    positionNode(child, childX, childY, child.layout.width, child.layout.height);
  }
}

// -------------------------------------------------------------------------
// Public entry point
// -------------------------------------------------------------------------

/**
 * Compute layout for the entire tree.
 *
 * Populates `node.layout` (x, y, width, height) on every node.
 * This is the single point to swap for Yoga: replace this function's body
 * with Yoga calls using the same `CanvasNode` tree.
 */
export function computeLayout(
  root: CanvasNode,
  containerWidth: number,
  containerHeight: number,
  measure: MeasureFunc
): void {
  measureNode(root, containerWidth, containerHeight, measure);
  positionNode(root, 0, 0, containerWidth, containerHeight);
  root._dirty = false;
}
