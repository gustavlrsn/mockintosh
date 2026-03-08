/**
 * ControlManager.ts — Macintosh Toolbox Control Manager
 *
 * Draws buttons, checkboxes, and radio buttons using QuickDraw GrafPort
 * primitives. Each draw function returns a bounding Rect for event dispatch.
 *
 * Original Mac Control Manager routines mapped:
 *   DrawControl  → drawButton, drawCheckbox, drawRadioButton
 *   (scrollbar drawing remains in WindowManager for now)
 */

import type { GrafPort } from "@mockintosh/quickdraw";
import { measureText, getLineHeight } from "../canvas/fontAdapter";
import {
  qdFillRect,
  qdDrawRect,
  qdFillPattern,
  qdFillRoundRect,
  qdFrameRoundRect,
  qdDrawHLine,
  qdDrawVLine,
  qdSetPixel,
  qdDrawText,
} from "../canvas/qdDraw";
import { BLACK, WHITE } from "../canvas/BitCanvas";

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface ButtonDef {
  kind?: "button";
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  disabled?: boolean;
  active?: boolean;
  default?: boolean;
}

export interface CheckboxDef {
  kind: "checkbox";
  x: number;
  y: number;
  label: string;
  checked: boolean;
  disabled?: boolean;
}

export interface RadioButtonDef {
  kind: "radio";
  x: number;
  y: number;
  label: string;
  selected: boolean;
  disabled?: boolean;
}

export type ControlDef = ButtonDef | CheckboxDef | RadioButtonDef;

export interface ControlRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// -------------------------------------------------------------------------
// Internal helpers
// -------------------------------------------------------------------------

const BTN_OVAL_DIAMETER = 10;
const DEFAULT_OUTLINE_INSET = 4;
const DEFAULT_OUTLINE_PEN = 3;
const DEFAULT_OUTLINE_OVAL = 16;
const CHECKBOX_SIZE = 12;
const RADIO_SIZE = 12;
const CONTROL_TEXT_GAP = 4;

// -------------------------------------------------------------------------
// DrawControl — Button
// -------------------------------------------------------------------------

export function drawButton(port: GrafPort, btn: ButtonDef): ControlRect {
  const h = btn.height ?? 20;
  const textW = measureText(btn.label, "ChiKareGo");
  const w = btn.width ?? textW + 20;
  const { x, y } = btn;
  const isDefault = btn.default === true;

  if (isDefault) {
    const pr = port.portRect;
    const ox = Math.max(pr.left, x - DEFAULT_OUTLINE_INSET);
    const oy = Math.max(pr.top, y - DEFAULT_OUTLINE_INSET);
    const ox2 = Math.min(pr.right, x + w + DEFAULT_OUTLINE_INSET);
    const oy2 = Math.min(pr.bottom, y + h + DEFAULT_OUTLINE_INSET);
    const ow = ox2 - ox;
    const oh = oy2 - oy;
    if (ow > 0 && oh > 0) {
      qdFrameRoundRect(
        port,
        ox,
        oy,
        ow,
        oh,
        DEFAULT_OUTLINE_OVAL,
        DEFAULT_OUTLINE_OVAL,
        DEFAULT_OUTLINE_PEN,
        BLACK
      );
    }
  }

  qdFrameRoundRect(
    port,
    x,
    y,
    w,
    h,
    BTN_OVAL_DIAMETER,
    BTN_OVAL_DIAMETER,
    1,
    BLACK
  );

  const inset = 1;
  const innerW = w - 2;
  const innerH = h - 2;
  const lineHeight = getLineHeight("ChiKareGo");
  const tx = x + inset + Math.floor((innerW - textW) / 2);
  const ty = y + inset + Math.max(0, Math.floor((innerH - lineHeight) / 2));

  if (btn.active) {
    qdFillRoundRect(
      port,
      x,
      y,
      w,
      h,
      BTN_OVAL_DIAMETER,
      BTN_OVAL_DIAMETER,
      BLACK
    );
  }

  qdDrawText(port, btn.label, tx, ty, btn.active ? WHITE : BLACK);

  if (btn.disabled) {
    qdFillPattern(port, x + inset, y + inset, innerW, innerH, "gray50");
  }

  if (isDefault) {
    return {
      x: x - DEFAULT_OUTLINE_INSET,
      y: y - DEFAULT_OUTLINE_INSET,
      w: w + DEFAULT_OUTLINE_INSET * 2,
      h: h + DEFAULT_OUTLINE_INSET * 2,
    };
  }
  return { x, y, w, h };
}

// -------------------------------------------------------------------------
// DrawControl — Checkbox (12×12 box with X when checked)
// -------------------------------------------------------------------------

