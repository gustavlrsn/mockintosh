/**
 * qdDraw.ts
 *
 * Thin convenience wrappers that translate the (x, y, w, h, color) coordinate
 * style used throughout WindowManager and drawMenubar into QuickDraw GrafPort
 * calls (Rect-based, mode-based).
 *
 * Every function sets thePort, performs the operation, then restores the
 * previous port. Callers do not need to manage port state themselves.
 *
 * "color" follows the BitCanvas convention: 1 = black, 0 = white.
 */

import {
  SetPort,
  GetPort,
  makeRect,
  PenNormal,
  PenMode,
  PenPat,
  PenSize,
  MoveTo,
  Line,
  FrameRect,
  PaintRect,
  EraseRect,
  InvertRect,
  FillRect,
  FrameRoundRect,
  PaintRoundRect,
  DrawString,
  patXor,
  type GrafPort,
  type Pattern,
} from "@mockintosh/quickdraw";
import { namedPatternToQD, QD_PATTERNS } from "./patternBridge";
import type { PatternName } from "./patterns";

// -------------------------------------------------------------------------
// Internal: convert color to pen/fill pattern
// -------------------------------------------------------------------------

const PAT_BLACK = QD_PATTERNS.black;
const PAT_WHITE = QD_PATTERNS.white;

function colorToPat(color: number): Pattern {
  return color !== 0 ? PAT_BLACK : PAT_WHITE;
}

// -------------------------------------------------------------------------
// Core drawing helpers — each sets thePort, draws, restores previous port
// -------------------------------------------------------------------------

function withPort<T>(port: GrafPort, fn: () => T): T {
  const prev = GetPort();
  SetPort(port);
  const result = fn();
  if (prev) SetPort(prev);
  return result;
}

// -------------------------------------------------------------------------
// Rectangle operations
// -------------------------------------------------------------------------

export function qdFillRect(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  withPort(port, () => {
    const r = makeRect(x, y, x + w, y + h);
    if (color !== 0) {
      // Set pnPat to black and pnMode to patCopy, then PaintRect
      PenNormal();
      PaintRect(r);
    } else {
      // EraseRect uses bkPat (white by default) — no need to change pen state
      EraseRect(r);
    }
  });
}

export function qdDrawRect(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number = 1
): void {
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(color));
    FrameRect(makeRect(x, y, x + w, y + h));
    PenNormal();
  });
}

export function qdInvertRect(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  withPort(port, () => {
    PenNormal();
    InvertRect(makeRect(x, y, x + w, y + h));
  });
}

export function qdFillPattern(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  pattern: PatternName | Uint8Array
): void {
  withPort(port, () => {
    const pat =
      typeof pattern === "string"
        ? namedPatternToQD(pattern)
        : (pattern as Pattern);
    FillRect(makeRect(x, y, x + w, y + h), pat);
  });
}

export function qdFillRoundRect(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  ovalW: number,
  ovalH: number,
  color: number = 1
): void {
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(color));
    PaintRoundRect(makeRect(x, y, x + w, y + h), ovalW, ovalH);
    PenNormal();
  });
}

export function qdFrameRoundRect(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  ovalW: number,
  ovalH: number,
  penWidth: number = 1,
  color: number = 1
): void {
  withPort(port, () => {
    PenNormal();
    PenSize(penWidth, penWidth);
    PenPat(colorToPat(color));
    FrameRoundRect(makeRect(x, y, x + w, y + h), ovalW, ovalH);
    PenNormal();
  });
}

// -------------------------------------------------------------------------
// Line operations
// -------------------------------------------------------------------------

export function qdDrawHLine(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  color: number = 1
): void {
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(color));
    MoveTo(x, y);
    Line(w - 1, 0);
    PenNormal();
  });
}

export function qdDrawVLine(
  port: GrafPort,
  x: number,
  y: number,
  h: number,
  color: number = 1
): void {
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(color));
    MoveTo(x, y);
    Line(0, h - 1);
    PenNormal();
  });
}

export function qdSetPixel(
  port: GrafPort,
  x: number,
  y: number,
  color: number = 1
): void {
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(color));
    PenSize(1, 1);
    MoveTo(x, y);
    Line(0, 0);
    PenNormal();
  });
}

