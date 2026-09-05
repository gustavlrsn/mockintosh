/**
 * Draw pipeline — walks the CanvasNode tree and issues QuickDraw calls.
 *
 * Order:
 *   1. computeLayout(root, w, h, measureFunc) populates node.layout
 *   2. eraseAll() clears the pixel buffer to white
 *   3. drawTree(root, port) renders every node (offsets, no layout mutation)
 *   4. collectHitRects(root) extracts HitRect[] for tests / host fallbacks
 */

import {
  type GrafPort,
  type BitMap,
  type RgnHandle,
  type Rect,
  SetPort,
  ClipRect,
  CopyBits,
  ForeColor,
  MoveTo,
  DrawString,
  PaintRect,
  EraseRect,
  FrameRect,
  FrameRoundRect,
  FillRect,
  makeRect,
  cloneRect,
  globals,
  blackColor,
  whiteColor,
  patCopy,
  patBic,
  patXor,
  srcCopy,
  srcOr,
  srcBic,
  PenPat,
  PenMode,
  PenNormal,
} from "@mockintosh/quickdraw";
import {
  hasMouseHandlers,
  resolveBorderWidth,
  type CanvasNode,
  type HitRect,
  type HitMask,
  type PatternName,
  type ImageSource,
  type RasterPaintFn,
  type TextAlign,
  type TextVerticalAlign,
} from "./nodes";
import type { FocusManager } from "./focus";
import { requireFont } from "./fonts/registry";
import { layoutText } from "./fonts/textLayout";

// -------------------------------------------------------------------------
// Pattern data — 8x8 bitmaps for dither fills
// -------------------------------------------------------------------------

const PATTERNS: Record<PatternName, Uint8Array> = {
  checker:    new Uint8Array([0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]),
  gray50:     new Uint8Array([0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]),
  gray75:     new Uint8Array([0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd]),
  gray25:     new Uint8Array([0x88, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x22]),
  hstripe:    new Uint8Array([0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00]),
  vstripe:    new Uint8Array([0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa]),
  dstripe:    new Uint8Array([0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01]),
  crosshatch: new Uint8Array([0xff, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80]),
  darkCheckers: new Uint8Array([0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa]),
};

// -------------------------------------------------------------------------
// Port helpers
// -------------------------------------------------------------------------

interface PortWithMeta extends GrafPort {
  _uiFontName?: string;
  _uiTextColor?: number;
}

export interface DrawContext {
  port: PortWithMeta;
  focusManager: FocusManager | null;
  width: number;
  height: number;
}

/** Inline equivalent of the private `makeRegion` in grafport.ts */
function _makeRgn(r: Rect): RgnHandle {
  return { rgn: { rgnSize: 10, rgnBBox: cloneRect(r) } };
}

export function createDrawContext(
  pixels: Uint8Array,
  width: number,
  height: number
): DrawContext {
  const bounds = makeRect(0, 0, height, width);
  const port: PortWithMeta = {
    device: 0,
    portBits: { baseAddr: pixels, rowBytes: width, bounds: cloneRect(bounds) },
    portRect: cloneRect(bounds),
    visRgn: _makeRgn(cloneRect(bounds)),
    clipRgn: _makeRgn(makeRect(-32767, -32767, 32767, 32767)),
    bkPat: new Uint8Array(8),
    fillPat: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
    pnLoc: { v: 0, h: 0 },
    pnSize: { v: 1, h: 1 },
    pnMode: patCopy,
    pnPat: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
    pnVis: 0,
    txFont: 0,
    txFace: 0,
    txMode: 1,
    txSize: 0,
    spExtra: 0,
    fgColor: blackColor,
    bkColor: whiteColor,
    colrBit: 0,
    patStretch: 0,
    picSave: null,
    rgnSave: null,
    polySave: null,
    grafProcs: null,
  };
  SetPort(port);
  return { port, focusManager: null, width, height };
}

// -------------------------------------------------------------------------
// Color fills — palette indices write directly (QD PaintRect is 1-bit)
// -------------------------------------------------------------------------

function fillIndexed(
  port: PortWithMeta,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  const { baseAddr, rowBytes, bounds } = port.portBits;
  const clip = port.clipRgn?.rgn.rgnBBox;
  const vis = port.visRgn?.rgn.rgnBBox;
  const pr = port.portRect;
  const x0 = Math.max(x, clip?.left ?? x, vis?.left ?? x, pr.left, bounds.left);
  const y0 = Math.max(y, clip?.top ?? y, vis?.top ?? y, pr.top, bounds.top);
  const x1 = Math.min(x + w, clip?.right ?? x + w, vis?.right ?? x + w, pr.right, bounds.right);
  const y1 = Math.min(y + h, clip?.bottom ?? y + h, vis?.bottom ?? y + h, pr.bottom, bounds.bottom);
  const idx = color & 0xff;
  for (let py = y0; py < y1; py++) {
    const row = (py - bounds.top) * rowBytes - bounds.left;
    for (let px = x0; px < x1; px++) {
      baseAddr[row + px] = idx;
    }
  }
}

