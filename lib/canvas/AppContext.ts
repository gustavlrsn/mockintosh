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

  constructor(
    canvas: BitCanvas,
    x: number,
    y: number,
    w: number,
    h: number,
    scrollY: number = 0
  ) {
    this.canvas = canvas;
    this.ox = x;
    this.oy = y;
    this.w = w;
    this.h = h;
    this.scrollOffsetY = scrollY;
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

  drawButton(btn: Omit<ButtonDef, "x" | "y"> & { x: number; y: number }) {
    const absRect = _drawButton(this.canvas, {
      ...btn,
      x: this.ox + btn.x,
      y: this.oy + btn.y - this.scrollOffsetY,
    });
    return { x: btn.x, y: btn.y, w: absRect.w, h: absRect.h };
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
}
