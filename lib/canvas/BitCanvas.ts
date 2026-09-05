/**
 * BitCanvas.ts — Minimal kernel
 *
 * Owns the 1-byte-per-pixel indexed buffer and provides flush-to-canvas2d.
 * All higher-level drawing has migrated to QuickDraw GrafPort via qdDraw.ts.
 *
 * Retained methods beyond the kernel (fillRect, drawRect, drawHLine,
 * drawVLine) exist solely to support the fontAdapter / TextInput / TextEdit
 * shim path that wraps a GrafPort's baseAddr in a BitCanvas. These will be
 * removed once text rendering moves to native QuickDraw DrawString.
 */

import { resolvePixelRGB } from "./ColorSystem";

export const BLACK = 1;
export const WHITE = 0;

export interface Sprite {
  width: number;
  height: number;
  data: Uint8Array;
  mask?: Uint8Array;
}

interface ClipRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class BitCanvas {
  readonly width: number;
  readonly height: number;
  readonly pixels: Uint8Array;
  private clipStack: ClipRect[] = [];
  private clip: ClipRect;
  private imageData: ImageData | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8Array(width * height);
    this.clip = { x: 0, y: 0, w: width, h: height };
  }

  // -----------------------------------------------------------------------
  // Clip stack
  // -----------------------------------------------------------------------

  pushClip(x: number, y: number, w: number, h: number) {
    this.clipStack.push({ ...this.clip });
    const nx = Math.max(this.clip.x, x);
    const ny = Math.max(this.clip.y, y);
    const nx2 = Math.min(this.clip.x + this.clip.w, x + w);
    const ny2 = Math.min(this.clip.y + this.clip.h, y + h);
    this.clip = {
      x: nx,
      y: ny,
      w: Math.max(0, nx2 - nx),
      h: Math.max(0, ny2 - ny),
    };
  }

  popClip() {
    const prev = this.clipStack.pop();
    if (prev) this.clip = prev;
  }

  getClip(): ClipRect {
    return { ...this.clip };
  }

  // -----------------------------------------------------------------------
  // Flush — convert indexed buffer to RGBA and put on real canvas
  // -----------------------------------------------------------------------

  flush(ctx: CanvasRenderingContext2D) {
    if (
      !this.imageData ||
      this.imageData.width !== this.width ||
      this.imageData.height !== this.height
    ) {
      this.imageData = ctx.createImageData(this.width, this.height);
    }
    const rgba = this.imageData.data;
    const len = this.width * this.height;
    for (let i = 0; i < len; i++) {
      const x = i % this.width;
      const y = (i / this.width) | 0;
      const color = resolvePixelRGB(this.pixels[i], x, y);
      const j = i * 4;
      rgba[j] = color.r;
      rgba[j + 1] = color.g;
      rgba[j + 2] = color.b;
      rgba[j + 3] = 255;
    }
    ctx.putImageData(this.imageData, 0, 0);
  }

  // -----------------------------------------------------------------------
  // captureRegion — screenshot to PNG data URL
  // -----------------------------------------------------------------------

  captureRegion(x: number, y: number, w: number, h: number): string {
    x = Math.max(0, x | 0);
    y = Math.max(0, y | 0);
    w = Math.min(w | 0, this.width - x);
    h = Math.min(h | 0, this.height - y);
    if (w <= 0 || h <= 0) return "";

    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext("2d")!;
    const imgData = ctx.createImageData(w, h);
    const rgba = imgData.data;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const srcIdx = (y + py) * this.width + (x + px);
        const color = resolvePixelRGB(this.pixels[srcIdx], x + px, y + py);
        const dstIdx = (py * w + px) * 4;
        rgba[dstIdx] = color.r;
        rgba[dstIdx + 1] = color.g;
        rgba[dstIdx + 2] = color.b;
        rgba[dstIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return offscreen.toDataURL("image/png");
  }

  // -----------------------------------------------------------------------
  // Legacy drawing — kept for fontAdapter / TextInput / TextEdit shim path.
  // These operate on the shared pixel buffer and respect the clip stack.
  // Will be removed once text rendering uses native QuickDraw DrawString.
  // -----------------------------------------------------------------------

  drawHLine(x: number, y: number, w: number, color: number = BLACK) {
    x = x | 0;
    y = y | 0;
    w = w | 0;
    if (y < this.clip.y || y >= this.clip.y + this.clip.h) return;
    const x0 = Math.max(x, this.clip.x, 0);
    const x1 = Math.min(x + w, this.clip.x + this.clip.w, this.width);
    const row = y * this.width;
    for (let px = x0; px < x1; px++) {
      this.pixels[row + px] = color;
    }
  }

  drawVLine(x: number, y: number, h: number, color: number = BLACK) {
    x = x | 0;
    y = y | 0;
    h = h | 0;
    if (x < this.clip.x || x >= this.clip.x + this.clip.w) return;
    const y0 = Math.max(y, this.clip.y, 0);
    const y1 = Math.min(y + h, this.clip.y + this.clip.h, this.height);
    for (let py = y0; py < y1; py++) {
      this.pixels[py * this.width + x] = color;
    }
  }

  drawRect(x: number, y: number, w: number, h: number, color: number = BLACK) {
    this.drawHLine(x, y, w, color);
    this.drawHLine(x, y + h - 1, w, color);
    this.drawVLine(x, y, h, color);
    this.drawVLine(x + w - 1, y, h, color);
  }

  fillRect(x: number, y: number, w: number, h: number, color: number = BLACK) {
    x = x | 0;
    y = y | 0;
    w = w | 0;
    h = h | 0;
    const x0 = Math.max(x, this.clip.x, 0);
    const y0 = Math.max(y, this.clip.y, 0);
    const x1 = Math.min(x + w, this.clip.x + this.clip.w, this.width);
    const y1 = Math.min(y + h, this.clip.y + this.clip.h, this.height);
    for (let py = y0; py < y1; py++) {
      const row = py * this.width;
      for (let px = x0; px < x1; px++) {
        this.pixels[row + px] = color;
      }
    }
  }
}
