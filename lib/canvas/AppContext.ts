import { BitCanvas, Sprite, BLACK, WHITE } from "./BitCanvas";
import { PatternName } from "./patterns";
import { drawBitmapText, TextOptions, getLineHeight } from "./fontAdapter";
import { ButtonDef, drawButton as _drawButton } from "./ui/drawButton";
import {
  TextInputState,
  drawTextInput as _drawTextInput,
  handleTextInputClick as _handleTextInputClick,
  handleTextInputDoubleClick as _handleTextInputDoubleClick,
  handleTextInputDrag as _handleTextInputDrag,
} from "./ui/TextInput";
import {
  TextBlockOptions as _TextBlockOptions,
  getWrappedLines,
  measureTextBlock as _measureTextBlock,
} from "./ui/TextBlock";
import { HitRegion, HitRegionMap } from "./HitRegion";

const SCROLL_AREA_BAR_WIDTH = 15;
const SCROLL_AREA_ARROW_HEIGHT = 15;
const SCROLL_STEP = 12;
const GROW_BOX_SIZE = 15;

export interface ScrollAreaOptions {
  contentHeight: number;
  scrollOffset: number;
  onScroll: (newOffset: number) => void;
  /** When set, a resize handle is drawn at the bottom-right corner of the scroll
   *  area. Dragging it resizes the window. Requires the window to have been
   *  created with the AppContext resize callback (standard windows always have it). */
  resize?: "both" | "vertical" | "horizontal";
}

/**
 * A scoped drawing context for an app, clipped and offset to the window's
 * content area. Apps draw in local coordinates (0,0 is top-left of their area).
 */
export class AppContext {
  private canvas: BitCanvas;
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
  /** Full window dimensions at context creation time, for grow-box resize baseline. */
  private _windowSize: { width: number; height: number } | undefined;

