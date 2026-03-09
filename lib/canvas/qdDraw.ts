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
 * "color" follows the indexed-buffer convention: `0` = white, `1` = black,
 * `2..255` = palette indices managed by Mockintosh.
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
  FrameArc,
  PaintArc,
  DrawString,
  patXor,
  type GrafPort,
  type Pattern,
} from "@mockintosh/quickdraw";
import { namedPatternToQD, QD_PATTERNS } from "./patternBridge";
import type { PatternName } from "./patterns";
import {
  BLACK_INDEX,
  WHITE_INDEX,
  clampColorIndex,
  colorIndexToMonochromeBit,
  getColorMode,
  resolveStrokeColor,
} from "./ColorSystem";

const PAT_BLACK = QD_PATTERNS.black;
const PAT_WHITE = QD_PATTERNS.white;

interface ClipBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function colorToPat(color: number): Pattern {
  return color !== WHITE_INDEX ? PAT_BLACK : PAT_WHITE;
}

function withPort<T>(port: GrafPort, fn: () => T): T {
  const prev = GetPort();
  SetPort(port);
  const result = fn();
  if (prev) SetPort(prev);
  return result;
}

function getPortClip(port: GrafPort): ClipBounds {
  const vis = port.visRgn?.rgn.rgnBBox;
  const clip = port.clipRgn?.rgn.rgnBBox;
  const pr = port.portRect;
  const bnd = port.portBits.bounds;
  return {
    left: Math.max(
      vis?.left ?? bnd.left,
      clip?.left ?? bnd.left,
      pr.left,
      bnd.left
    ),
    top: Math.max(vis?.top ?? bnd.top, clip?.top ?? bnd.top, pr.top, bnd.top),
    right: Math.min(
      vis?.right ?? bnd.right,
      clip?.right ?? bnd.right,
      pr.right,
      bnd.right
    ),
    bottom: Math.min(
      vis?.bottom ?? bnd.bottom,
      clip?.bottom ?? bnd.bottom,
      pr.bottom,
      bnd.bottom
    ),
  };
}

function setPixelRaw(
  port: GrafPort,
  x: number,
  y: number,
  color: number
): void {
  const clip = getPortClip(port);
  if (x < clip.left || x >= clip.right || y < clip.top || y >= clip.bottom) {
    return;
  }
  const { baseAddr, rowBytes, bounds } = port.portBits;
  baseAddr[(y - bounds.top) * rowBytes + (x - bounds.left)] =
    clampColorIndex(color);
}

function fillRectRaw(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  if (w <= 0 || h <= 0) return;
  const clip = getPortClip(port);
  const { baseAddr, rowBytes, bounds } = port.portBits;
  const fillColor = clampColorIndex(color);
  const x0 = Math.max(x, clip.left);
  const y0 = Math.max(y, clip.top);
  const x1 = Math.min(x + w, clip.right);
  const y1 = Math.min(y + h, clip.bottom);
  for (let py = y0; py < y1; py++) {
    const row = (py - bounds.top) * rowBytes;
    baseAddr.fill(
      fillColor,
      row + (x0 - bounds.left),
      row + (x1 - bounds.left)
    );
  }
}

function fillRectMonochromeDithered(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  if (w <= 0 || h <= 0) return;
  const clip = getPortClip(port);
  const { baseAddr, rowBytes, bounds } = port.portBits;
  const normalized = clampColorIndex(color);
  const x0 = Math.max(x, clip.left);
  const y0 = Math.max(y, clip.top);
  const x1 = Math.min(x + w, clip.right);
  const y1 = Math.min(y + h, clip.bottom);
  for (let py = y0; py < y1; py++) {
    const row = (py - bounds.top) * rowBytes;
    for (let px = x0; px < x1; px++) {
      baseAddr[row + (px - bounds.left)] = colorIndexToMonochromeBit(
        normalized,
        px,
        py
      );
    }
  }
}

function drawHLineRaw(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  color: number
): void {
  fillRectRaw(port, x, y, w, 1, color);
}

function drawVLineRaw(
  port: GrafPort,
  x: number,
  y: number,
  h: number,
  color: number
): void {
  if (h <= 0) return;
  const clip = getPortClip(port);
  if (x < clip.left || x >= clip.right) return;
  const { baseAddr, rowBytes, bounds } = port.portBits;
  const drawColor = clampColorIndex(color);
  const y0 = Math.max(y, clip.top);
  const y1 = Math.min(y + h, clip.bottom);
  for (let py = y0; py < y1; py++) {
    baseAddr[(py - bounds.top) * rowBytes + (x - bounds.left)] = drawColor;
  }
}

function drawRectRaw(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  drawHLineRaw(port, x, y, w, color);
  drawHLineRaw(port, x, y + h - 1, w, color);
  drawVLineRaw(port, x, y, h, color);
  drawVLineRaw(port, x + w - 1, y, h, color);
}

