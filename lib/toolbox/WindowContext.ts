/**
 * WindowContext.ts — Thin app drawing context (replaces AppContext)
 *
 * Provides coordinate translation, hit region registration, scroll areas,
 * and convenience drawing methods that delegate to qdDraw.ts + SpriteManager.
 *
 * Unlike the former AppContext, there is no BitCanvas fallback — all drawing
 * goes through QuickDraw's GrafPort.
 */

import { BitCanvas, Sprite, BLACK, WHITE } from "../canvas/BitCanvas";
import { PatternName } from "../canvas/patterns";
import {
  TextOptions,
  resolveLineBox,
  type FontName,
} from "../canvas/fontAdapter";
import { HitRegion, HitRegionMap } from "../canvas/HitRegion";
import type { GrafPort, Rect } from "@mockintosh/quickdraw";
import {
  makeRect,
  NewRgn,
  CopyRgn,
  RectRgn,
  SectRgn,
  DisposeRgn,
  SetPort,
} from "@mockintosh/quickdraw";
import { FMTextWidth } from "./FontManager";
import type { WindowRecord } from "./WindowManager";
import {
  qdFillRect,
  qdDrawRect,
  qdDrawHLine,
  qdDrawVLine,
  qdDrawDottedHLine,
  qdDrawDottedVLine,
  qdFillPattern,
  qdFillRoundRect,
  qdFrameRoundRect,
  qdInvertRect,
  qdSetPixel,
} from "../canvas/qdDraw";
import {
  blitSprite,
  blitSpriteInverted,
  blitSpriteShadowOutline,
  blitImageData as _blitImageData,
  blit1bitPixels as _blit1bitPixels,
  fillSpriteTile as _fillSpriteTile,
} from "../canvas/SpriteManager";
import { drawTextEditField } from "./TextEdit";
import {
  TextInputState,
  handleTextInputClick as _handleTextInputClick,
  handleTextInputDoubleClick as _handleTextInputDoubleClick,
  handleTextInputDrag as _handleTextInputDrag,
} from "../canvas/ui/TextInput";
import {
  TextBlockOptions as _TextBlockOptions,
  getWrappedLines,
  measureTextBlock as _measureTextBlock,
} from "../canvas/ui/TextBlock";
import { drawTextToPort } from "./PortText";

// -------------------------------------------------------------------------
// Helper: wrap a GrafPort in a temporary BitCanvas shim (shares pixel buffer)
// Needed for legacy drawing code (font rendering, text input) that still
// operates on BitCanvas. Will be eliminated when those paths move to QD.
// -------------------------------------------------------------------------
function _portToBitCanvas(port: GrafPort): BitCanvas {
  const { baseAddr, rowBytes } = port.portBits;
  const height = (baseAddr.length / rowBytes) | 0;
  const bc = new BitCanvas(rowBytes, height);
  (bc as any).pixels = baseAddr;
  return bc;
}

const SCROLL_AREA_BAR_WIDTH = 15;
const SCROLL_AREA_ARROW_HEIGHT = 15;
const SCROLL_STEP = 12;
const GROW_BOX_SIZE = 15;

export interface ScrollAreaOptions {
  contentHeight: number;
  scrollOffset: number;
  onScroll: (newOffset: number) => void;
  resize?: "both" | "vertical" | "horizontal";
}

export class WindowContext {
  readonly port: GrafPort;
  private bc: BitCanvas;
  private ox: number;
  private oy: number;
  private w: number;
  private h: number;
  private scrollOffsetY: number;
  private scrollOffsetX: number;
  private _hitRegions: HitRegionMap | undefined;
  private _onStartResize:
    | ((
        startX: number,
        startY: number,
        startWidth: number,
        startHeight: number
      ) => void)
    | undefined;
  private _minSize: { width: number; height: number } | undefined;
  private _windowSize: { width: number; height: number } | undefined;
  private _contentTopInset: number;
  private _windowScrollY: number;
  private _windowScrollX: number;
  /** Screen position of this context's content area (for hit region registration). */
  private _contentRectX: number;
  private _contentRectY: number;
  private _window: WindowRecord | null;

