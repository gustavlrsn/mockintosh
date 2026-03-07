import { BitCanvas, BLACK, WHITE } from "../BitCanvas";
import { drawBitmapText, measureText, getLineHeight } from "../fontAdapter";

export interface ButtonDef {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  disabled?: boolean;
  active?: boolean;
  /** Default (primary) button: draws a 3px-wide RoundRect border 4px outside the normal rect. */
  default?: boolean;
}

/** Inner 1px frame: oval diameter for FrameRoundRect (e.g. 10). */
const BTN_OVAL_DIAMETER = 10;

/**
 * Default button: expand rect by 4px (InsetRect -4,-4), then 3px FrameRoundRect.
 * Outer outline uses this oval diameter (e.g. 16).
 */
const DEFAULT_OUTLINE_INSET = 4;
const DEFAULT_OUTLINE_PEN = 3;
const DEFAULT_OUTLINE_OVAL = 16;

/**
 * Draw a classic Mac button.
 *
 * Normal: 1px FrameRoundRect at button rect, oval 12×12 (BTN_OVAL_DIAMETER).
 * Default: InsetRect -4,-4 then FrameRoundRect(expandedRect, 16×16, pen 3).
 * Pressed (active): fillRoundRect inverts the interior.
 */
export function drawButton(
  canvas: BitCanvas,
  btn: ButtonDef
): { x: number; y: number; w: number; h: number } {
  const h = btn.height ?? 20;
  const textW = measureText(btn.label, "ChiKareGo");
  const w = btn.width ?? textW + 20;
  const { x, y } = btn;
  const isDefault = btn.default === true;

  if (isDefault) {
    const ox = x - DEFAULT_OUTLINE_INSET;
    const oy = y - DEFAULT_OUTLINE_INSET;
    const ow = w + DEFAULT_OUTLINE_INSET * 2;
    const oh = h + DEFAULT_OUTLINE_INSET * 2;
    canvas.frameRoundRect(
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

  // Inner 1px outline: FrameRoundRect(itemRect, 16, 16) with 1×1 pen — no InsetRect.
  canvas.frameRoundRect(
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

  // Pressed state: fill the interior black first, then label in white.
  if (btn.active) {
    canvas.fillRoundRect(x, y, w, h, BTN_OVAL_DIAMETER / 2, BLACK);
  }

  drawBitmapText(canvas, btn.label, tx, ty, {
    font: "ChiKareGo",
    color: btn.active ? WHITE : BLACK,
    height: lineHeight,
  });

  if (btn.disabled) {
    canvas.fillPattern(x + inset, y + inset, innerW, innerH, "gray50");
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

export function isInsideButton(
  rect: { x: number; y: number; w: number; h: number },
  mx: number,
  my: number
): boolean {
  return (
    mx >= rect.x && mx < rect.x + rect.w && my >= rect.y && my < rect.y + rect.h
  );
}