function applyPenMode(port: PortWithMeta, penMode: "copy" | "xor" | undefined): void {
  if (penMode === "xor") PenMode(patXor);
  else PenNormal();
}

function fillBackground(
  port: PortWithMeta,
  r: ReturnType<typeof makeRect>,
  background: number | PatternName,
  penMode: "copy" | "xor" | undefined
): void {
  applyPenMode(port, penMode);
  if (typeof background === "number") {
    if (background === 0 && penMode !== "xor") {
      EraseRect(r);
    } else if (background === 1 || penMode === "xor") {
      if (background === 1 || background === 0) {
        PenNormal();
        if (penMode === "xor") PenMode(patXor);
        if (background === 0) PenPat(globals.white);
        PaintRect(r);
        PenNormal();
      } else {
        fillIndexed(port, r.left, r.top, r.right - r.left, r.bottom - r.top, background);
      }
    } else {
      fillIndexed(port, r.left, r.top, r.right - r.left, r.bottom - r.top, background);
    }
  } else {
    const pat = PATTERNS[background] ?? PATTERNS.checker;
    FillRect(r, pat);
  }
  PenNormal();
}

// -------------------------------------------------------------------------
// Draw
// -------------------------------------------------------------------------

export function drawTree(root: CanvasNode, ctx: DrawContext): void {
  SetPort(ctx.port);
  EraseRect(makeRect(0, 0, ctx.height, ctx.width));
  PenNormal();
  ForeColor(blackColor);
  drawNode(root, ctx, 0, 0, 0);
}

function drawNode(
  node: CanvasNode,
  ctx: DrawContext,
  zIndex: number,
  ox: number,
  oy: number
): void {
  if (node.type === "_text_content") return;

  if (node.type === "_root") {
    for (const child of node.children) drawNode(child, ctx, zIndex, ox, oy);
    return;
  }

  const x = node.layout.x + ox;
  const y = node.layout.y + oy;
  const { width, height } = node.layout;
  const port = ctx.port;
  const r = makeRect(y, x, y + height, x + width);
  const overflow = node.style.overflow;
  const clips = overflow === "hidden" || overflow === "scroll";
  const childOy = overflow === "scroll" ? oy - node._scrollOffset : oy;

  if (node.type === "box") drawBox(node, ctx, r, x, y, width, height);
  else if (node.type === "text") drawText(node, ctx, x, y, width, height);
  else if (node.type === "image") drawImage(node, ctx, x, y, width, height);
  else if (node.type === "raster") drawRaster(node, ctx, x, y, width, height);

  if (clips) {
    const savedClip = port.clipRgn
      ? { ...port.clipRgn, rgn: { ...port.clipRgn.rgn, rgnBBox: { ...port.clipRgn.rgn.rgnBBox } } }
      : null;
    // Clip to the padding box so children can never paint over the border.
    const bw = resolveBorderWidth(node);
    const clipRect = makeRect(y + bw, x + bw, y + height - bw, x + width - bw);
    const prev = savedClip?.rgn.rgnBBox;
    ClipRect(
      prev
        ? makeRect(
            Math.max(prev.top, clipRect.top),
            Math.max(prev.left, clipRect.left),
            Math.min(prev.bottom, clipRect.bottom),
            Math.min(prev.right, clipRect.right)
          )
        : clipRect
    );
    for (const child of node.children) drawNode(child, ctx, zIndex + 1, ox, childOy);
    if (savedClip) ClipRect(savedClip.rgn.rgnBBox);
    else ClipRect(makeRect(-32767, -32767, 32767, 32767));
    return;
  }

  for (const child of node.children) drawNode(child, ctx, zIndex + 1, ox, oy);
}