export function drawCheckbox(port: GrafPort, def: CheckboxDef): ControlRect {
  const { x, y, label, checked, disabled } = def;
  const lineH = getLineHeight("ChiKareGo");
  const boxY = y + Math.max(0, Math.floor((lineH - CHECKBOX_SIZE) / 2));

  qdDrawRect(port, x, boxY, CHECKBOX_SIZE, CHECKBOX_SIZE, BLACK);
  qdFillRect(
    port,
    x + 1,
    boxY + 1,
    CHECKBOX_SIZE - 2,
    CHECKBOX_SIZE - 2,
    WHITE
  );

  if (checked) {
    // Draw an X inside the box
    for (let i = 2; i < CHECKBOX_SIZE - 2; i++) {
      qdSetPixel(port, x + i, boxY + i, BLACK);
      qdSetPixel(port, x + CHECKBOX_SIZE - 1 - i, boxY + i, BLACK);
    }
  }

  const textX = x + CHECKBOX_SIZE + CONTROL_TEXT_GAP;
  qdDrawText(port, label, textX, y, BLACK);

  if (disabled) {
    const totalW =
      CHECKBOX_SIZE + CONTROL_TEXT_GAP + measureText(label, "ChiKareGo");
    qdFillPattern(port, x, y, totalW, lineH, "gray50");
  }

  const totalW =
    CHECKBOX_SIZE + CONTROL_TEXT_GAP + measureText(label, "ChiKareGo");
  return { x, y, w: totalW, h: lineH };
}

// -------------------------------------------------------------------------
// DrawControl — Radio Button (12×12 circle with dot when selected)
// -------------------------------------------------------------------------

export function drawRadioButton(
  port: GrafPort,
  def: RadioButtonDef
): ControlRect {
  const { x, y, label, selected, disabled } = def;
  const lineH = getLineHeight("ChiKareGo");
  const circY = y + Math.max(0, Math.floor((lineH - RADIO_SIZE) / 2));
  const cx = x + Math.floor(RADIO_SIZE / 2);
  const cy = circY + Math.floor(RADIO_SIZE / 2);
  const r = Math.floor(RADIO_SIZE / 2);

  // Draw circle outline using midpoint circle algorithm
  _drawCircleOutline(port, cx, cy, r);

  if (selected) {
    // Fill a smaller circle inside
    _fillCircle(port, cx, cy, r - 3);
  }

  const textX = x + RADIO_SIZE + CONTROL_TEXT_GAP;
  qdDrawText(port, label, textX, y, BLACK);

  if (disabled) {
    const totalW =
      RADIO_SIZE + CONTROL_TEXT_GAP + measureText(label, "ChiKareGo");
    qdFillPattern(port, x, y, totalW, lineH, "gray50");
  }

  const totalW =
    RADIO_SIZE + CONTROL_TEXT_GAP + measureText(label, "ChiKareGo");
  return { x, y, w: totalW, h: lineH };
}

// -------------------------------------------------------------------------
// DrawControl — Unified dispatcher (matches original Mac DrawControl)
// -------------------------------------------------------------------------

export function DrawControl(port: GrafPort, def: ControlDef): ControlRect {
  const kind = (def as any).kind;
  if (kind === "checkbox") return drawCheckbox(port, def as CheckboxDef);
  if (kind === "radio") return drawRadioButton(port, def as RadioButtonDef);
  return drawButton(port, def as ButtonDef);
}

// -------------------------------------------------------------------------
// Circle drawing helpers (midpoint circle algorithm)
// -------------------------------------------------------------------------

function _drawCircleOutline(
  port: GrafPort,
  cx: number,
  cy: number,
  r: number
): void {
  let x = r;
  let y = 0;
  let d = 1 - r;
  _plotCirclePoints(port, cx, cy, x, y);
  while (x > y) {
    y++;
    if (d <= 0) {
      d += 2 * y + 1;
    } else {
      x--;
      d += 2 * (y - x) + 1;
    }
    _plotCirclePoints(port, cx, cy, x, y);
  }
}

function _plotCirclePoints(
  port: GrafPort,
  cx: number,
  cy: number,
  x: number,
  y: number
): void {
  qdSetPixel(port, cx + x, cy + y, BLACK);
  qdSetPixel(port, cx - x, cy + y, BLACK);
  qdSetPixel(port, cx + x, cy - y, BLACK);
  qdSetPixel(port, cx - x, cy - y, BLACK);
  qdSetPixel(port, cx + y, cy + x, BLACK);
  qdSetPixel(port, cx - y, cy + x, BLACK);
  qdSetPixel(port, cx + y, cy - x, BLACK);
  qdSetPixel(port, cx - y, cy - x, BLACK);
}

function _fillCircle(port: GrafPort, cx: number, cy: number, r: number): void {
  for (let dy = -r; dy <= r; dy++) {
    const halfW = Math.floor(Math.sqrt(r * r - dy * dy));
    for (let dx = -halfW; dx <= halfW; dx++) {
      qdSetPixel(port, cx + dx, cy + dy, BLACK);
    }
  }
}

// Legacy alias for backward compatibility with AppContext imports
export { drawButton as drawControl, type ButtonDef as ControlDef_Legacy };