export function qdDrawDottedHLine(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  color: number = 1
): void {
  // Draw every other pixel — use a dotted pen pattern with even columns
  const dotPat = new Uint8Array([
    0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa,
  ]);
  withPort(port, () => {
    PenNormal();
    PenPat(dotPat as Pattern);
    MoveTo(x, y);
    Line(w - 1, 0);
    PenNormal();
  });
}

export function qdDrawDottedVLine(
  port: GrafPort,
  x: number,
  y: number,
  h: number,
  color: number = 1
): void {
  const dotPat = new Uint8Array([
    0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa,
  ]);
  withPort(port, () => {
    PenNormal();
    PenPat(dotPat as Pattern);
    MoveTo(x, y);
    Line(0, h - 1);
    PenNormal();
  });
}

// -------------------------------------------------------------------------
// XOR pattern perimeter (replaces BitCanvas.xorPatternRect)
// Used for drag outlines and zoom animations.
// -------------------------------------------------------------------------

export function qdXorPatternRect(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  pattern: PatternName | Uint8Array = "darkCheckers"
): void {
  const pat = (
    typeof pattern === "string" ? namedPatternToQD(pattern) : pattern
  ) as Pattern;
  withPort(port, () => {
    PenNormal();
    PenMode(patXor);
    PenPat(pat);

    // Top edge
    MoveTo(x, y);
    Line(w - 1, 0);
    // Bottom edge
    MoveTo(x, y + h - 1);
    Line(w - 1, 0);
    // Left edge (interior rows to avoid double-drawing corners)
    MoveTo(x, y + 1);
    Line(0, h - 3);
    // Right edge (interior rows)
    MoveTo(x + w - 1, y + 1);
    Line(0, h - 3);

    PenNormal();
  });
}

// -------------------------------------------------------------------------
// Mask pattern (AND mask — same as BitCanvas.maskPattern)
// Used for disabled menu items.
// -------------------------------------------------------------------------

export function qdMaskPattern(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  pattern: PatternName | Uint8Array
): void {
  // patBic: clears destination bits where pattern is 1 (src & ~dst = keep only 0-bits of pattern)
  // For gray50 masking (erase every other pixel), we want: dst = dst & ~pat
  // In QD that's mode srcBic (3) with pattern, but we use direct pixel manipulation here
  // since QD's patBic mode is "src & ~dst" not "dst & ~src".
  // We write directly to the pixel buffer for correctness.
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const vis = port.visRgn?.rgn.rgnBBox;
  const clip = port.clipRgn?.rgn.rgnBBox;
  const pr = port.portRect;
  const totalRows = (pixels.length / rowBytes) | 0;
  const x0 = Math.max(x, vis?.left ?? 0, clip?.left ?? 0, pr.left, 0);
  const y0 = Math.max(y, vis?.top ?? 0, clip?.top ?? 0, pr.top, 0);
  const x1 = Math.min(
    x + w,
    vis?.right ?? rowBytes,
    clip?.right ?? rowBytes,
    pr.right,
    rowBytes
  );
  const y1 = Math.min(
    y + h,
    vis?.bottom ?? totalRows,
    clip?.bottom ?? totalRows,
    pr.bottom,
    totalRows
  );

  const pat =
    typeof pattern === "string"
      ? namedPatternToQD(pattern)
      : (pattern as Pattern);

  for (let py = y0; py < y1; py++) {
    const row = py * rowBytes;
    const patRow = pat[py & 7];
    for (let px = x0; px < x1; px++) {
      const bit = (patRow >> (7 - (px & 7))) & 1;
      pixels[row + px] &= bit; // clear pixel where pattern is 0 (keep where 1)
    }
  }
}

// -------------------------------------------------------------------------
// Text drawing
// -------------------------------------------------------------------------

export function qdDrawText(
  port: GrafPort,
  text: string,
  x: number,
  y: number,
  color: number = 1
): void {
  // Use QuickDraw's DrawString which routes through the injected font function
  // (set up in main.tsx via __injectFontFunctions).
  // The injected function reads port.portBits, clipRgn, visRgn.
  withPort(port, () => {
    MoveTo(x, y);
    DrawString(text);
  });
  // If color is WHITE, post-process: invert the pixels we just drew.
  // This is simpler than re-implementing color in the font bridge.
  if (color === 0) {
    // We don't have per-glyph bounds easily here, so this approach is not ideal;
    // callers should use qdDrawBitmapText from fontAdapter for white text.
  }
}
