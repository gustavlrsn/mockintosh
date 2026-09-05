import { BitCanvas } from "./BitCanvas";
import type { GrafPort } from "@mockintosh/quickdraw";
import { qdXorPatternRect } from "./qdDraw";

export interface AnimRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rectsEqual(a: AnimRect, b: AnimRect): boolean {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}

/**
 * Helper: flush a GrafPort's pixel buffer to a 2D context. Uses a temporary
 * BitCanvas wrapper that shares the port's baseAddr (no copy).
 */
function flushPort(port: GrafPort, ctx2d: CanvasRenderingContext2D): void {
  const { baseAddr, rowBytes } = port.portBits;
  const height = (baseAddr.length / rowBytes) | 0;
  const tmpBc = new BitCanvas(rowBytes, height);
  (tmpBc as any).pixels = baseAddr;
  tmpBc.flush(ctx2d);
}

/**
 * Animate the classic Macintosh "zoom open" or "zoom close" illusion:
 * a sequence of expanding or contracting rectangles drawn with XOR,
 * exactly as the original Finder implemented it.
 *
 * Each step:
 *   1. XOR-erase the previous rectangle (drawn in same mode → self-erasing)
 *   2. XOR-draw the next rectangle
 *   3. Flush the pixel buffer to the real 2D context
 *
 * The XOR technique (Mac notPatXor with DragPattern) guarantees visibility
 * against any background — the same mechanism used for DragGrayRgn outlines.
 * After the final frame the last rectangle is erased, leaving the screen
 * exactly as it was before the animation started.
 */
export function animateZoomRect(
  port: GrafPort,
  ctx2d: CanvasRenderingContext2D,
  from: AnimRect,
  to: AnimRect,
  steps: number = 4,
  stepMs: number = 30,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  return new Promise((resolve) => {
    const sequence: AnimRect[] = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const r: AnimRect = {
        x: Math.round(from.x + (to.x - from.x) * t),
        y: Math.round(from.y + (to.y - from.y) * t),
        width: Math.round(from.width + (to.width - from.width) * t),
        height: Math.round(from.height + (to.height - from.height) * t),
      };
      if (r.width < 2 || r.height < 2) continue;
      if (sequence.length > 0 && rectsEqual(r, sequence[sequence.length - 1]))
        continue;
      sequence.push(r);
    }

    if (sequence.length === 0) {
      resolve();
      return;
    }

    let idx = 0;
    let drawn: AnimRect | null = null;

    function xorRect(r: AnimRect) {
      qdXorPatternRect(port, r.x, r.y, r.width, r.height, "darkCheckers");
    }

    onStart?.();

    function tick() {
      if (drawn) {
        xorRect(drawn);
        drawn = null;
      }

      if (idx >= sequence.length) {
        flushPort(port, ctx2d);
        onEnd?.();
        resolve();
        return;
      }

      const r = sequence[idx++];
      xorRect(r);
      drawn = r;
      flushPort(port, ctx2d);

      setTimeout(tick, stepMs);
    }

    tick();
  });
}
