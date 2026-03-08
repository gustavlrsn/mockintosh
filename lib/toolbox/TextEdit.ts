/**
 * TextEdit.ts — TextEdit path for editable text (original Mac architecture).
 *
 * Editable text is separate from the Control Manager (buttons, scroll bars, etc.).
 * QuickDraw-native text input and text block rendering; uses SetPort, ClipRect,
 * MoveTo, DrawString so text respects port clipping.
 *
 * Non-drawing state management and key/mouse handlers from TextInput.ts are
 * re-exported unchanged — they are pure state logic, independent of rendering.
 */

import type { GrafPort } from "@mockintosh/quickdraw";
import {
  SetPort,
  MoveTo,
  TextFont,
  TextFace,
  DrawString,
  ClipRect,
  GetClip,
  SetClip,
  makeRect,
  NewRgn,
  DisposeRgn,
} from "@mockintosh/quickdraw";
import { GetFNum, FMTextWidth } from "./FontManager";
import { getLineHeight, type FontName } from "../canvas/fontAdapter";
import { qdFillRect, qdDrawRect, qdDrawVLine } from "../canvas/qdDraw";
import { BLACK, WHITE } from "../canvas/BitCanvas";

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

const CHIKAREGO = "ChiKareGo" as FontName;

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
  SetPort(port);
  (port as GrafPort & { txColor?: number }).txColor = BLACK;
  const savedClip = NewRgn();
  GetClip(savedClip);
  ClipRect(makeRect(y, x, y + height, x + width));

  qdDrawRect(port, x, y, width, height, BLACK);
  qdFillRect(port, x + 1, y + 1, width - 2, height - 2, WHITE);

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

  TextFont(GetFNum(CHIKAREGO));
  TextFace(0);

  if (state.focused && hasSel) {
    const selStartX =
      textX + FMTextWidth(state.value.substring(0, lo), CHIKAREGO);
    const selEndX =
      textX + FMTextWidth(state.value.substring(0, hi), CHIKAREGO);
    qdFillRect(port, selStartX, y + 2, selEndX - selStartX, height - 4, BLACK);

    if (lo > 0) {
      MoveTo(textX, textY);
      DrawString(state.value.substring(0, lo));
    }
    (port as GrafPort & { txColor?: number }).txColor = WHITE;
    MoveTo(selStartX, textY);
    DrawString(state.value.substring(lo, hi));
    (port as GrafPort & { txColor?: number }).txColor = BLACK;
    if (hi < state.value.length) {
      MoveTo(selEndX, textY);
      DrawString(state.value.substring(hi));
    }
  } else {
    MoveTo(textX, textY);
    DrawString(state.value);

    const cursorPos = state.cursorPos;
    if (state.focused && isCursorVisible()) {
      const beforeCursor = state.value.substring(0, cursorPos);
      const cx = textX + FMTextWidth(beforeCursor, CHIKAREGO);
      qdDrawVLine(port, cx, y + 2, height - 4, BLACK);
    }
  }

  SetClip(savedClip);
  DisposeRgn(savedClip);
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

  SetPort(port);
  TextFont(GetFNum(font));
  TextFace(0);
  if (color === WHITE) {
    (port as GrafPort & { txColor?: number }).txColor = WHITE;
  }

  const scrollOffset = opts.scrollOffset ?? 0;
  const viewBottom = scrollOffset + (opts.viewHeight ?? Infinity);

  for (let i = 0; i < lines.length; i++) {
    const ly = opts.y + i * lineH;
    if (ly + lineH <= scrollOffset || ly >= viewBottom) continue;
    if (!lines[i]) continue;
    const drawY = ly - scrollOffset;
    MoveTo(opts.x, drawY);
    DrawString(lines[i]);
  }

  if (color === WHITE) {
    (port as GrafPort & { txColor?: number }).txColor = BLACK;
  }
  return totalHeight;
}
