import { PatternName, getPattern, samplePattern } from "./patterns";

export const BLACK = 1;
export const WHITE = 0;

export interface Sprite {
  width: number;
  height: number;
  data: Uint8Array; // 1 byte per pixel, 0=white, 1=black
  mask?: Uint8Array; // 1=opaque, 0=transparent
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

  clear(color: number = WHITE) {
    this.pixels.fill(color);
  }

  setPixel(x: number, y: number, color: number = BLACK) {
    x = x | 0;
    y = y | 0;
    if (
      x < this.clip.x ||
      y < this.clip.y ||
      x >= this.clip.x + this.clip.w ||
      y >= this.clip.y + this.clip.h
    )
      return;
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.pixels[y * this.width + x] = color;
  }

  getPixel(x: number, y: number): number {
    x = x | 0;
    y = y | 0;
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
    return this.pixels[y * this.width + x];
  }

  pushClip(x: number, y: number, w: number, h: number) {
    this.clipStack.push({ ...this.clip });
    // Intersect with current clip
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

  drawDottedHLine(x: number, y: number, w: number, color: number = BLACK) {
    x = x | 0;
    y = y | 0;
    w = w | 0;
    if (y < this.clip.y || y >= this.clip.y + this.clip.h) return;
    const x0 = Math.max(x, this.clip.x, 0);
    const x1 = Math.min(x + w, this.clip.x + this.clip.w, this.width);
    const row = y * this.width;
    for (let px = x0; px < x1; px++) {
      if ((px - x) % 2 === 0) this.pixels[row + px] = color;
    }
  }

  drawDottedVLine(x: number, y: number, h: number, color: number = BLACK) {
    x = x | 0;
    y = y | 0;
    h = h | 0;
    if (x < this.clip.x || x >= this.clip.x + this.clip.w) return;
    const y0 = Math.max(y, this.clip.y, 0);
    const y1 = Math.min(y + h, this.clip.y + this.clip.h, this.height);
    for (let py = y0; py < y1; py++) {
      if ((py - y) % 2 === 0) this.pixels[py * this.width + x] = color;
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

  fillPattern(
    x: number,
    y: number,
    w: number,
    h: number,
    pattern: PatternName | Uint8Array,
    originX?: number,
    originY?: number
  ) {
    const pat = typeof pattern === "string" ? getPattern(pattern) : pattern;
    x = x | 0;
    y = y | 0;
    w = w | 0;
    h = h | 0;
    const ox = (originX ?? x) | 0;
    const oy = (originY ?? y) | 0;
    const x0 = Math.max(x, this.clip.x, 0);
    const y0 = Math.max(y, this.clip.y, 0);
    const x1 = Math.min(x + w, this.clip.x + this.clip.w, this.width);
    const y1 = Math.min(y + h, this.clip.y + this.clip.h, this.height);
    for (let py = y0; py < y1; py++) {
      const row = py * this.width;
      for (let px = x0; px < x1; px++) {
        this.pixels[row + px] = samplePattern(pat, px - ox, py - oy);
      }
    }
  }

  /** Erase black pixels where the pattern is white (AND mask). */
  maskPattern(
    x: number,
    y: number,
    w: number,
    h: number,
    pattern: PatternName | Uint8Array,
    originX?: number,
    originY?: number
  ) {
    const pat = typeof pattern === "string" ? getPattern(pattern) : pattern;
    x = x | 0;
    y = y | 0;
    w = w | 0;
    h = h | 0;
    const ox = (originX ?? x) | 0;
    const oy = (originY ?? y) | 0;
    const x0 = Math.max(x, this.clip.x, 0);
    const y0 = Math.max(y, this.clip.y, 0);
    const x1 = Math.min(x + w, this.clip.x + this.clip.w, this.width);
    const y1 = Math.min(y + h, this.clip.y + this.clip.h, this.height);
    for (let py = y0; py < y1; py++) {
      const row = py * this.width;
      for (let px = x0; px < x1; px++) {
        this.pixels[row + px] &= samplePattern(pat, px - ox, py - oy);
      }
    }
  }

  /**
   * XOR a pattern along the perimeter of a rectangle, 1 pixel wide.
   *
   * This matches the Mac Window Manager's notPatXor pen mode used by
   * DragGrayRgn / GrowWindow: the outline is always visible regardless of
   * what is underneath because XOR with a 50% gray pattern inverts every
   * other pixel, breaking any coincidence with a uniform background.
   * Drawing the same outline twice restores the original pixels exactly.
   */
  xorPatternRect(
    x: number,
    y: number,
    w: number,
    h: number,
    pattern: PatternName | Uint8Array = "gray50"
  ) {
    const pat = typeof pattern === "string" ? getPattern(pattern) : pattern;
    x = x | 0;
    y = y | 0;
    w = w | 0;
    h = h | 0;

    const xorRow = (row: number, px0: number, px1: number) => {
      if (row < this.clip.y || row >= this.clip.y + this.clip.h) return;
      if (row < 0 || row >= this.height) return;
      const r = row * this.width;
      const cx0 = Math.max(px0, this.clip.x, 0);
      const cx1 = Math.min(px1, this.clip.x + this.clip.w, this.width);
      for (let px = cx0; px < cx1; px++) {
        if (samplePattern(pat, px, row)) {
          this.pixels[r + px] ^= 1;
        }
      }
    };

    const xorCol = (col: number, py0: number, py1: number) => {
      if (col < this.clip.x || col >= this.clip.x + this.clip.w) return;
      if (col < 0 || col >= this.width) return;
      const cy0 = Math.max(py0, this.clip.y, 0);
      const cy1 = Math.min(py1, this.clip.y + this.clip.h, this.height);
      for (let py = cy0; py < cy1; py++) {
        if (samplePattern(pat, col, py)) {
          this.pixels[py * this.width + col] ^= 1;
        }
      }
    };

    // Top and bottom edges (full width)
    xorRow(y, x, x + w);
    xorRow(y + h - 1, x, x + w);
    // Left and right edges (interior rows to avoid double-drawing corners)
    xorCol(x, y + 1, y + h - 1);
    xorCol(x + w - 1, y + 1, y + h - 1);
  }

  /**
   * Invert a rectangular region (black <-> white).
   */
  invertRect(x: number, y: number, w: number, h: number) {
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
        this.pixels[row + px] ^= 1;
      }
    }
  }

  blit(sprite: Sprite, dx: number, dy: number) {
    dx = dx | 0;
    dy = dy | 0;
    const { width: sw, height: sh, data, mask } = sprite;
    for (let sy = 0; sy < sh; sy++) {
      const ty = dy + sy;
      if (ty < this.clip.y || ty >= this.clip.y + this.clip.h) continue;
      if (ty < 0 || ty >= this.height) continue;
      for (let sx = 0; sx < sw; sx++) {
        const tx = dx + sx;
        if (tx < this.clip.x || tx >= this.clip.x + this.clip.w) continue;
        if (tx < 0 || tx >= this.width) continue;
        const si = sy * sw + sx;
        if (mask && !mask[si]) continue; // transparent
        this.pixels[ty * this.width + tx] = data[si];
      }
    }
  }

  blitInverted(sprite: Sprite, dx: number, dy: number) {
    dx = dx | 0;
    dy = dy | 0;
    const { width: sw, height: sh, data, mask } = sprite;
    for (let sy = 0; sy < sh; sy++) {
      const ty = dy + sy;
      if (ty < this.clip.y || ty >= this.clip.y + this.clip.h) continue;
      if (ty < 0 || ty >= this.height) continue;
      for (let sx = 0; sx < sw; sx++) {
        const tx = dx + sx;
        if (tx < this.clip.x || tx >= this.clip.x + this.clip.w) continue;
        if (tx < 0 || tx >= this.width) continue;
        const si = sy * sw + sx;
        if (mask && !mask[si]) continue;
        this.pixels[ty * this.width + tx] = data[si] ^ 1;
      }
    }
  }

  /**
   * Blit with a shadow-outline effect: opaque pixels get a dithered pattern
   * (same logic as the existing canvas-image.tsx shadowOutline).
   */
  blitShadowOutline(sprite: Sprite, dx: number, dy: number) {
    dx = dx | 0;
    dy = dy | 0;
    const { width: sw, height: sh, mask } = sprite;
    if (!mask) return this.blit(sprite, dx, dy);
    for (let sy = 0; sy < sh; sy++) {
      const ty = dy + sy;
      if (ty < this.clip.y || ty >= this.clip.y + this.clip.h) continue;
      if (ty < 0 || ty >= this.height) continue;
      for (let sx = 0; sx < sw; sx++) {
        const tx = dx + sx;
        if (tx < this.clip.x || tx >= this.clip.x + this.clip.w) continue;
        if (tx < 0 || tx >= this.width) continue;
        const si = sy * sw + sx;
        if (!mask[si]) continue;
        const color =
          (tx % 4 === 0 && ty % 2 === 0) ||
          (tx % 2 === 0 && tx % 4 !== 0 && ty % 2 !== 0)
            ? BLACK
            : WHITE;
        this.pixels[ty * this.width + tx] = color;
      }
    }
  }

  /**
   * Blit only the outline (contour) of a sprite's opaque region.
   * A pixel is drawn if it is opaque and at least one 4-connected neighbor
   * is transparent or outside the sprite bounds.
   */
  blitOutline(sprite: Sprite, dx: number, dy: number, color: number = BLACK) {
    dx = dx | 0;
    dy = dy | 0;
    const { width: sw, height: sh, mask } = sprite;
    if (!mask) return;
    for (let sy = 0; sy < sh; sy++) {
      const ty = dy + sy;
      if (ty < this.clip.y || ty >= this.clip.y + this.clip.h) continue;
      if (ty < 0 || ty >= this.height) continue;
      for (let sx = 0; sx < sw; sx++) {
        const si = sy * sw + sx;
        if (!mask[si]) continue;
        const hasTransparentNeighbor =
          sx === 0 ||
          !mask[si - 1] ||
          sx === sw - 1 ||
          !mask[si + 1] ||
          sy === 0 ||
          !mask[(sy - 1) * sw + sx] ||
          sy === sh - 1 ||
          !mask[(sy + 1) * sw + sx];
        if (!hasTransparentNeighbor) continue;
        const tx = dx + sx;
        if (tx < this.clip.x || tx >= this.clip.x + this.clip.w) continue;
        if (tx < 0 || tx >= this.width) continue;
        this.pixels[ty * this.width + tx] = color;
      }
    }
  }

  /**
   * Copy raw RGBA ImageData into the BitCanvas, thresholding to 1-bit.
   * Useful for blitting dithered camera/video frames.
   */
  blitImageData(imageData: ImageData, dx: number, dy: number) {
    const { width: sw, height: sh, data } = imageData;
    dx = dx | 0;
    dy = dy | 0;
    for (let sy = 0; sy < sh; sy++) {
      const ty = dy + sy;
      if (ty < this.clip.y || ty >= this.clip.y + this.clip.h) continue;
      if (ty < 0 || ty >= this.height) continue;
      for (let sx = 0; sx < sw; sx++) {
        const tx = dx + sx;
        if (tx < this.clip.x || tx >= this.clip.x + this.clip.w) continue;
        if (tx < 0 || tx >= this.width) continue;
        const si = (sy * sw + sx) * 4;
        const alpha = data[si + 3];
        if (alpha < 128) continue;
        // Threshold: < 128 = black, >= 128 = white
        this.pixels[ty * this.width + tx] = data[si] < 128 ? BLACK : WHITE;
      }
    }
  }

  /**
   * Expand the 1-bit buffer to RGBA ImageData and put it on a real canvas context.
   */
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
      const color = this.pixels[i] ? 0 : 255; // 1=black->0, 0=white->255
      const j = i * 4;
      rgba[j] = color;
      rgba[j + 1] = color;
      rgba[j + 2] = color;
      rgba[j + 3] = 255;
    }
    ctx.putImageData(this.imageData, 0, 0);
  }

  /**
   * Capture a rectangular region of the 1-bit buffer as a PNG data URL.
   * Uses an offscreen canvas to encode the pixels.
   */
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
        const color = this.pixels[srcIdx] ? 0 : 255;
        const dstIdx = (py * w + px) * 4;
        rgba[dstIdx] = color;
        rgba[dstIdx + 1] = color;
        rgba[dstIdx + 2] = color;
        rgba[dstIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return offscreen.toDataURL("image/png");
  }
}
