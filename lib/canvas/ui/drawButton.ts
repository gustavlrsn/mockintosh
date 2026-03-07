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
  /** Default (primary) button: double border (black, white gap, black) per classic Mac. */
  default?: boolean;
}

/**
 * Draw the classic Mac 1px rounded button border (from reference: cancel-button-example.png).
 * Corner pattern: (1,1), (2,1), (1,2) and symmetric; straight edges start at 3 from corner.
 */
function drawClassicButtonBorder1px(
  canvas: BitCanvas,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  if (w < 6 || h < 6) return;
  canvas.drawHLine(x + 3, y, w - 6, color);
  canvas.drawHLine(x + 3, y + h - 1, w - 6, color);
  canvas.drawVLine(x, y + 3, h - 6, color);
  canvas.drawVLine(x + w - 1, y + 3, h - 6, color);
  canvas.setPixel(x + 1, y + 1, color);
  canvas.setPixel(x + 2, y + 1, color);
  canvas.setPixel(x + 1, y + 2, color);
  canvas.setPixel(x + w - 2, y + 1, color);
  canvas.setPixel(x + w - 3, y + 1, color);
  canvas.setPixel(x + w - 2, y + 2, color);
  canvas.setPixel(x + 1, y + h - 2, color);
  canvas.setPixel(x + 2, y + h - 2, color);
  canvas.setPixel(x + 1, y + h - 3, color);
  canvas.setPixel(x + w - 2, y + h - 2, color);
  canvas.setPixel(x + w - 3, y + h - 2, color);
  canvas.setPixel(x + w - 2, y + h - 3, color);
}

/** Outline = 1px gap + 3px black, so 4px outside inner button on each side. */
const DEFAULT_OUTLINE_INSET = 4;
/** Default button: inner punch radius for 3px ring (rounded inner edge of ring). */
const DEFAULT_OUTLINE_INNER_R = 4;

/**
 * Mental model for the default button outline:
 *
 * 1. Full black rect (ox, oy, ow, oh) — the entire outline area is black.
 * 2. White "punch-out" — we fill a ROUNDED RECT (ox+3, oy+3, ow-6, oh-6) with WHITE on top.
 *    The BOUNDARY of this white shape is where black (ring) meets white (gap + inner area).
 *    That boundary should be CURVED at the corners (quarter-circles, radius DEFAULT_OUTLINE_INNER_R).
 *    If the punch has sharp corners, either fillRoundRect is falling back to fillRect (r=0)
 *    or the corner "inside" test is too strict.
 * 3. Outer corner erasures — small white rects to create the stepped 5→3→2→1→1 outer corners.
 *
 * So: "inner corner of the black outline" = corner of the white punch-out = drawn by fillRoundRect.
 */
function drawDefaultOutline3px(
  canvas: BitCanvas,
  ox: number,
  oy: number,
  ow: number,
  oh: number
): void {
  canvas.fillRect(ox, oy, ow, oh, BLACK);
  canvas.fillRoundRect(
    ox + 3,
    oy + 3,
    ow - 6,
    oh - 6,
    DEFAULT_OUTLINE_INNER_R,
    WHITE
  );
  canvas.fillRect(ox, oy, 5, 1, WHITE);
  canvas.fillRect(ox, oy + 1, 3, 1, WHITE);
  canvas.fillRect(ox, oy + 2, 2, 1, WHITE);
  canvas.fillRect(ox, oy + 3, 1, 1, WHITE);
  canvas.fillRect(ox, oy + 4, 1, 1, WHITE);
  canvas.fillRect(ox + ow - 5, oy, 5, 1, WHITE);
  canvas.fillRect(ox + ow - 3, oy + 1, 3, 1, WHITE);
  canvas.fillRect(ox + ow - 2, oy + 2, 2, 1, WHITE);
  canvas.fillRect(ox + ow - 1, oy + 3, 1, 1, WHITE);
  canvas.fillRect(ox + ow - 1, oy + 4, 1, 1, WHITE);
  canvas.fillRect(ox, oy + oh - 5, 1, 1, WHITE);
  canvas.fillRect(ox, oy + oh - 4, 1, 1, WHITE);
  canvas.fillRect(ox, oy + oh - 3, 2, 1, WHITE);
  canvas.fillRect(ox, oy + oh - 2, 3, 1, WHITE);
  canvas.fillRect(ox, oy + oh - 1, 5, 1, WHITE);
  canvas.fillRect(ox + ow - 1, oy + oh - 5, 1, 1, WHITE);
  canvas.fillRect(ox + ow - 1, oy + oh - 4, 1, 1, WHITE);
  canvas.fillRect(ox + ow - 2, oy + oh - 3, 2, 1, WHITE);
  canvas.fillRect(ox + ow - 3, oy + oh - 2, 3, 1, WHITE);
  canvas.fillRect(ox + ow - 5, oy + oh - 1, 5, 1, WHITE);
}

/**
 * Draw a classic Mac button to match reference PNGs (cancel-button-example, ok-button-example).
 * Normal: 1px border (exact corner pattern), white fill.
 * Default: inner button same size as normal, then 1px white gap + 3px black outline with stepped/bracket corners.
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
    drawDefaultOutline3px(canvas, ox, oy, ow, oh);
    canvas.fillRect(x + 1, y + 1, w - 2, h - 2, WHITE);
    drawClassicButtonBorder1px(canvas, x, y, w, h, BLACK);
  } else {
    canvas.fillRect(x + 1, y + 1, w - 2, h - 2, WHITE);
    drawClassicButtonBorder1px(canvas, x, y, w, h, BLACK);
  }

  const inset = 1;
  const innerW = w - 2;
  const innerH = h - 2;
  const lineHeight = getLineHeight("ChiKareGo");
  const tx = x + inset + Math.floor((innerW - textW) / 2);
  const ty = y + inset + Math.max(0, Math.floor((innerH - lineHeight) / 2));
  drawBitmapText(canvas, btn.label, tx, ty, {
    font: "ChiKareGo",
    color: BLACK,
    height: lineHeight,
  });

  const invX = x + inset;
  const invY = y + inset;
  const invW = innerW;
  const invH = innerH;
  if (btn.active) {
    canvas.invertRect(invX, invY, invW, invH);
  }

  if (btn.disabled) {
    canvas.fillPattern(invX, invY, invW, invH, "gray50");
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