function drawBox(
  node: CanvasNode,
  ctx: DrawContext,
  r: ReturnType<typeof makeRect>,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const { background, borderColor, borderStyle, borderRadius, penMode } =
    node.props as {
      background?: number | PatternName;
      borderColor?: number;
      borderStyle?: "solid" | "dotted" | "dashed";
      borderRadius?: number;
      penMode?: "copy" | "xor";
    };

  if (background !== undefined) {
    fillBackground(ctx.port, r, background, penMode);
  }

  const bw = resolveBorderWidth(node);
  if (borderColor !== undefined && bw > 0) {
    const radius = borderRadius ?? 0;
    applyPenMode(ctx.port, penMode);

    if (borderColor === 0) {
      PenPat(globals.white);
    } else if (borderColor === 1) {
      PenNormal();
      if (penMode === "xor") PenMode(patXor);
    } else {
      // Palette-index border: draw as indexed pixels on the four edges.
      fillIndexed(ctx.port, x, y, width, bw, borderColor);
      fillIndexed(ctx.port, x, y + height - bw, width, bw, borderColor);
      fillIndexed(ctx.port, x, y, bw, height, borderColor);
      fillIndexed(ctx.port, x + width - bw, y, bw, height, borderColor);
      PenNormal();
      return;
    }

    if (borderStyle === "dotted" || borderStyle === "dashed") {
      drawDashedBorder({ x, y, width, height }, borderStyle, bw);
    } else {
      for (let i = 0; i < bw; i++) {
        const inset = makeRect(r.top + i, r.left + i, r.bottom - i, r.right - i);
        if (radius > 0) FrameRoundRect(inset, radius, radius);
        else FrameRect(inset);
      }
    }
    PenNormal();
  }
}

function drawDashedBorder(
  layout: { x: number; y: number; width: number; height: number },
  style: "dotted" | "dashed",
  bw: number
): void {
  const { x, y, width, height } = layout;
  const step = style === "dotted" ? 2 : 6;
  const on = style === "dotted" ? 1 : 3;

  for (let e = 0; e < 4; e++) {
    let px = 0, py = 0, len = 0;
    if (e === 0) { px = x; py = y; len = width; }
    else if (e === 1) { px = x + width - bw; py = y; len = height; }
    else if (e === 2) { px = x; py = y + height - bw; len = width; }
    else { px = x; py = y; len = height; }

    let pos = 0;
    const horizontal = e === 0 || e === 2;
    while (pos < len) {
      const segEnd = Math.min(pos + on, len);
      const r = horizontal
        ? makeRect(py, px + pos, py + bw, px + segEnd)
        : makeRect(py + pos, px, py + segEnd, px + bw);
      PaintRect(r);
      pos += step;
    }
  }
}

function drawText(
  node: CanvasNode,
  ctx: DrawContext,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const port = ctx.port as PortWithMeta;
  const fontName = (node.props["font"] as string | undefined) ?? "body";
  const color = (node.props["color"] as number | undefined) ?? 1;
  const align = (node.props["align"] as TextAlign | undefined) ?? "left";
  const verticalAlign =
    (node.props["verticalAlign"] as TextVerticalAlign | undefined) ?? "top";
  const wrap = (node.props["wrap"] as boolean | undefined) ?? false;
  const background = node.props["background"] as number | undefined;
  const stipple = (node.props["stipple"] as boolean | undefined) ?? false;

  if (background !== undefined) {
    const bgRect = makeRect(y, x, y + height, x + width);
    if (background === 0) EraseRect(bgRect);
    else if (background === 1) {
      PenNormal();
      PaintRect(bgRect);
    } else {
      fillIndexed(port, x, y, width, height, background);
    }
  }

  port._uiFontName = fontName;
  port._uiTextColor = color;

  const text = collectText(node);
  if (!text) return;

  const s = node.style;
  const padLeft = s.paddingLeft ?? s.padding ?? 0;
  const padRight = s.paddingRight ?? s.padding ?? 0;
  const padTop = s.paddingTop ?? s.padding ?? 0;
  const padBottom = s.paddingBottom ?? s.padding ?? 0;
  const innerX = x + padLeft;
  const innerY = y + padTop;
  const innerW = Math.max(0, width - padLeft - padRight);
  const innerH = Math.max(0, height - padTop - padBottom);

  // Same line breaking as the measure pass, so drawn geometry matches layout.
  const block = layoutText(requireFont(fontName), text, wrap ? innerW : undefined);

  let lineY = innerY;
  if (verticalAlign === "middle") lineY = innerY + Math.floor((innerH - block.height) / 2);
  else if (verticalAlign === "bottom") lineY = innerY + innerH - block.height;

  for (const line of block.lines) {
    if (line.text) {
      let lineX = innerX;
      if (align === "center") lineX = innerX + Math.floor((innerW - line.width) / 2);
      else if (align === "right") lineX = innerX + innerW - line.width;
      MoveTo(lineX, lineY);
      DrawString(line.text);
    }
    lineY += block.lineHeight;
  }

  if (stipple) {
    const r = makeRect(y, x, y + height, x + width);
    PenPat(globals.gray);
    PenMode(patBic);
    PaintRect(r);
    PenNormal();
  }
}

