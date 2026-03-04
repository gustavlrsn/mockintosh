import { BitCanvas, BLACK, WHITE } from "../BitCanvas";
import { drawBitmapText, measureText } from "../fontAdapter";

export interface ButtonDef {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  disabled?: boolean;
  active?: boolean;
}

/**
 * Draw a classic Mac button. Returns the bounding rect for hit testing.
 */
export function drawButton(
  canvas: BitCanvas,
  btn: ButtonDef
): { x: number; y: number; w: number; h: number } {
  const h = btn.height ?? 20;
  const textW = measureText(btn.label, "ChiKareGo");
  const w = btn.width ?? textW + 20;
  const { x, y } = btn;

  // Shadow
  canvas.fillRect(x + 1, y + h, w, 1, BLACK);
  canvas.fillRect(x + w, y + 1, 1, h, BLACK);

  // Background
  canvas.fillRect(x, y, w, h, WHITE);
  canvas.drawRect(x, y, w, h, BLACK);

  // Label centered
  const tx = x + Math.floor((w - textW) / 2);
  const ty = y + 2;
  drawBitmapText(canvas, btn.label, tx, ty, {
    font: "ChiKareGo",
    color: BLACK,
    height: h,
  });

  if (btn.active) {
    canvas.invertRect(x, y, w, h);
  }

  if (btn.disabled) {
    canvas.fillPattern(x + 1, y + 1, w - 2, h - 2, "gray50");
  }

  return { x, y, w, h };
}

export function isInsideButton(
  rect: { x: number; y: number; w: number; h: number },
  mx: number,
  my: number
): boolean {
  return mx >= rect.x && mx < rect.x + rect.w && my >= rect.y && my < rect.y + rect.h;
}
