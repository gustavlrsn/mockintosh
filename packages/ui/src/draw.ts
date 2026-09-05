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
  bitMapFromPixels,
  bitMapWidth,
  bitMapHeight,
  setBit,
} from "@mockintosh/quickdraw";
import {
  hasMouseHandlers,
  resolveBorderWidth,
  type CanvasNode,
  type HitRect,
  type HitMask,
  type Ink,
  type PatternName,
  type RasterPaintFn,
  type RasterPaintRect,
  type RasterSurface,
  type TextAlign,
  type TextVerticalAlign,
} from "./nodes";
import type { FocusManager } from "./focus";
import type { Sprite } from "./sprite";
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

/**
 * The 8×8 QuickDraw pattern for a named fill, for hosts that paint outside
 * the node tree (e.g. the shell's XOR zoom animation) and want to match the
 * tree's `background` / `penMode="xor"` appearance exactly.
 */
export function patternBits(name: PatternName): Uint8Array {
  return PATTERNS[name] ?? PATTERNS.checker;
}

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

export function createDrawContext(screen: BitMap): DrawContext {
  const width = bitMapWidth(screen);
  const height = bitMapHeight(screen);
  const bounds = cloneRect(screen.bounds);
  const port: PortWithMeta = {
    device: 0,
    portBits: screen,
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

function applyPenMode(port: PortWithMeta, penMode: "copy" | "xor" | undefined): void {
  if (penMode === "xor") PenMode(patXor);
  else PenNormal();
}

function fillBackground(
  port: PortWithMeta,
  r: ReturnType<typeof makeRect>,
  background: Ink | PatternName,
  penMode: "copy" | "xor" | undefined
): void {
  applyPenMode(port, penMode);
  if (typeof background === "number") {
    if (background === 0 && penMode !== "xor") {
      EraseRect(r);
    } else {
      PenNormal();
      if (penMode === "xor") PenMode(patXor);
      if (background === 0) PenPat(globals.white);
      PaintRect(r);
      PenNormal();
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
      background?: Ink | PatternName;
      borderColor?: Ink;
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
    } else {
      PenNormal();
      if (penMode === "xor") PenMode(patXor);
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
  const color = (node.props["color"] as Ink | undefined) ?? 1;
  const align = (node.props["align"] as TextAlign | undefined) ?? "left";
  const verticalAlign =
    (node.props["verticalAlign"] as TextVerticalAlign | undefined) ?? "top";
  const wrap = (node.props["wrap"] as boolean | undefined) ?? false;
  const background = node.props["background"] as Ink | undefined;
  const stipple = (node.props["stipple"] as boolean | undefined) ?? false;

  if (background !== undefined) {
    const bgRect = makeRect(y, x, y + height, x + width);
    if (background === 0) EraseRect(bgRect);
    else {
      PenNormal();
      PaintRect(bgRect);
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

// -------------------------------------------------------------------------
// Sprites → packed BitMaps
//
// `Sprite` keeps 1 byte per pixel (it is the asset format); the framebuffer
// is packed. Pack once per sprite and reuse across frames.
// -------------------------------------------------------------------------

interface PackedImage {
  pixels: BitMap;
  mask: BitMap | null;
  inverted?: BitMap;
  outline?: BitMap;
}

const packedImages = new WeakMap<Sprite, PackedImage>();

function packedImage(src: Sprite): PackedImage {
  let entry = packedImages.get(src);
  if (!entry) {
    entry = {
      pixels: bitMapFromPixels(src.data, src.width, src.height),
      mask: src.mask ? bitMapFromPixels(src.mask, src.width, src.height) : null,
    };
    packedImages.set(src, entry);
  }
  return entry;
}

function outlineImage(src: Sprite): BitMap {
  const entry = packedImage(src);
  if (entry.outline) return entry.outline;
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
  entry.outline = bitMapFromPixels(buf, src.width, src.height);
  return entry.outline;
}

function invertedImage(src: Sprite): BitMap {
  const entry = packedImage(src);
  if (entry.inverted) return entry.inverted;
  const buf = new Uint8Array(src.width * src.height);
  for (let i = 0; i < src.data.length; i++) {
    if (src.mask ? src.mask[i] : 1) buf[i] = src.data[i] ^ 1;
  }
  entry.inverted = bitMapFromPixels(buf, src.width, src.height);
  return entry.inverted;
}

function drawImage(
  node: CanvasNode,
  ctx: DrawContext,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const src = node.props["src"] as Sprite | undefined;
  const mode = (node.props["mode"] as string | undefined) ?? "normal";
  if (!src) return;

  const pw = Math.min(src.width, width);
  const ph = Math.min(src.height, height);
  const srcRect = makeRect(0, 0, ph, pw);
  const dstRect = makeRect(y, x, y + ph, x + pw);

  const pixelBM =
    mode === "outline" ? outlineImage(src)
    : mode === "inverted" ? invertedImage(src)
    : packedImage(src).pixels;
  const maskBM = packedImage(src).mask;

  const port = ctx.port;
  if (maskBM) {
    CopyBits(maskBM, port.portBits, srcRect, dstRect, srcBic, null);
    CopyBits(pixelBM, port.portBits, srcRect, dstRect, srcOr, null);
  } else {
    CopyBits(pixelBM, port.portBits, srcRect, dstRect, srcCopy, null);
  }
}

/**
 * Build the surface handed to `<raster onPaint>`. Direct pixel writes clip
 * to the raster box ∩ the port's visible/clip rects ∩ the bitmap bounds so a
 * raster in a partly off-screen window cannot scribble outside it.
 */
function createRasterSurface(port: GrafPort, rect: RasterPaintRect): RasterSurface {
  const bits = port.portBits;
  const vis = port.visRgn.rgn.rgnBBox;
  const clip = port.clipRgn.rgn.rgnBBox;
  const left = Math.max(rect.x, bits.bounds.left, port.portRect.left, vis.left, clip.left);
  const top = Math.max(rect.y, bits.bounds.top, port.portRect.top, vis.top, clip.top);
  const right = Math.min(rect.x + rect.width, bits.bounds.right, port.portRect.right, vis.right, clip.right);
  const bottom = Math.min(rect.y + rect.height, bits.bounds.bottom, port.portRect.bottom, vis.bottom, clip.bottom);

  return {
    port,
    rect,
    setPixel(x, y, ink) {
      const gx = rect.x + x;
      const gy = rect.y + y;
      if (gx < left || gx >= right || gy < top || gy >= bottom) return;
      setBit(bits, gx, gy, ink);
    },
    blitPixels(pixels, width, height, x = 0, y = 0) {
      const x0 = Math.max(left, rect.x + x);
      const y0 = Math.max(top, rect.y + y);
      const x1 = Math.min(right, rect.x + x + width);
      const y1 = Math.min(bottom, rect.y + y + height);
      for (let gy = y0; gy < y1; gy++) {
        const srcRow = (gy - rect.y - y) * width - (rect.x + x);
        for (let gx = x0; gx < x1; gx++) setBit(bits, gx, gy, pixels[srcRow + gx]);
      }
    },
    fill(ink) {
      for (let gy = top; gy < bottom; gy++)
        for (let gx = left; gx < right; gx++) setBit(bits, gx, gy, ink);
    },
  };
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
  onPaint(createRasterSurface(ctx.port, { x, y, width, height }));
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
