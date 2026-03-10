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
import { resolveLineBox, type FontName } from "../canvas/fontAdapter";
import { qdFillRect, qdDrawRect, qdDrawVLine } from "../canvas/qdDraw";
import { BLACK, WHITE } from "../canvas/BitCanvas";
import { resolveTextColor } from "../canvas/ColorSystem";

// Re-export state management and event handling from TextInput.ts
export {
  createTextInputState,
  handleTextInputKey,
  handleTextInputPaste,
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

const BODY_FONT = "body" as FontName;

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

  TextFont(GetFNum(BODY_FONT));
  TextFace(0);

  if (state.focused && hasSel) {
    const selStartX =
      textX + FMTextWidth(state.value.substring(0, lo), BODY_FONT);
    const selEndX =
      textX + FMTextWidth(state.value.substring(0, hi), BODY_FONT);
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
      const cx = textX + FMTextWidth(beforeCursor, BODY_FONT);
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
  lineHeight?: number;
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
  const font = opts.font ?? "body";
  const color = resolveTextColor(opts.color ?? BLACK);
  const lineBox = resolveLineBox(font, {
    lineHeight: opts.lineHeight,
    lineSpacing: opts.lineSpacing,
  });
  const lineH = lineBox.lineHeight;
  const lines = _getWrappedLines(opts.text, opts.maxWidth, font);
  const totalHeight = lines.length * lineH;

  SetPort(port);
  TextFont(GetFNum(font));
  TextFace(0);
  const textPort = port as GrafPort & { txColor?: number };
  const previousColor = textPort.txColor ?? BLACK;
  textPort.txColor = color;

  const scrollOffset = opts.scrollOffset ?? 0;
  const viewBottom = scrollOffset + (opts.viewHeight ?? Infinity);

  for (let i = 0; i < lines.length; i++) {
    const ly = opts.y + i * lineH;
    if (ly + lineH <= scrollOffset || ly >= viewBottom) continue;
    if (!lines[i]) continue;
    const drawY = ly - scrollOffset + lineBox.glyphOffsetY;
    MoveTo(opts.x, drawY);
    DrawString(lines[i]);
  }

  textPort.txColor = previousColor;
  return totalHeight;
}