  constructor(
    port: GrafPort,
    x: number,
    y: number,
    w: number,
    h: number,
    scrollY: number = 0,
    scrollX: number = 0,
    hitRegions?: HitRegionMap,
    onStartResize?: (
      startX: number,
      startY: number,
      startWidth: number,
      startHeight: number
    ) => void,
    minSize?: { width: number; height: number },
    windowSize?: { width: number; height: number },
    contentTopInset: number = 0,
    windowScrollY: number = 0,
    windowScrollX: number = 0,
    contentRectX?: number,
    contentRectY?: number,
    window?: WindowRecord | null
  ) {
    this.port = port;
    this._window = window ?? null;
    this.bc = _portToBitCanvas(port);
    this.ox = x;
    this.oy = y;
    this.w = w;
    this.h = h;
    this.scrollOffsetY = scrollY;
    this.scrollOffsetX = scrollX;
    this._hitRegions = hitRegions;
    this._onStartResize = onStartResize;
    this._minSize = minSize;
    this._windowSize = windowSize;
    this._contentTopInset = contentTopInset;
    this._windowScrollY = windowScrollY;
    this._windowScrollX = windowScrollX;
    this._contentRectX = contentRectX ?? x;
    this._contentRectY = contentRectY ?? y;
  }

  // -----------------------------------------------------------------------
  // Accessors
  // -----------------------------------------------------------------------

  /** Return the window record when this context is for a window (Mac-style controls). */
  getWindow(): WindowRecord | null {
    return this._window;
  }

  get width() {
    return this.w;
  }
  get height() {
    return this.h;
  }
  get scrollY() {
    return this.scrollOffsetY;
  }
  get scrollX() {
    return this.scrollOffsetX;
  }

  release() {}

  // -----------------------------------------------------------------------
  // Coordinate translation
  // -----------------------------------------------------------------------

  private tx(x: number): number {
    return this.ox + x - this.scrollOffsetX;
  }
  private ty(y: number): number {
    return this.oy + y - this.scrollOffsetY;
  }
  /** Screen position for drawing paths that use the BitCanvas shim (full-screen buffer). */
  private screenX(x: number): number {
    return this._contentRectX + this.tx(x);
  }
  private screenY(y: number): number {
    return this._contentRectY + this.ty(y);
  }

  // -----------------------------------------------------------------------
  // Drawing primitives — all delegate to qdDraw via GrafPort
  // -----------------------------------------------------------------------

  setPixel(x: number, y: number, color: number = BLACK) {
    qdSetPixel(this.port, this.tx(x), this.ty(y), color);
  }

  getPixel(x: number, y: number): number {
    const px = this.tx(x);
    const py = this.ty(y);
    const { baseAddr, rowBytes, bounds } = this.port.portBits;
    const idx = (py - bounds.top) * rowBytes + (px - bounds.left);
    if (idx < 0 || idx >= baseAddr.length) return 0;
    return baseAddr[idx];
  }

  drawHLine(x: number, y: number, w: number, color: number = BLACK) {
    qdDrawHLine(this.port, this.tx(x), this.ty(y), w, color);
  }

  drawVLine(x: number, y: number, h: number, color: number = BLACK) {
    qdDrawVLine(this.port, this.tx(x), this.ty(y), h, color);
  }

  drawDottedHLine(x: number, y: number, w: number, color: number = BLACK) {
    qdDrawDottedHLine(this.port, this.tx(x), this.ty(y), w, color);
  }

  drawDottedVLine(x: number, y: number, h: number, color: number = BLACK) {
    qdDrawDottedVLine(this.port, this.tx(x), this.ty(y), h, color);
  }

  drawRect(x: number, y: number, w: number, h: number, color: number = BLACK) {
    qdDrawRect(this.port, this.tx(x), this.ty(y), w, h, color);
  }

  fillRect(x: number, y: number, w: number, h: number, color: number = BLACK) {
    qdFillRect(this.port, this.tx(x), this.ty(y), w, h, color);
  }

  drawRoundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    color: number = BLACK
  ) {
    qdFrameRoundRect(
      this.port,
      this.tx(x),
      this.ty(y),
      w,
      h,
      radius,
      radius,
      1,
      color
    );
  }

  fillRoundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    color: number = BLACK
  ) {
    qdFillRoundRect(
      this.port,
      this.tx(x),
      this.ty(y),
      w,
      h,
      radius,
      radius,
      color
    );
  }

  frameRoundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    ovalWidth: number,
    ovalHeight: number,
    penWidth: number = 1,
    color: number = BLACK
  ) {
    qdFrameRoundRect(
      this.port,
      this.tx(x),
      this.ty(y),
      w,
      h,
      ovalWidth,
      ovalHeight,
      penWidth,
      color
    );
  }

  fillPattern(
    x: number,
    y: number,
    w: number,
    h: number,
    pattern: PatternName | Uint8Array
  ) {
    qdFillPattern(
      this.port,
      this.tx(x),
      this.ty(y),
      w,
      h,
      pattern as PatternName
    );
  }

  invertRect(x: number, y: number, w: number, h: number) {
    qdInvertRect(this.port, this.tx(x), this.ty(y), w, h);
  }

  clear(color: number = WHITE) {
    qdFillRect(this.port, this.ox, this.oy, this.w, this.h, color);
  }

  // -----------------------------------------------------------------------
  // Sprite / bitmap operations
  // -----------------------------------------------------------------------

  blit(sprite: Sprite, x: number, y: number) {
    blitSprite(this.port, sprite, this.tx(x), this.ty(y));
  }

  blitInverted(sprite: Sprite, x: number, y: number) {
    blitSpriteInverted(this.port, sprite, this.tx(x), this.ty(y));
  }

  blitShadowOutline(sprite: Sprite, x: number, y: number) {
    blitSpriteShadowOutline(this.port, sprite, this.tx(x), this.ty(y));
  }

  blitImageData(imageData: ImageData, x: number, y: number) {
    _blitImageData(this.port, imageData, this.tx(x), this.ty(y));
  }

  blit1bitPixels(
    src: Uint8Array,
    srcW: number,
    srcH: number,
    x: number,
    y: number
  ) {
    _blit1bitPixels(this.port, src, srcW, srcH, this.tx(x), this.ty(y));
  }

  // -----------------------------------------------------------------------
  // Clip stack (legacy shim for TextEdit)
  // -----------------------------------------------------------------------

  pushClip(x: number, y: number, w: number, h: number) {
    this.bc.pushClip(this.screenX(x), this.screenY(y), w, h);
  }

  popClip() {
    this.bc.popClip();
  }

  // -----------------------------------------------------------------------
  // Text
  // -----------------------------------------------------------------------

  drawText(text: string, x: number, y: number, opts: TextOptions = {}) {
    const fontName = opts.font ?? "body";
    const lineBox = resolveLineBox(fontName, { lineHeight: opts.lineHeight });
    const lineH = lineBox.lineHeight;
    const spacing = opts.spacing ?? 0;
    const textW = FMTextWidth(text, fontName, spacing);
    const width = opts.width ?? textW;
    const lineCount = text ? text.split("\n").length : 1;
    let penX = x;
    if (opts.align === "center") penX = x + Math.floor((width - textW) / 2);
    else if (opts.align === "right") penX = x + width - textW;

    SetPort(this.port);
    if (opts.bg !== null && opts.bg !== undefined && width > 0 && lineH > 0) {
      this.fillRect(x, y, width, opts.height ?? lineH * lineCount, opts.bg);
    }
    drawTextToPort(this.port, text, this.tx(penX), this.ty(y), {
      font: fontName,
      spacing,
      lineHeight: lineBox.lineHeight,
      color: opts.color ?? BLACK,
    });
  }

  // -----------------------------------------------------------------------
  // High-level widgets
  // -----------------------------------------------------------------------

  /**
   * @deprecated Use NewControl + DrawControls instead. See docs/control-manager-migration.md.
   */
  drawButton(_btn: unknown): { x: number; y: number; w: number; h: number } {
    throw new Error(
      "drawButton is removed. Use NewControl + DrawControls (see docs/control-manager-migration.md)."
    );
  }

  /**
   * Draw an editable text field (TextEdit path). When `options.id` is provided,
   * the TextEdit path registers a hit region for focus, selection, and drag;
   * apps should pass `options.id` (and optionally `onChange`) so that this
   * path owns the hit region. Do not call `hitRegion` separately for the same
   * text field.
   */
  drawTextInput(
    state: TextInputState,
    x: number,
    y: number,
    width: number,
    height?: number,
    options?: {
      id?: string;
      onChange?: () => void;
    }
  ) {
    const h = height ?? 16;
    drawTextEditField(this.port, state, this.tx(x), this.ty(y), width, h);

    if (this._hitRegions && options?.id) {
      const onChange = options.onChange;
      this.hitRegion(
        options.id,
        { x, y, w: width, h },
        {
          onMouseDown: (lx: number) => {
            _handleTextInputClick(state, lx, false);
            onChange?.();
          },
          onDoubleClick: (lx: number) => {
            _handleTextInputDoubleClick(state, lx);
            onChange?.();
          },
          onDrag: (absX: number) => {
            const localX = absX - this.screenX(x);
            if (_handleTextInputDrag(state, localX)) {
              onChange?.();
            }
          },
        }
      );
    }
  }

  drawTextBlock(
    opts: Omit<_TextBlockOptions, "x" | "y"> & { x: number; y: number }
  ): number {
    const font = opts.font ?? "body";
    const spacing = opts.spacing ?? 0;
    const color = opts.color ?? BLACK;
    const lineBox = resolveLineBox(font, {
      lineHeight: opts.lineHeight,
      lineSpacing: opts.lineSpacing,
    });
    const lineH = lineBox.lineHeight;
    const lines = getWrappedLines(opts.text, opts.maxWidth, font, spacing);
    const totalHeight = lines.length * lineH;

    const visibleTop = this.scrollOffsetY;
    const visibleBottom = this.scrollOffsetY + this.h;

    for (let i = 0; i < lines.length; i++) {
      const ly = opts.y + i * lineH;
      if (ly + lineH <= visibleTop || ly >= visibleBottom) continue;
      if (!lines[i]) continue;
      drawTextToPort(this.port, lines[i], this.tx(opts.x), this.ty(ly), {
        font,
        spacing,
        lineHeight: lineBox.lineHeight,
        color,
      });
    }

    return totalHeight;
  }

  measureTextBlock(
    text: string,
    maxWidth: number,
    font?: FontName,
    lineSpacing?: number,
    spacing?: number,
    lineHeight?: number
  ): number {
    return _measureTextBlock(
      text,
      maxWidth,
      font,
      lineSpacing,
      spacing,
      lineHeight
    );
  }

  // -----------------------------------------------------------------------
  // Scroll area
  // -----------------------------------------------------------------------

  scrollArea(
    id: string,
    rect: { x: number; y: number; w: number; h: number },
    opts: ScrollAreaOptions,
    drawContent: (ctx: WindowContext) => void
  ) {
    if (!this._hitRegions) return;

    const { contentHeight, scrollOffset, onScroll, resize } = opts;
    const hasGrowBox = !!resize && !!this._onStartResize;
    const growBoxSize = hasGrowBox ? GROW_BOX_SIZE : 0;

    const maxScroll = Math.max(0, contentHeight - rect.h);
    const clampedOffset = Math.min(scrollOffset, maxScroll);

    const sbW = SCROLL_AREA_BAR_WIDTH;
    const contentW = rect.w - sbW;

    // Scroll-area content context intentionally has no window (window param omitted),
    // so contentCtx.getWindow() === null. Controls in that sub-context would use legacy
    // drawButton if any; after migration there are no buttons in scroll-area content.
    const contentCtx = new WindowContext(
      this.port,
      rect.x,
      rect.y,
      contentW,
      rect.h,
      clampedOffset,
      0,
      this._hitRegions,
      undefined,
      undefined,
      undefined,
      0,
      0,
      0,
      this._contentRectX + rect.x,
      this._contentRectY + rect.y
    );
    drawContent(contentCtx);
    contentCtx.release();

    // Scrollbar chrome (port-local coords)
    const sbx = rect.x + contentW;
    const sby = rect.y;
    const bodyH = rect.h - growBoxSize;

    qdDrawVLine(this.port, sbx, sby, rect.h, BLACK);

    const trackTop = sby + SCROLL_AREA_ARROW_HEIGHT;
    const trackH = bodyH - SCROLL_AREA_ARROW_HEIGHT * 2;
    const arrowCx = sbx + 7;

    // Up arrow
    qdFillRect(
      this.port,
      sbx + 1,
      sby,
      sbW - 1,
      SCROLL_AREA_ARROW_HEIGHT,
      WHITE
    );
    qdDrawHLine(this.port, sbx, sby + SCROLL_AREA_ARROW_HEIGHT - 1, sbW, BLACK);
    qdSetPixel(this.port, arrowCx, sby + 4, BLACK);
    qdDrawHLine(this.port, arrowCx - 1, sby + 5, 3, BLACK);
    qdDrawHLine(this.port, arrowCx - 2, sby + 6, 5, BLACK);
    qdDrawHLine(this.port, arrowCx - 3, sby + 7, 7, BLACK);

    // Down arrow
    const downTop = sby + bodyH - SCROLL_AREA_ARROW_HEIGHT;
    qdFillRect(
      this.port,
      sbx + 1,
      downTop,
      sbW - 1,
      SCROLL_AREA_ARROW_HEIGHT,
      WHITE
    );
    qdDrawHLine(this.port, sbx, downTop, sbW, BLACK);
    qdSetPixel(this.port, arrowCx, downTop + 10, BLACK);
    qdDrawHLine(this.port, arrowCx - 1, downTop + 9, 3, BLACK);
    qdDrawHLine(this.port, arrowCx - 2, downTop + 8, 5, BLACK);
    qdDrawHLine(this.port, arrowCx - 3, downTop + 7, 7, BLACK);

    // Track
    const needsScroll = contentHeight > rect.h;
    if (needsScroll) {
      qdFillPattern(this.port, sbx + 1, trackTop, sbW - 1, trackH, "gray50");

      const thumbH = Math.max(
        12,
        Math.floor((rect.h / contentHeight) * trackH)
      );
      const thumbY =
        trackTop + Math.floor((clampedOffset / maxScroll) * (trackH - thumbH));
      qdFillRect(this.port, sbx + 1, thumbY, sbW - 2, thumbH, WHITE);
      qdDrawRect(this.port, sbx + 1, thumbY, sbW - 2, thumbH, BLACK);
    } else {
      qdFillRect(this.port, sbx + 1, trackTop, sbW - 1, trackH, WHITE);
    }

    // Grow box
    if (hasGrowBox) {
      const gbx = sbx;
      const gby = sby + bodyH;
      qdFillRect(this.port, gbx, gby, GROW_BOX_SIZE, GROW_BOX_SIZE, WHITE);
      qdDrawHLine(this.port, gbx, gby, GROW_BOX_SIZE, BLACK);
      qdDrawRect(this.port, gbx + 2, gby + 6, 7, 7, BLACK);
      qdFillRect(this.port, gbx + 5, gby + 3, 7, 7, WHITE);
      qdDrawRect(this.port, gbx + 5, gby + 3, 7, 7, BLACK);
    }

    // Hit regions (screen-space)
    this._hitRegions.add({
      id: `${id}-scroll-up`,
      x: this._contentRectX + sbx,
      y: this._contentRectY + sby,
      w: sbW,
      h: SCROLL_AREA_ARROW_HEIGHT,
      onMouseDown: () => {
        onScroll(Math.max(0, clampedOffset - SCROLL_STEP));
      },
    });

    this._hitRegions.add({
      id: `${id}-scroll-down`,
      x: this._contentRectX + sbx,
      y: this._contentRectY + downTop,
      w: sbW,
      h: SCROLL_AREA_ARROW_HEIGHT,
      onMouseDown: () => {
        onScroll(Math.min(maxScroll, clampedOffset + SCROLL_STEP));
      },
    });

    if (needsScroll) {
      const thumbH = Math.max(
        12,
        Math.floor((rect.h / contentHeight) * trackH)
      );
      this._hitRegions.add({
        id: `${id}-scroll-track`,
        x: this._contentRectX + sbx,
        y: this._contentRectY + trackTop,
        w: sbW,
        h: trackH,
        onMouseDown: (_lx: number, ly: number) => {
          const ratio = ly / Math.max(1, trackH - thumbH);
          onScroll(Math.max(0, Math.min(maxScroll, ratio * maxScroll)));
        },
      });
    }

    this._hitRegions.add({
      id: `${id}-scroll-wheel`,
      x: this._contentRectX + rect.x,
      y: this._contentRectY + rect.y,
      w: rect.w,
      h: rect.h,
      onScroll: (deltaY: number) => {
        onScroll(Math.max(0, Math.min(maxScroll, clampedOffset + deltaY)));
      },
    });

    if (hasGrowBox) {
      const gbx = sbx;
      const gby = sby + bodyH;
      const onStartResize = this._onStartResize!;
      const winW = this._windowSize?.width ?? this.w + 2;
      const winH = this._windowSize?.height ?? this.h + 20;
      this._hitRegions.add({
        id: `${id}-grow-box`,
        x: this._contentRectX + gbx,
        y: this._contentRectY + gby,
        w: GROW_BOX_SIZE,
        h: GROW_BOX_SIZE,
        onMouseDown: (lx: number, ly: number) => {
          onStartResize(
            this._contentRectX + gbx + lx,
            this._contentRectY + gby + ly,
            winW,
            winH
          );
        },
      });
    }
  }

  drawScrollableContent(drawContent: (scrollCtx: WindowContext) => void): void {
    if (this._contentTopInset <= 0 || !this._hitRegions) return;
    const inset = this._contentTopInset;
    const scrollH = this.h - inset;
    if (scrollH <= 0) return;
    // Sub-context for the scrollable region: origin at (ox, oy+inset), size (w, scrollH).
    // Use _contentRectY (not +inset) so screenY(y) = contentRect.y + inset + y - scrollY.
    const scrollCtx = new WindowContext(
      this.port,
      this.ox,
      this.oy + inset,
      this.w,
      scrollH,
      this._windowScrollY,
      this._windowScrollX,
      this._hitRegions,
      this._onStartResize,
      this._minSize,
      this._windowSize,
      0,
      this._windowScrollY,
      this._windowScrollX,
      this._contentRectX,
      this._contentRectY
    );
    // Clip port and BitCanvas to the scrollable rect so content doesn't draw over fixed strip or scroll bar.
    const scrollRect = makeRect(inset, 0, inset + scrollH, this.w);
    const originalClip = this.port.clipRgn;
    const savedClip = NewRgn();
    CopyRgn(originalClip, savedClip);
    const scrollRgn = NewRgn();
    RectRgn(scrollRgn, scrollRect);
    const newClip = NewRgn();
    SectRgn(originalClip, scrollRgn, newClip);
    this.port.clipRgn = newClip;
    scrollCtx.pushClip(0, 0, this.w, scrollH);
    try {
      drawContent(scrollCtx);
    } finally {
      scrollCtx.popClip();
      this.port.clipRgn = originalClip;
      CopyRgn(savedClip, originalClip);
      DisposeRgn(savedClip);
      DisposeRgn(scrollRgn);
      DisposeRgn(newClip);
    }
    scrollCtx.release();
  }

  // -----------------------------------------------------------------------
  // Hit regions
  // -----------------------------------------------------------------------

  hitRegion(
    id: string,
    rect: { x: number; y: number; w: number; h: number },
    callbacks: Omit<HitRegion, "id" | "x" | "y" | "w" | "h">
  ) {
    if (!this._hitRegions) return;
    this._hitRegions.add({
      id,
      x: this._contentRectX + this.tx(rect.x),
      y: this._contentRectY + this.ty(rect.y),
      w: rect.w,
      h: rect.h,
      ...callbacks,
    });
  }

  // -----------------------------------------------------------------------
  // Direct access — legacy escape hatch
  // -----------------------------------------------------------------------

  getBitCanvas(): BitCanvas {
    return this.bc;
  }
}