  constructor(
    canvas: BitCanvas,
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
    windowSize?: { width: number; height: number }
  ) {
    this.canvas = canvas;
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
    canvas.pushClip(x, y, w, h);
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

  release() {
    this.canvas.popClip();
  }

  setPixel(x: number, y: number, color: number = BLACK) {
    this.canvas.setPixel(this.ox + x - this.scrollOffsetX, this.oy + y - this.scrollOffsetY, color);
  }

  getPixel(x: number, y: number): number {
    return this.canvas.getPixel(this.ox + x - this.scrollOffsetX, this.oy + y - this.scrollOffsetY);
  }

  drawHLine(x: number, y: number, w: number, color: number = BLACK) {
    this.canvas.drawHLine(
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      w,
      color
    );
  }

  drawVLine(x: number, y: number, h: number, color: number = BLACK) {
    this.canvas.drawVLine(
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      h,
      color
    );
  }

  drawDottedHLine(x: number, y: number, w: number, color: number = BLACK) {
    this.canvas.drawDottedHLine(
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      w,
      color
    );
  }

  drawDottedVLine(x: number, y: number, h: number, color: number = BLACK) {
    this.canvas.drawDottedVLine(
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      h,
      color
    );
  }

  drawRect(x: number, y: number, w: number, h: number, color: number = BLACK) {
    this.canvas.drawRect(
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      w,
      h,
      color
    );
  }

  fillRect(x: number, y: number, w: number, h: number, color: number = BLACK) {
    this.canvas.fillRect(
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      w,
      h,
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
    this.canvas.fillPattern(
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      w,
      h,
      pattern
    );
  }

  invertRect(x: number, y: number, w: number, h: number) {
    this.canvas.invertRect(this.ox + x - this.scrollOffsetX, this.oy + y - this.scrollOffsetY, w, h);
  }

  blit(sprite: Sprite, x: number, y: number) {
    this.canvas.blit(sprite, this.ox + x - this.scrollOffsetX, this.oy + y - this.scrollOffsetY);
  }

  blitInverted(sprite: Sprite, x: number, y: number) {
    this.canvas.blitInverted(
      sprite,
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY
    );
  }

  blitShadowOutline(sprite: Sprite, x: number, y: number) {
    this.canvas.blitShadowOutline(
      sprite,
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY
    );
  }

  blitImageData(imageData: ImageData, x: number, y: number) {
    this.canvas.blitImageData(
      imageData,
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY
    );
  }

  /**
   * Bulk-copy a pre-dithered 1-bit pixel buffer (0=white, 1=black) into the
   * BitCanvas using row-level Uint8Array.set(). Much faster than blitImageData
   * for cases where the source is already in the native pixel format.
   */
  blit1bitPixels(
    src: Uint8Array,
    srcW: number,
    srcH: number,
    x: number,
    y: number
  ) {
    const pixels = this.canvas.pixels;
    const dstW = this.canvas.width;
    const dstH = this.canvas.height;
    const dx = this.ox + x - this.scrollOffsetX;
    const dy = this.oy + y - this.scrollOffsetY;

    const clip = this.canvas.getClip();
    const clipR = clip.x + clip.w;
    const clipB = clip.y + clip.h;

    const sx0 = Math.max(0, clip.x - dx, -dx);
    const sy0 = Math.max(0, clip.y - dy, -dy);
    const sx1 = Math.min(srcW, clipR - dx, dstW - dx);
    const sy1 = Math.min(srcH, clipB - dy, dstH - dy);

    if (sx0 >= sx1 || sy0 >= sy1) return;
    const copyW = sx1 - sx0;

    for (let sy = sy0; sy < sy1; sy++) {
      pixels.set(
        src.subarray(sy * srcW + sx0, sy * srcW + sx0 + copyW),
        (dy + sy) * dstW + dx + sx0
      );
    }
  }

  pushClip(x: number, y: number, w: number, h: number) {
    this.canvas.pushClip(this.ox + x - this.scrollOffsetX, this.oy + y - this.scrollOffsetY, w, h);
  }

  popClip() {
    this.canvas.popClip();
  }

  drawText(text: string, x: number, y: number, opts: TextOptions = {}) {
    drawBitmapText(
      this.canvas,
      text,
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      opts
    );
  }

  drawButton(
    btn: Omit<ButtonDef, "x" | "y"> & {
      x: number;
      y: number;
      id?: string;
      onClick?: () => void;
      onMouseDown?: () => void;
    }
  ) {
    const absRect = _drawButton(this.canvas, {
      ...btn,
      x: this.ox + btn.x - this.scrollOffsetX,
      y: this.oy + btn.y - this.scrollOffsetY,
    });
    const localRect = { x: btn.x, y: btn.y, w: absRect.w, h: absRect.h };

    if (this._hitRegions && (btn.onClick || btn.onMouseDown) && btn.id) {
      this.hitRegion(btn.id, localRect, {
        onClick: btn.onClick ? () => btn.onClick!() : undefined,
        onMouseDown: btn.onMouseDown ? () => btn.onMouseDown!() : undefined,
      });
    }

    return localRect;
  }

  drawTextInput(
    state: TextInputState,
    x: number,
    y: number,
    width: number,
    height?: number,
    options?: {
      /** Unique id for hit-region registration. When provided (and hit regions
       *  are available), click / double-click / drag interactions are handled
       *  automatically so the caller doesn't need to wire them up. */
      id?: string;
      /** Called after any mouse interaction mutates the state. */
      onChange?: () => void;
    }
  ) {
    const h = height ?? 16;
    _drawTextInput(
      this.canvas,
      state,
      this.ox + x - this.scrollOffsetX,
      this.oy + y - this.scrollOffsetY,
      width,
      h
    );

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
            const localX = absX - (this.ox + x - this.scrollOffsetX);
            if (_handleTextInputDrag(state, localX)) {
              onChange?.();
            }
          },
        }
      );
    }
  }

  /**
   * Draw a block of word-wrapped text with automatic viewport culling.
   * Coordinates are in app-local content space.
   * Returns the total content height of the text block.
   */
  drawTextBlock(
    opts: Omit<_TextBlockOptions, "x" | "y"> & { x: number; y: number }
  ): number {
    const font = opts.font ?? "Geneva9";
    const color = opts.color ?? BLACK;
    const lineH = getLineHeight(font) + (opts.lineSpacing ?? 0);
    const lines = getWrappedLines(opts.text, opts.maxWidth, font);
    const totalHeight = lines.length * lineH;

    const visibleTop = this.scrollOffsetY;
    const visibleBottom = this.scrollOffsetY + this.h;

    for (let i = 0; i < lines.length; i++) {
      const ly = opts.y + i * lineH;
      if (ly + lineH <= visibleTop || ly >= visibleBottom) continue;
      if (!lines[i]) continue;
      drawBitmapText(
        this.canvas,
        lines[i],
        this.ox + opts.x - this.scrollOffsetX,
        this.oy + ly - this.scrollOffsetY,
        { font, color }
      );
    }

    return totalHeight;
  }

  /**
   * Measure the total height of a text block without drawing it.
   */
  measureTextBlock(
    text: string,
    maxWidth: number,
    font?: "Geneva9" | "ChiKareGo",
    lineSpacing?: number
  ): number {
    return _measureTextBlock(text, maxWidth, font, lineSpacing);
  }

  /**
   * Draw a scrollable region within the app's content area.
   *
   * The app owns the scroll state and passes it via `opts`. The ScrollArea
   * handles clipping, scrollbar rendering, and all hit regions — the app
   * only needs to draw content inside `drawContent(scrollCtx)` as if it
   * starts at (0,0) with unlimited height.
   *
   * The content width available inside `drawContent` is `rect.w - 15` (scrollbar).
   */
  scrollArea(
    id: string,
    rect: { x: number; y: number; w: number; h: number },
    opts: ScrollAreaOptions,
    drawContent: (ctx: AppContext) => void
  ) {
    if (!this._hitRegions) return;

    const { contentHeight, scrollOffset, onScroll, resize } = opts;
    const hasGrowBox = !!resize && !!this._onStartResize;
    const growBoxSize = hasGrowBox ? GROW_BOX_SIZE : 0;

    const maxScroll = Math.max(0, contentHeight - rect.h);
    const clampedOffset = Math.min(scrollOffset, maxScroll);

    const sbW = SCROLL_AREA_BAR_WIDTH;
    const contentW = rect.w - sbW;

    // Screen-absolute origin of the scroll area (accounting for parent window scroll)
    const absX = this.ox + rect.x - this.scrollOffsetX;
    const absY = this.oy + rect.y - this.scrollOffsetY;

    // --- Draw content (clipped, offset by scroll) ---
    const contentCtx = new AppContext(
      this.canvas,
      absX,
      absY,
      contentW,
      rect.h,
      clampedOffset,
      0,
      this._hitRegions
    );
    drawContent(contentCtx);
    contentCtx.release();

    // --- Draw scrollbar chrome directly on BitCanvas (no extra offset) ---
    const sbx = absX + contentW;
    const sby = absY;
    // When there's a grow box, the scrollbar track is shorter by GROW_BOX_SIZE
    const bodyH = rect.h - growBoxSize;

    this.canvas.drawVLine(sbx, sby, rect.h, BLACK);

    const trackTop = sby + SCROLL_AREA_ARROW_HEIGHT;
    const trackH = bodyH - SCROLL_AREA_ARROW_HEIGHT * 2;
    const arrowCx = sbx + 7;

    // Up arrow
    this.canvas.fillRect(
      sbx + 1,
      sby,
      sbW - 1,
      SCROLL_AREA_ARROW_HEIGHT,
      WHITE
    );
    this.canvas.drawHLine(sbx, sby + SCROLL_AREA_ARROW_HEIGHT - 1, sbW, BLACK);
    this.canvas.setPixel(arrowCx, sby + 4, BLACK);
    this.canvas.drawHLine(arrowCx - 1, sby + 5, 3, BLACK);
    this.canvas.drawHLine(arrowCx - 2, sby + 6, 5, BLACK);
    this.canvas.drawHLine(arrowCx - 3, sby + 7, 7, BLACK);

    // Down arrow — sits directly above grow box (or at bottom of full height)
    const downTop = sby + bodyH - SCROLL_AREA_ARROW_HEIGHT;
    this.canvas.fillRect(
      sbx + 1,
      downTop,
      sbW - 1,
      SCROLL_AREA_ARROW_HEIGHT,
      WHITE
    );
    this.canvas.drawHLine(sbx, downTop, sbW, BLACK);
    this.canvas.setPixel(arrowCx, downTop + 10, BLACK);
    this.canvas.drawHLine(arrowCx - 1, downTop + 9, 3, BLACK);
    this.canvas.drawHLine(arrowCx - 2, downTop + 8, 5, BLACK);
    this.canvas.drawHLine(arrowCx - 3, downTop + 7, 7, BLACK);

    // Track
    const needsScroll = contentHeight > rect.h;
    if (needsScroll) {
      this.canvas.fillPattern(sbx + 1, trackTop, sbW - 1, trackH, "gray50");

      const thumbH = Math.max(
        12,
        Math.floor((rect.h / contentHeight) * trackH)
      );
      const thumbY =
        trackTop + Math.floor((clampedOffset / maxScroll) * (trackH - thumbH));
      this.canvas.fillRect(sbx + 1, thumbY, sbW - 2, thumbH, WHITE);
      this.canvas.drawRect(sbx + 1, thumbY, sbW - 2, thumbH, BLACK);
    } else {
      this.canvas.fillRect(sbx + 1, trackTop, sbW - 1, trackH, WHITE);
    }

    // Grow box (replaces the bottom section of the scrollbar)
    if (hasGrowBox) {
      const gbx = sbx;
      const gby = sby + bodyH;
      this.canvas.fillRect(gbx, gby, GROW_BOX_SIZE, GROW_BOX_SIZE, WHITE);
      this.canvas.drawHLine(gbx, gby, GROW_BOX_SIZE, BLACK);
      this.canvas.drawRect(gbx + 2, gby + 6, 7, 7, BLACK);
      this.canvas.fillRect(gbx + 5, gby + 3, 7, 7, WHITE);
      this.canvas.drawRect(gbx + 5, gby + 3, 7, 7, BLACK);
    }

    // --- Hit regions ---

    // Scroll up arrow
    this._hitRegions.add({
      id: `${id}-scroll-up`,
      x: sbx,
      y: sby,
      w: sbW,
      h: SCROLL_AREA_ARROW_HEIGHT,
      onMouseDown: () => {
        onScroll(Math.max(0, clampedOffset - SCROLL_STEP));
      },
    });

    // Scroll down arrow
    this._hitRegions.add({
      id: `${id}-scroll-down`,
      x: sbx,
      y: downTop,
      w: sbW,
      h: SCROLL_AREA_ARROW_HEIGHT,
      onMouseDown: () => {
        onScroll(Math.min(maxScroll, clampedOffset + SCROLL_STEP));
      },
    });

    // Scroll track (thumb drag)
    if (needsScroll) {
      const thumbH = Math.max(
        12,
        Math.floor((rect.h / contentHeight) * trackH)
      );
      this._hitRegions.add({
        id: `${id}-scroll-track`,
        x: sbx,
        y: trackTop,
        w: sbW,
        h: trackH,
        onMouseDown: (_lx: number, ly: number) => {
          const ratio = ly / Math.max(1, trackH - thumbH);
          onScroll(Math.max(0, Math.min(maxScroll, ratio * maxScroll)));
        },
      });
    }

    // Scroll wheel — covers the full rect (content + scrollbar)
    this._hitRegions.add({
      id: `${id}-scroll-wheel`,
      x: absX,
      y: absY,
      w: rect.w,
      h: rect.h,
      onScroll: (deltaY: number) => {
        onScroll(Math.max(0, Math.min(maxScroll, clampedOffset + deltaY)));
      },
    });

    // Grow box hit region
    if (hasGrowBox) {
      const gbx = sbx;
      const gby = sby + bodyH;
      const onStartResize = this._onStartResize!;
      const winW = this._windowSize?.width ?? this.w + 2;
      const winH = this._windowSize?.height ?? this.h + 20;
      this._hitRegions.add({
        id: `${id}-grow-box`,
        x: gbx,
        y: gby,
        w: GROW_BOX_SIZE,
        h: GROW_BOX_SIZE,
        onMouseDown: (lx: number, ly: number) => {
          onStartResize(gbx + lx, gby + ly, winW, winH);
        },
      });
    }
  }

  clear(color: number = WHITE) {
    this.canvas.fillRect(this.ox, this.oy, this.w, this.h, color);
  }

  /** Direct access to the underlying BitCanvas (for native apps that need it). */
  getBitCanvas(): BitCanvas {
    return this.canvas;
  }

  /**
   * Register a hit region in local (app-content) coordinates.
   * Translates to screen coordinates internally.
   */
  hitRegion(
    id: string,
    rect: { x: number; y: number; w: number; h: number },
    callbacks: Omit<HitRegion, "id" | "x" | "y" | "w" | "h">
  ) {
    if (!this._hitRegions) return;
    this._hitRegions.add({
      id,
      x: this.ox + rect.x - this.scrollOffsetX,
      y: this.oy + rect.y - this.scrollOffsetY,
      w: rect.w,
      h: rect.h,
      ...callbacks,
    });
  }
}
