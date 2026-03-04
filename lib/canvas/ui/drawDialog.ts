import { BitCanvas, BLACK, WHITE } from "../BitCanvas";
import { drawBitmapText, measureText } from "../fontAdapter";
import { drawButton, isInsideButton } from "./drawButton";
import { getWrappedLines } from "./TextBlock";

export interface DialogDef {
  message: string;
  buttons: { label: string; onClick: () => void }[];
  inputValue?: string;
  showInput?: boolean;
}

export interface DialogState {
  def: DialogDef | null;
  activeButton: number | null;
  inputValue: string;
  cursorVisible: boolean;
}

export function createDialogState(): DialogState {
  return { def: null, activeButton: null, inputValue: "", cursorVisible: true };
}

const DIALOG_WIDTH = 260;
const DIALOG_PADDING = 16;

export function drawDialog(
  canvas: BitCanvas,
  state: DialogState,
  screenWidth: number,
  screenHeight: number
): { buttonRects: { x: number; y: number; w: number; h: number }[] } {
  if (!state.def) return { buttonRects: [] };

  const { message, buttons, showInput } = state.def;
  const lineHeight = 16;
  const messageLines = getWrappedLines(
    message,
    DIALOG_WIDTH - DIALOG_PADDING * 2 - 8,
    "ChiKareGo"
  );
  const textH = messageLines.length * lineHeight;
  const inputH = showInput ? 20 : 0;
  const buttonH = 24;
  const innerH =
    DIALOG_PADDING +
    textH +
    (showInput ? inputH + 8 : 0) +
    8 +
    buttonH +
    DIALOG_PADDING;

  const dx = Math.floor((screenWidth - DIALOG_WIDTH) / 2);
  const dy = Math.floor((screenHeight - innerH) / 2);

  // Outer border (thin)
  canvas.fillRect(dx - 1, dy - 1, DIALOG_WIDTH + 2, innerH + 2, WHITE);
  canvas.drawRect(dx - 1, dy - 1, DIALOG_WIDTH + 2, innerH + 2, BLACK);

  // Inner border (thick)
  canvas.drawRect(dx + 1, dy + 1, DIALOG_WIDTH - 2, innerH - 2, BLACK);
  canvas.drawRect(dx + 2, dy + 2, DIALOG_WIDTH - 4, innerH - 4, BLACK);

  // Content
  canvas.fillRect(dx + 3, dy + 3, DIALOG_WIDTH - 6, innerH - 6, WHITE);

  // Message text
  let ty = dy + DIALOG_PADDING;
  for (const line of messageLines) {
    drawBitmapText(canvas, line, dx + DIALOG_PADDING, ty, {
      font: "ChiKareGo",
      color: BLACK,
    });
    ty += lineHeight;
  }

  // Input field
  if (showInput) {
    ty += 4;
    const ix = dx + DIALOG_PADDING;
    const iw = DIALOG_WIDTH - DIALOG_PADDING * 2;
    canvas.drawRect(ix, ty, iw, 16, BLACK);
    canvas.fillRect(ix + 1, ty + 1, iw - 2, 14, WHITE);
    drawBitmapText(canvas, state.inputValue, ix + 3, ty + 2, {
      font: "ChiKareGo",
      color: BLACK,
    });
    if (state.cursorVisible) {
      const cursorX = ix + 3 + measureText(state.inputValue, "ChiKareGo");
      canvas.drawVLine(cursorX, ty + 2, 12, BLACK);
    }
    ty += 20;
  }

  // Buttons
  ty += 8;
  const buttonRects: { x: number; y: number; w: number; h: number }[] = [];
  let bx = dx + DIALOG_WIDTH - DIALOG_PADDING;
  for (let i = buttons.length - 1; i >= 0; i--) {
    const bw = measureText(buttons[i].label, "ChiKareGo") + 24;
    bx -= bw + (i < buttons.length - 1 ? 8 : 0);
    const rect = drawButton(canvas, {
      x: bx,
      y: ty,
      width: bw,
      label: buttons[i].label,
      active: state.activeButton === i,
    });
    buttonRects.unshift(rect);
  }

  return { buttonRects };
}
