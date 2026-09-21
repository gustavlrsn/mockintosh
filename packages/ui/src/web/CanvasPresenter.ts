import type { BitMap, Rect } from "@mockintosh/quickdraw";
import {
  copyHostPalette,
  DEFAULT_HOST_PALETTE,
  paintBitMapRgba,
  paintBitMapRgbaRect,
  type HostPalette,
} from "./palette";

/** Expand a packed 1-bit QuickDraw BitMap to RGBA on a 2D canvas. */
export class CanvasPresenter {
  private readonly imageData: ImageData;
  private palette: HostPalette;

  constructor(
    private readonly screen: BitMap,
    private readonly ctx: CanvasRenderingContext2D,
    palette: HostPalette = DEFAULT_HOST_PALETTE,
  ) {
    const width = screen.bounds.right - screen.bounds.left;
    const height = screen.bounds.bottom - screen.bounds.top;
    this.imageData = ctx.createImageData(width, height);
    this.palette = copyHostPalette(palette);
  }

  setPalette(palette: HostPalette): void {
    this.palette = copyHostPalette(palette);
  }

  getPalette(): HostPalette {
    return copyHostPalette(this.palette);
  }

  present(source: BitMap = this.screen): void {
    const { width, height, data: rgba } = this.imageData;
    paintBitMapRgba(source, rgba, width, height, this.palette);
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  /** Expand and blit one rectangle. `rect` may extend past the canvas. */
  presentRect(source: BitMap, rect: Rect): void {
    const { width, height, data: rgba } = this.imageData;
    const left = Math.max(0, rect.left | 0);
    const top = Math.max(0, rect.top | 0);
    const rw = Math.min(width, rect.right | 0) - left;
    const rh = Math.min(height, rect.bottom | 0) - top;
    if (rw < 1 || rh < 1) return;
    paintBitMapRgbaRect(source, rgba, width, height, left, top, rw, rh, this.palette);
    this.ctx.putImageData(this.imageData, 0, 0, left, top, rw, rh);
  }
}
