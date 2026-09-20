import type { BitMap } from "@mockintosh/quickdraw";
import {
  copyHostPalette,
  DEFAULT_HOST_PALETTE,
  paintBitMapRgba,
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
}
