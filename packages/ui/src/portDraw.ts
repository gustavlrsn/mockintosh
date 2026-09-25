import { CopyBits, GetPort, SetPort, srcCopy, type GrafPort } from "@mockintosh/quickdraw";
import { bitMapFromPixels, makeRect } from "@mockintosh/quickdraw/bits";

/**
 * Copy a 1-byte-per-pixel buffer (`0` = white, non-zero = black, rows
 * `width` apart) onto `port` with its top-left at `(x, y)` — the port-level
 * twin of `RasterSurface.blitPixels`, for ports an app is handed outside the
 * layout tree (such as `print.printPage`). Clipped by the port as usual.
 */
export function drawPixels(
  port: GrafPort,
  pixels: Uint8Array,
  width: number,
  height: number,
  x = 0,
  y = 0,
): void {
  if (width <= 0 || height <= 0) return;
  const previous = GetPort();
  SetPort(port);
  const src = bitMapFromPixels(pixels, width, height);
  CopyBits(src, port.portBits, src.bounds, makeRect(y, x, y + height, x + width), srcCopy, null);
  if (previous) SetPort(previous);
}