function drawDottedLineRaw(
  port: GrafPort,
  x: number,
  y: number,
  length: number,
  color: number,
  vertical: boolean
): void {
  const drawColor = clampColorIndex(color);
  for (let i = 0; i < length; i += 2) {
    if (vertical) {
      setPixelRaw(port, x, y + i, drawColor);
    } else {
      setPixelRaw(port, x + i, y, drawColor);
    }
  }
}

function fillRoundRectRaw(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  ovalW: number,
  ovalH: number,
  color: number,
  dithered: boolean
): void {
  const rx = Math.max(1, Math.min(Math.floor(ovalW / 2), Math.floor(w / 2)));
  const ry = Math.max(1, Math.min(Math.floor(ovalH / 2), Math.floor(h / 2)));
  for (let py = 0; py < h; py++) {
    let inset = 0;
    if (py < ry) {
      const dy = (ry - py - 0.5) / ry;
      inset = Math.max(
        0,
        Math.ceil(rx - rx * Math.sqrt(Math.max(0, 1 - dy * dy)))
      );
    } else if (py >= h - ry) {
      const dy = (py - (h - ry) + 0.5) / ry;
      inset = Math.max(
        0,
        Math.ceil(rx - rx * Math.sqrt(Math.max(0, 1 - dy * dy)))
      );
    }
    const spanX = x + inset;
    const spanW = w - inset * 2;
    if (spanW <= 0) continue;
    if (dithered) {
      fillRectMonochromeDithered(port, spanX, y + py, spanW, 1, color);
    } else {
      fillRectRaw(port, spanX, y + py, spanW, 1, color);
    }
  }
}

function frameRoundRectRaw(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  ovalW: number,
  ovalH: number,
  penWidth: number,
  color: number
): void {
  fillRoundRectRaw(port, x, y, w, h, ovalW, ovalH, color, false);
  const innerW = w - penWidth * 2;
  const innerH = h - penWidth * 2;
  if (innerW <= 0 || innerH <= 0) return;
  fillRoundRectRaw(
    port,
    x + penWidth,
    y + penWidth,
    innerW,
    innerH,
    Math.max(1, ovalW - penWidth * 2),
    Math.max(1, ovalH - penWidth * 2),
    WHITE_INDEX,
    false
  );
}

const ROUND_RECT_CORNERS = [
  { start: 270, arc: 90 },
  { start: 0, arc: 90 },
  { start: 90, arc: 90 },
  { start: 180, arc: 90 },
];

export function qdFillRect(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  const normalized = clampColorIndex(color);
  if (normalized > BLACK_INDEX) {
    if (getColorMode() === "colors") {
      fillRectRaw(port, x, y, w, h, normalized);
    } else {
      fillRectMonochromeDithered(port, x, y, w, h, normalized);
    }
    return;
  }
  withPort(port, () => {
    const r = makeRect(y, x, y + h, x + w);
    if (normalized !== WHITE_INDEX) {
      PenNormal();
      PaintRect(r);
    } else {
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
  color: number = BLACK_INDEX
): void {
  const drawColor = resolveStrokeColor(color);
  if (getColorMode() === "colors" && drawColor > BLACK_INDEX) {
    drawRectRaw(port, x, y, w, h, drawColor);
    return;
  }
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(drawColor));
    FrameRect(makeRect(y, x, y + h, x + w));
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
    InvertRect(makeRect(y, x, y + h, x + w));
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
    FillRect(makeRect(y, x, y + h, x + w), pat);
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
  color: number = BLACK_INDEX
): void {
  const normalized = clampColorIndex(color);
  if (normalized > BLACK_INDEX) {
    fillRoundRectRaw(
      port,
      x,
      y,
      w,
      h,
      ovalW,
      ovalH,
      normalized,
      getColorMode() !== "colors"
    );
    return;
  }
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(normalized));
    const halfOvW = Math.floor(ovalW / 2);
    const halfOvH = Math.floor(ovalH / 2);
    const cornerRects = [
      makeRect(y, x, y + ovalH, x + ovalW),
      makeRect(y, x + w - ovalW, y + ovalH, x + w),
      makeRect(y + h - ovalH, x + w - ovalW, y + h, x + w),
      makeRect(y + h - ovalH, x, y + h, x + ovalW),
    ];
    for (let i = 0; i < 4; i++) {
      PaintArc(
        cornerRects[i],
        ROUND_RECT_CORNERS[i].start,
        ROUND_RECT_CORNERS[i].arc
      );
    }
    PaintRect(makeRect(y + halfOvH, x, y + h - halfOvH, x + w));
    PaintRect(makeRect(y, x + halfOvW, y + halfOvH, x + w - halfOvW));
    PaintRect(makeRect(y + h - halfOvH, x + halfOvW, y + h, x + w - halfOvW));
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
  color: number = BLACK_INDEX
): void {
  const drawColor = resolveStrokeColor(color);
  if (getColorMode() === "colors" && drawColor > BLACK_INDEX) {
    frameRoundRectRaw(port, x, y, w, h, ovalW, ovalH, penWidth, drawColor);
    return;
  }
  withPort(port, () => {
    PenNormal();
    PenSize(penWidth, penWidth);
    PenPat(colorToPat(drawColor));
    const halfOvW = Math.floor(ovalW / 2);
    const halfOvH = Math.floor(ovalH / 2);
    const ph = Math.max(1, penWidth);
    const pw = ph;
    const cornerRects = [
      makeRect(y, x, y + ovalH, x + ovalW),
      makeRect(y, x + w - ovalW, y + ovalH, x + w),
      makeRect(y + h - ovalH, x + w - ovalW, y + h, x + w),
      makeRect(y + h - ovalH, x, y + h, x + ovalW),
    ];
    for (let i = 0; i < 4; i++) {
      FrameArc(
        cornerRects[i],
        ROUND_RECT_CORNERS[i].start,
        ROUND_RECT_CORNERS[i].arc
      );
    }
    PaintRect(makeRect(y, x + halfOvW, y + ph, x + w - halfOvW));
    PaintRect(makeRect(y + h - ph, x + halfOvW, y + h, x + w - halfOvW));
    PaintRect(makeRect(y + halfOvH, x, y + h - halfOvH, x + pw));
    PaintRect(makeRect(y + halfOvH, x + w - pw, y + h - halfOvH, x + w));
    PenNormal();
  });
}

export function qdDrawHLine(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  color: number = BLACK_INDEX
): void {
  const drawColor = resolveStrokeColor(color);
  if (getColorMode() === "colors" && drawColor > BLACK_INDEX) {
    drawHLineRaw(port, x, y, w, drawColor);
    return;
  }
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(drawColor));
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
  color: number = BLACK_INDEX
): void {
  const drawColor = resolveStrokeColor(color);
  if (getColorMode() === "colors" && drawColor > BLACK_INDEX) {
    drawVLineRaw(port, x, y, h, drawColor);
    return;
  }
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(drawColor));
    MoveTo(x, y);
    Line(0, h - 1);
    PenNormal();
  });
}

