import {
  FrameRect,
  GetPort,
  PenMode,
  PenNormal,
  PenPat,
  SetPort,
  patXor,
  type GrafPort,
  type Pattern,
} from "@mockintosh/quickdraw";
import { patternBits } from "@mockintosh/ui";

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

export interface ZoomAnimationOptions {
  /** Port to draw the XOR frames into (the screen port). */
  port: GrafPort;
  /** Show the framebuffer after each frame. */
  present: () => void;
  from: AnimRect;
  to: AnimRect;
  steps?: number;
  stepMs?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Animate the classic Macintosh "zoom open" or "zoom close" illusion:
 * a sequence of expanding or contracting rectangles drawn with XOR,
 * exactly as the original Finder implemented it.
 *
 * Each step:
 *   1. XOR-erase the previous rectangle (drawn in same mode → self-erasing)
 *   2. XOR-draw the next rectangle
 *   3. `present()` the framebuffer on the display
 *
 * The XOR technique (Mac notPatXor with DragPattern) guarantees visibility
 * against any background — the same mechanism used for DragGrayRgn outlines.
 * After the final frame the last rectangle is erased, leaving the screen
 * exactly as it was before the animation started.
 */
export function animateZoomRect(options: ZoomAnimationOptions): Promise<void> {
  const { port, present, from, to, steps = 4, stepMs = 30, onStart, onEnd } = options;
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

    /** XOR-frame `r` with the drag pattern; drawing it twice restores the screen. */
    function xorRect(r: AnimRect) {
      const saved = GetPort();
      SetPort(port);
      PenNormal();
      PenMode(patXor);
      PenPat(patternBits("darkCheckers") as Pattern);
      FrameRect({ left: r.x, top: r.y, right: r.x + r.width, bottom: r.y + r.height });
      PenNormal();
      if (saved) SetPort(saved);
    }

    onStart?.();

    function tick() {
      if (drawn) {
        xorRect(drawn);
        drawn = null;
      }

      if (idx >= sequence.length) {
        present();
        onEnd?.();
        resolve();
        return;
      }

      const r = sequence[idx++];
      xorRect(r);
      drawn = r;
      present();

      setTimeout(tick, stepMs);
    }

    tick();
  });
}
