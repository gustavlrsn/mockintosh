import { BitCanvas } from "./BitCanvas";

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
 * Animate the classic Macintosh "zoom open" or "zoom close" illusion:
 * a sequence of expanding or contracting rectangles drawn with XOR,
 * exactly as the original Finder implemented it.
 *
 * Each step:
 *   1. XOR-erase the previous rectangle (drawn in same mode → self-erasing)
 *   2. XOR-draw the next rectangle
 *   3. Flush the BitCanvas to the real 2D context
 *
 * The XOR technique (Mac notPatXor with DragPattern) guarantees visibility
 * against any background — the same mechanism used for DragGrayRgn outlines.
 * After the final frame the last rectangle is erased, leaving the screen
 * exactly as it was before the animation started.
 *
 * @param canvas   The OS BitCanvas (already contains the current frame)
 * @param ctx2d    The real canvas 2D context for flushing each step
 * @param from     Starting rectangle (icon cell for open; window rect for close)
 * @param to       Ending rectangle (window rect for open; icon cell for close)
 * @param steps    Number of intermediate rectangles (default 4, classic Mac used 4)
 * @param stepMs   Milliseconds per step (default 30 — ~33fps, feels snappy)
 */
export function animateZoomRect(
  canvas: BitCanvas,
  ctx2d: CanvasRenderingContext2D,
  from: AnimRect,
  to: AnimRect,
  steps: number = 4,
  stepMs: number = 30,
  /** Called just before the first frame — use to pause the normal render loop */
  onStart?: () => void,
  /** Called after the last frame is erased — use to resume the normal render loop */
  onEnd?: () => void
): Promise<void> {
  return new Promise((resolve) => {
    // Pre-compute the unique sequence of rects up front, deduplicating
    // consecutive identical rects that arise from integer rounding near the
    // small end of a close animation — avoids XOR flicker (draw, erase, redraw
    // the same pixels in consecutive ticks).
    const sequence: AnimRect[] = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const r: AnimRect = {
        x: Math.round(from.x + (to.x - from.x) * t),
        y: Math.round(from.y + (to.y - from.y) * t),
        width: Math.round(from.width + (to.width - from.width) * t),
        height: Math.round(from.height + (to.height - from.height) * t),
      };
      // Skip degenerate rects and exact duplicates of the previous entry
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
      canvas.xorPatternRect(r.x, r.y, r.width, r.height, "darkCheckers");
    }

    onStart?.();

    function tick() {
      // Erase whatever is currently drawn
      if (drawn) {
        xorRect(drawn);
        drawn = null;
      }

      if (idx >= sequence.length) {
        // All rects shown and erased — screen is restored to pre-animation state
        canvas.flush(ctx2d);
        onEnd?.();
        resolve();
        return;
      }

      const r = sequence[idx++];
      xorRect(r);
      drawn = r;
      canvas.flush(ctx2d);

      setTimeout(tick, stepMs);
    }

    tick();
  });
}