export function qdSetPixel(
  port: GrafPort,
  x: number,
  y: number,
  color: number = BLACK_INDEX
): void {
  const drawColor = resolveStrokeColor(color);
  if (getColorMode() === "colors" && drawColor > BLACK_INDEX) {
    setPixelRaw(port, x, y, drawColor);
    return;
  }
  withPort(port, () => {
    PenNormal();
    PenPat(colorToPat(drawColor));
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
  color: number = BLACK_INDEX
): void {
  const drawColor = resolveStrokeColor(color);
  if (getColorMode() === "colors" && drawColor > BLACK_INDEX) {
    drawDottedLineRaw(port, x, y, w, drawColor, false);
    return;
  }
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
  color: number = BLACK_INDEX
): void {
  const drawColor = resolveStrokeColor(color);
  if (getColorMode() === "colors" && drawColor > BLACK_INDEX) {
    drawDottedLineRaw(port, x, y, h, drawColor, true);
    return;
  }
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
    MoveTo(x, y);
    Line(w - 1, 0);
    MoveTo(x, y + h - 1);
    Line(w - 1, 0);
    MoveTo(x, y + 1);
    Line(0, h - 3);
    MoveTo(x + w - 1, y + 1);
    Line(0, h - 3);
    PenNormal();
  });
}

export function qdMaskPattern(
  port: GrafPort,
  x: number,
  y: number,
  w: number,
  h: number,
  pattern: PatternName | Uint8Array
): void {
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const bnd = port.portBits.bounds;
  const clip = getPortClip(port);
  const x0 = Math.max(x, clip.left);
  const y0 = Math.max(y, clip.top);
  const x1 = Math.min(x + w, clip.right);
  const y1 = Math.min(y + h, clip.bottom);
  const pat =
    typeof pattern === "string"
      ? namedPatternToQD(pattern)
      : (pattern as Pattern);
  for (let py = y0; py < y1; py++) {
    const row = (py - bnd.top) * rowBytes;
    const patRow = pat[py & 7];
    for (let px = x0; px < x1; px++) {
      const bit = (patRow >> (7 - (px & 7))) & 1;
      const idx = row + (px - bnd.left);
      pixels[idx] &= bit;
    }
  }
}

export function qdDrawText(
  port: GrafPort,
  text: string,
  x: number,
  y: number,
  color: number = BLACK_INDEX
): void {
  const textPort = port as GrafPort & { txColor?: number };
  const previousColor = textPort.txColor ?? BLACK_INDEX;
  textPort.txColor = resolveStrokeColor(color);
  withPort(port, () => {
    MoveTo(x, y);
    DrawString(text);
  });
  textPort.txColor = previousColor;
}
