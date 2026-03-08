import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { measureText } from "../lib/canvas/fontAdapter";
import { makeRect } from "@mockintosh/quickdraw";
import { OSEvent } from "../lib/toolbox/EventManager";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../lib/toolbox/ControlManager";
import {
  getWrappedLines,
  TextInputState,
  createTextInputState,
  handleTextInputKey,
} from "../lib/toolbox/TextEdit";

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

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const { message, buttons, showInput } = props as DialogAppProps;
    const [inputState] = app.useState<TextInputState>(
      createTextInputState(props.inputDefault ?? "")
    );
    const isInitRef = app.useRef(false);
    const controlsCreatedRef = app.useRef(false);

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
      ctx.drawTextInput(inputState, ix, ty, iw, INPUT_H, {
        id: "dialog-input",
        onChange: () => app.scheduleRender(),
      });

      ty += INPUT_H + 4;
    }

    ty += 8;
    const win = ctx.getWindow();
    if (win === null) {
      throw new Error("Dialog requires a window context");
    }

    if (!controlsCreatedRef.current) {
      let buttonX = w - DIALOG_PADDING;
      for (let i = buttons.length - 1; i >= 0; i--) {
        const label = buttons[i];
        const bw = measureText(label, "ChiKareGo") + 24;
        buttonX -= bw + (i < buttons.length - 1 ? 12 : 0);
        const boundsRect = makeRect(ty, buttonX, ty + BUTTON_H, buttonX + bw);
        const handle = NewControl(win, boundsRect, label, true, 0, 0, 1, 0, i);
        const resolve = (props as DialogAppProps)._resolve;
        handle.ref.contrlAction = (c, partCode) => {
          if (partCode === inButton) {
            const val = showInput ? inputState.value : c.ref.contrlTitle;
            resolve(val);
          }
        };
      }
      controlsCreatedRef.current = true;
    }
    DrawControls(win, ctx.port);
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    const { buttons, showInput } = props as DialogAppProps;
    const [inputState] = app.useState<TextInputState>(
      createTextInputState(props.inputDefault ?? "")
    );
    // Skip isInitRef
    app.useRef(false);

    if (event.type === "keyDown") {
      if (event.key === "Enter") {
        const resolve = props._resolve as (val: string | null) => void;
        const defaultLabel = buttons[buttons.length - 1];
        const val = showInput ? inputState.value : defaultLabel;
        resolve(val);
        return;
      }
      if (event.key === "Escape" || (event.metaKey && event.key === ".")) {
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