function collectText(node: CanvasNode): string {
  if (node.type === "_text_content") return node.textContent;
  return node.children.map(collectText).join("");
}

function makeBitMap(data: Uint8Array, w: number, h: number): BitMap {
  return { baseAddr: data, rowBytes: w, bounds: makeRect(0, 0, h, w) };
}

function drawImage(
  node: CanvasNode,
  ctx: DrawContext,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const src = node.props["src"] as ImageSource | undefined;
  const mode = (node.props["mode"] as string | undefined) ?? "normal";
  if (!src) return;

  const pw = Math.min(src.width, width);
  const ph = Math.min(src.height, height);
  const srcRect = makeRect(0, 0, ph, pw);
  const dstRect = makeRect(y, x, y + ph, x + pw);

  let pixelBM: BitMap;

  if (mode === "outline") {
    const buf = new Uint8Array(src.width * src.height);
    const d = src.data;
    for (let sy = 0; sy < src.height; sy++) {
      for (let sx = 0; sx < src.width; sx++) {
        const si = sy * src.width + sx;
        if (src.mask && !src.mask[si]) continue;
        if (!d[si]) continue;
        const isEdge =
          sx === 0 || !d[si - 1] ||
          sx === src.width - 1 || !d[si + 1] ||
          sy === 0 || !d[si - src.width] ||
          sy === src.height - 1 || !d[si + src.width];
        if (isEdge) buf[si] = 1;
      }
    }
    pixelBM = makeBitMap(buf, src.width, src.height);
  } else if (mode === "inverted") {
    const buf = new Uint8Array(src.width * src.height);
    for (let i = 0; i < src.data.length; i++) {
      if (src.mask ? src.mask[i] : 1) buf[i] = src.data[i] ^ 1;
    }
    pixelBM = makeBitMap(buf, src.width, src.height);
  } else {
    pixelBM = makeBitMap(src.data, src.width, src.height);
  }

  const port = ctx.port;
  if (src.mask) {
    const maskBM = makeBitMap(src.mask, src.width, src.height);
    CopyBits(maskBM, port.portBits, srcRect, dstRect, srcBic, null);
    CopyBits(pixelBM, port.portBits, srcRect, dstRect, srcOr, null);
  } else {
    CopyBits(pixelBM, port.portBits, srcRect, dstRect, srcCopy, null);
  }
}

function drawRaster(
  node: CanvasNode,
  ctx: DrawContext,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const onPaint = node.props["onPaint"] as RasterPaintFn | undefined;
  if (!onPaint) return;
  SetPort(ctx.port);
  const savedClip = ctx.port.clipRgn
    ? { ...ctx.port.clipRgn, rgn: { ...ctx.port.clipRgn.rgn, rgnBBox: { ...ctx.port.clipRgn.rgn.rgnBBox } } }
    : null;
  ClipRect(makeRect(y, x, y + height, x + width));
  onPaint(ctx.port, { x, y, width, height });
  if (savedClip) ClipRect(savedClip.rgn.rgnBBox);
  else ClipRect(makeRect(-32767, -32767, 32767, 32767));
}

// -------------------------------------------------------------------------
// Hit rect extraction (tests / optional host fallback)
// -------------------------------------------------------------------------

export function collectHitRects(root: CanvasNode): HitRect[] {
  const rects: HitRect[] = [];
  collectHitRectsNode(root, rects, 0, 0, 0);
  return rects;
}

function collectHitRectsNode(
  node: CanvasNode,
  out: HitRect[],
  zIndex: number,
  extraX: number,
  extraY: number
): void {
  if (node.type === "_text_content") return;
  if (node.props["inert"] === true) return;

  const handlers = node._eventHandlers;
  if (hasMouseHandlers(handlers) && node.type !== "_root") {
    const hitMask = node.props["hitMask"] as HitMask | undefined;
    out.push({
      rect: {
        x: node.layout.x + extraX,
        y: node.layout.y + extraY,
        width: node.layout.width,
        height: node.layout.height,
      },
      handlers,
      nodeId: node.id,
      zIndex,
      hitMask,
    });
  }

  const childExtraY =
    extraY - (node.style.overflow === "scroll" ? node._scrollOffset ?? 0 : 0);

  for (const child of node.children) {
    collectHitRectsNode(child, out, zIndex + 1, extraX, childExtraY);
  }
}
