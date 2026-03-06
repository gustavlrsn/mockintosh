import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { measureText } from "../lib/canvas/fontAdapter";
import { OSEvent } from "../lib/canvas/EventManager";
import { getWrappedLines } from "../lib/canvas/ui/TextBlock";
import {
  TextInputState,
  createTextInputState,
  handleTextInputKey,
  handleTextInputClick,
  handleTextInputDoubleClick,
} from "../lib/canvas/ui/TextInput";

const DIALOG_PADDING = 16;
const LINE_HEIGHT = 16;
const INPUT_H = 16;
const BUTTON_H = 24;

export interface DialogAppProps {
  message: string;
  buttons: string[];
  showInput?: boolean;
  inputDefault?: string;
  _resolve: (val: string | null) => void;
}

/**
 * Compute the dialog window dimensions from message/options.
 * Used by the caller to set the window size at open time.
 */
export function computeDialogSize(
  message: string,
  showInput?: boolean
): { width: number; height: number } {
  const width = 260;
  const innerW = width - DIALOG_PADDING * 2 - 8;
  const lines = getWrappedLines(message, innerW, "ChiKareGo");
  const textH = lines.length * LINE_HEIGHT;
  const inputH = showInput ? INPUT_H + 8 : 0;
  const height =
    DIALOG_PADDING + textH + inputH + 8 + BUTTON_H + DIALOG_PADDING;
  return { width, height };
}

export const DialogApp: SystemApp = {
  id: "__dialog__",
  title: "",
  icon: "icon/computer",
  defaultSize: { width: 260, height: 120 },
  scrollable: false,
  resizable: false,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const { message, buttons, showInput } = props as DialogAppProps;
    const [inputState] = app.useState<TextInputState>(
      createTextInputState(props.inputDefault ?? "")
    );
    const [activeButton] = app.useState<number | null>(null);
    const isInitRef = app.useRef(false);

    if (!isInitRef.current) {
      isInitRef.current = true;
      inputState.focused = true;
      inputState.selectionStart = 0;
      inputState.selectionEnd = inputState.value.length;
      inputState.cursorPos = inputState.value.length;
    }

    const w = ctx.width;
    const h = ctx.height;

    ctx.clear(WHITE);

    // Outer border
    ctx.drawRect(-1, -1, w + 2, h + 2, BLACK);
    // Inner double border
    ctx.drawRect(1, 1, w - 2, h - 2, BLACK);
    ctx.drawRect(2, 2, w - 4, h - 4, BLACK);

    const innerW = w - DIALOG_PADDING * 2 - 8;
    const messageLines = getWrappedLines(message, innerW, "ChiKareGo");

    let ty = DIALOG_PADDING;
    for (const line of messageLines) {
      ctx.drawText(line, DIALOG_PADDING, ty, {
        font: "ChiKareGo",
        color: BLACK,
      });
      ty += LINE_HEIGHT;
    }

    if (showInput) {
      ty += 4;
      const ix = DIALOG_PADDING;
      const iw = w - DIALOG_PADDING * 2;
      ctx.drawTextInput(inputState, ix, ty, iw, INPUT_H);

      ctx.hitRegion(
        `dialog-input`,
        { x: ix, y: ty, w: iw, h: INPUT_H },
        {
          onMouseDown: (lx: number) => {
            handleTextInputClick(inputState, lx, false);
          },
          onDoubleClick: (lx: number) => {
            handleTextInputDoubleClick(inputState, lx);
          },
        }
      );

      ty += INPUT_H + 4;
    }

    ty += 8;
    let bx = w - DIALOG_PADDING;
    for (let i = buttons.length - 1; i >= 0; i--) {
      const label = buttons[i];
      const bw = measureText(label, "ChiKareGo") + 24;
      bx -= bw + (i < buttons.length - 1 ? 8 : 0);
      const btnIdx = i;
      ctx.drawButton({
        x: bx,
        y: ty,
        width: bw,
        label,
        active: activeButton === btnIdx,
        id: `dialog-btn-${btnIdx}`,
        onClick: () => {
          const resolve = props._resolve as (val: string | null) => void;
          const val = showInput ? inputState.value : label;
          resolve(val);
        },
      });
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    const { buttons, showInput } = props as DialogAppProps;
    const [inputState] = app.useState<TextInputState>(
      createTextInputState(props.inputDefault ?? "")
    );
    // Skip the activeButton slot to keep hook order
    app.useState<number | null>(null);
    // Skip isInitRef
    app.useRef(false);

    if (event.type === "keyDown") {
      if (event.key === "Enter") {
        const resolve = props._resolve as (val: string | null) => void;
        const val = showInput ? inputState.value : buttons[0];
        resolve(val);
        return;
      }
      if (event.key === "Escape") {
        const resolve = props._resolve as (val: string | null) => void;
        const cancelBtn = buttons.find((b: string) => b === "Cancel");
        if (cancelBtn) {
          resolve(cancelBtn);
        }
        return;
      }
      if (showInput) {
        handleTextInputKey(
          inputState,
          event.key!,
          event.code ?? "",
          event.shiftKey ?? false,
          event.metaKey ?? false,
          event.ctrlKey ?? false
        );
      }
    }
  },
};
