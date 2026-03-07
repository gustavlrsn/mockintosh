/**
 * TextEdit.ts
 *
 * QuickDraw-native text input and text block rendering.
 * Consolidates and replaces the BitCanvas-based TextInput.ts and TextBlock.ts
 * drawing functions with GrafPort-based equivalents.
 *
 * Non-drawing state management and key/mouse handlers from TextInput.ts are
 * re-exported unchanged — they are pure state logic, independent of rendering.
 */

import type { GrafPort } from "@mockintosh/quickdraw";
import {
  drawBitmapText,
  measureText,
  getLineHeight,
  type FontName,
} from "../canvas/fontAdapter";
import { qdFillRect, qdDrawRect, qdDrawVLine } from "../canvas/qdDraw";
import { BitCanvas, BLACK, WHITE } from "../canvas/BitCanvas";

// Re-export state management and event handling from TextInput.ts
export {
  createTextInputState,
  handleTextInputKey,
  handleTextInputClick,
  handleTextInputDoubleClick,
  handleTextInputDrag,
  textInputHitTest,
  TEXT_CURSOR_BLINK_MS,
  type TextInputState,
} from "../canvas/ui/TextInput";

// Re-export text block utilities
export {
  getWrappedLines,
  measureTextBlock,
  type TextBlockOptions,
} from "../canvas/ui/TextBlock";

import { getWrappedLines as _getWrappedLines } from "../canvas/ui/TextBlock";

// -------------------------------------------------------------------------
// Internal: BitCanvas shim that shares the port's pixel buffer
// -------------------------------------------------------------------------

function _shim(port: GrafPort): BitCanvas {
  const { baseAddr, rowBytes } = port.portBits;
  const h = (baseAddr.length / rowBytes) | 0;
  const bc = new BitCanvas(rowBytes, h);
  (bc as any).pixels = baseAddr;
  return bc;
}

function _clip(port: GrafPort): { x: number; y: number; w: number; h: number } {
  const vis = port.visRgn?.rgn.rgnBBox;
  const clip = port.clipRgn?.rgn.rgnBBox;
  const pr = port.portRect;
  const rw = port.portBits.rowBytes;
  const rh = (port.portBits.baseAddr.length / rw) | 0;
  const x = Math.max(vis?.left ?? 0, clip?.left ?? 0, pr.left, 0);
  const y = Math.max(vis?.top ?? 0, clip?.top ?? 0, pr.top, 0);
  const x2 = Math.min(vis?.right ?? rw, clip?.right ?? rw, pr.right, rw);
  const y2 = Math.min(vis?.bottom ?? rh, clip?.bottom ?? rh, pr.bottom, rh);
  return { x, y, w: x2 - x, h: y2 - y };
}

// -------------------------------------------------------------------------
// drawTextEditField — text input using QuickDraw GrafPort
// -------------------------------------------------------------------------

export function drawTextEditField(
  port: GrafPort,
  state: import("../canvas/ui/TextInput").TextInputState,
  x: number,
  y: number,
  width: number,
  height: number = 16
): void {
  const bc = _shim(port);

  // Sync clip from port to BitCanvas
  const cl = _clip(port);
  bc.pushClip(cl.x, cl.y, cl.w, cl.h);

  bc.drawRect(x, y, width, height, BLACK);
  bc.fillRect(x + 1, y + 1, width - 2, height - 2, WHITE);

  const textX = x + 3;
  const textY = y + 1;

  const BLINK_INTERVAL_MS = 530;
  const isCursorVisible = () => {
    const elapsed = Date.now() - (state as any)._lastEditTime;
    return elapsed % (BLINK_INTERVAL_MS * 2) < BLINK_INTERVAL_MS;
  };

  const hasSel = state.selectionStart !== state.selectionEnd;
  const lo = hasSel ? Math.min(state.selectionStart, state.selectionEnd) : 0;
  const hi = hasSel ? Math.max(state.selectionStart, state.selectionEnd) : 0;

  if (state.focused && hasSel) {
    const selStartX =
      textX + measureText(state.value.substring(0, lo), "ChiKareGo");
    const selEndX =
      textX + measureText(state.value.substring(0, hi), "ChiKareGo");
    bc.fillRect(selStartX, y + 2, selEndX - selStartX, height - 4, BLACK);

    if (lo > 0)
      drawBitmapText(bc, state.value.substring(0, lo), textX, textY, {
        font: "ChiKareGo",
        color: BLACK,
      });
    drawBitmapText(bc, state.value.substring(lo, hi), selStartX, textY, {
      font: "ChiKareGo",
      color: WHITE,
    });
    if (hi < state.value.length)
      drawBitmapText(bc, state.value.substring(hi), selEndX, textY, {
        font: "ChiKareGo",
        color: BLACK,
      });
  } else {
    drawBitmapText(bc, state.value, textX, textY, {
      font: "ChiKareGo",
      color: BLACK,
    });

    const cursorPos = state.cursorPos;
    if (state.focused && isCursorVisible()) {
      const beforeCursor = state.value.substring(0, cursorPos);
      const cx = textX + measureText(beforeCursor, "ChiKareGo");
      bc.drawVLine(cx, y + 2, height - 4, BLACK);
    }
  }

  bc.popClip();
}

// -------------------------------------------------------------------------
// drawTextBlock — word-wrapped text using QuickDraw GrafPort
// -------------------------------------------------------------------------

export interface TextBlockOpts {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  font?: FontName;
  color?: number;
  lineSpacing?: number;
  /** Visible viewport scroll offset (used for culling off-screen lines) */
  scrollOffset?: number;
  /** Visible viewport height (used for culling) */
  viewHeight?: number;
}

export function drawTextBlockToPort(
  port: GrafPort,
  opts: TextBlockOpts
): number {
  const font = opts.font ?? "Geneva9";
  const color = opts.color ?? BLACK;
  const lineH = getLineHeight(font) + (opts.lineSpacing ?? 0);
  const lines = _getWrappedLines(opts.text, opts.maxWidth, font);
  const totalHeight = lines.length * lineH;

  const bc = _shim(port);
  const cl = _clip(port);
  bc.pushClip(cl.x, cl.y, cl.w, cl.h);

  const scrollOffset = opts.scrollOffset ?? 0;
  const viewBottom = scrollOffset + (opts.viewHeight ?? Infinity);

  for (let i = 0; i < lines.length; i++) {
    const ly = opts.y + i * lineH;
    if (ly + lineH <= scrollOffset || ly >= viewBottom) continue;
    if (!lines[i]) continue;
    drawBitmapText(bc, lines[i], opts.x, ly - scrollOffset, { font, color });
  }

  bc.popClip();
  return totalHeight;
}
