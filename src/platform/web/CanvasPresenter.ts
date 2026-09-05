/**
 * CanvasPresenter — puts the packed 1-bit screen on a 2D canvas.
 *
 * This is the web implementation of the display half of the platform layer:
 * it owns nothing but an `ImageData` scratch buffer and knows how to expand
 * QuickDraw's `screenBits` (8 pixels per byte, MSB leftmost, `1` = black) to
 * RGBA. A 1-bit panel driver would hand the same bytes to the hardware.
 */
import type { BitMap } from "@mockintosh/quickdraw";

export class CanvasPresenter {
  private readonly imageData: ImageData;

  constructor(
    private readonly screen: BitMap,
    private readonly ctx: CanvasRenderingContext2D
  ) {
    const width = screen.bounds.right - screen.bounds.left;
    const height = screen.bounds.bottom - screen.bounds.top;
    this.imageData = ctx.createImageData(width, height);
  }

  /** Expand the current framebuffer to RGBA and put it on the canvas. */
  present(): void {
    const { baseAddr, rowBytes } = this.screen;
    const { width, height, data: rgba } = this.imageData;
    let j = 0;
    for (let y = 0; y < height; y++) {
      const row = y * rowBytes;
      for (let x = 0; x < width; x++, j += 4) {
        const v = (baseAddr[row + (x >> 3)] >> (7 - (x & 7))) & 1 ? 0 : 255;
        rgba[j] = v;
        rgba[j + 1] = v;
        rgba[j + 2] = v;
        rgba[j + 3] = 255;
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }
}
