import { BitCanvas, Sprite, BLACK, WHITE } from "./BitCanvas";
import { PatternName } from "./patterns";
import { drawBitmapText, TextOptions, getLineHeight } from "./fontAdapter";
import { ButtonDef, drawButton as _drawButton } from "./ui/drawButton";
import {
  TextInputState,
  drawTextInput as _drawTextInput,
} from "./ui/TextInput";
import {
  TextBlockOptions as _TextBlockOptions,
  getWrappedLines,
  measureTextBlock as _measureTextBlock,
} from "./ui/TextBlock";
import { HitRegion, HitRegionMap } from "./HitRegion";

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
  private _hitRegions: HitRegionMap | undefined;

  constructor(
    canvas: BitCanvas,
    x: number,
    y: number,
    w: number,
    h: number,
    scrollY: number = 0,
    hitRegions?: HitRegionMap
  ) {
    this.canvas = canvas;
    this.ox = x;
    this.oy = y;
    this.w = w;
    this.h = h;
    this.scrollOffsetY = scrollY;
    this._hitRegions = hitRegions;
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

  release() {
    this.canvas.popClip();
  }

  setPixel(x: number, y: number, color: number = BLACK) {
    this.canvas.setPixel(this.ox + x, this.oy + y - this.scrollOffsetY, color);
  }

  getPixel(x: number, y: number): number {
    return this.canvas.getPixel(this.ox + x, this.oy + y - this.scrollOffsetY);
  }

  drawHLine(x: number, y: number, w: number, color: number = BLACK) {
    this.canvas.drawHLine(
      this.ox + x,
      this.oy + y - this.scrollOffsetY,
      w,
      color
    );
  }

  drawVLine(x: number, y: number, h: number, color: number = BLACK) {
    this.canvas.drawVLine(
      this.ox + x,
      this.oy + y - this.scrollOffsetY,
      h,
      color
    );
  }

  drawDottedHLine(x: number, y: number, w: number, color: number = BLACK) {
    this.canvas.drawDottedHLine(
      this.ox + x,
      this.oy + y - this.scrollOffsetY,
      w,
      color
    );
  }

  drawDottedVLine(x: number, y: number, h: number, color: number = BLACK) {
    this.canvas.drawDottedVLine(
      this.ox + x,
      this.oy + y - this.scrollOffsetY,
      h,
      color
    );
  }

  drawRect(x: number, y: number, w: number, h: number, color: number = BLACK) {
    this.canvas.drawRect(
      this.ox + x,
      this.oy + y - this.scrollOffsetY,
      w,
      h,
      color
    );
  }

  fillRect(x: number, y: number, w: number, h: number, color: number = BLACK) {
    this.canvas.fillRect(
      this.ox + x,
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
      this.ox + x,
      this.oy + y - this.scrollOffsetY,
      w,
      h,
      pattern
    );
  }

  invertRect(x: number, y: number, w: number, h: number) {
    this.canvas.invertRect(this.ox + x, this.oy + y - this.scrollOffsetY, w, h);
  }

  blit(sprite: Sprite, x: number, y: number) {
    this.canvas.blit(sprite, this.ox + x, this.oy + y - this.scrollOffsetY);
  }

  blitInverted(sprite: Sprite, x: number, y: number) {
    this.canvas.blitInverted(
      sprite,
      this.ox + x,
      this.oy + y - this.scrollOffsetY
    );
  }

  blitShadowOutline(sprite: Sprite, x: number, y: number) {
    this.canvas.blitShadowOutline(
      sprite,
      this.ox + x,
      this.oy + y - this.scrollOffsetY
    );
  }

  blitImageData(imageData: ImageData, x: number, y: number) {
    this.canvas.blitImageData(
      imageData,
      this.ox + x,
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
    const dx = this.ox + x;
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
    this.canvas.pushClip(this.ox + x, this.oy + y, w, h);
  }

  popClip() {
    this.canvas.popClip();
  }

  drawText(text: string, x: number, y: number, opts: TextOptions = {}) {
    drawBitmapText(
      this.canvas,
      text,
      this.ox + x,
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
      x: this.ox + btn.x,
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
    height?: number
  ) {
    _drawTextInput(
      this.canvas,
      state,
      this.ox + x,
      this.oy + y - this.scrollOffsetY,
      width,
      height
    );
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
        this.ox + opts.x,
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
      x: this.ox + rect.x,
      y: this.oy + rect.y - this.scrollOffsetY,
      w: rect.w,
      h: rect.h,
      ...callbacks,
    });
  }
}
