/**
 * A print page is an off-screen QuickDraw port as wide as the paper. Apps and
 * the OS draw into it with ordinary QuickDraw calls — the same way the
 * Macintosh Printing Manager handed applications a printing GrafPort — and
 * the finished bitmap is encoded for the printer.
 */
import {
  ClosePort,
  EraseRect,
  GetPort,
  OpenPort,
  SetPort,
  SetPortBits,
  makeRect,
  newBitMap,
  type BitMap,
  type GrafPort,
} from "@mockintosh/quickdraw";

export interface PrintPage {
  /** Port whose `portRect` is `(0, 0, width, height)`. */
  readonly port: GrafPort;
  /** The page's pixels — a packed 1-bit QuickDraw bitmap, `1` = black. */
  readonly bits: BitMap;
  readonly width: number;
  readonly height: number;
}

/**
 * Allocate a blank (white) page `width` × `height` dots. `width` should be
 * the printer's dots-per-line so the raster fills the paper.
 */
export function createPrintPage(width: number, height: number): PrintPage {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  const bits = newBitMap(w, h);

  const previous = GetPort();
  const port = {} as GrafPort;
  OpenPort(port);
  SetPortBits(bits);
  port.portRect = makeRect(0, 0, h, w);
  port.visRgn.rgn.rgnBBox = makeRect(0, 0, h, w);
  port.visRgn.rgn.scanlines = undefined;
  port.clipRgn.rgn.rgnBBox = makeRect(0, 0, h, w);
  port.clipRgn.rgn.scanlines = undefined;
  EraseRect(port.portRect);
  if (previous) SetPort(previous);

  return { port, bits, width: w, height: h };
}

/**
 * Make `page.port` the current QuickDraw port for the duration of `draw`,
 * then restore whichever port was current before.
 */
export function drawOnPage<T>(page: PrintPage, draw: (port: GrafPort) => T): T {
  const previous = GetPort();
  SetPort(page.port);
  try {
    return draw(page.port);
  } finally {
    if (previous) SetPort(previous);
  }
}

/** Free the page's port. The bitmap stays valid for as long as it is referenced. */
export function disposePrintPage(page: PrintPage): void {
  ClosePort(page.port);
}
