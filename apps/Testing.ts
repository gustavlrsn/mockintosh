import { SystemApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { makeRect } from "@mockintosh/quickdraw";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../lib/toolbox/ControlManager";
import { measureText } from "../lib/canvas/fontAdapter";

const PADDING = 16;
const BUTTON_H = 24;
const BUTTON_LABEL = "Increment";

export const TestingApp: SystemApp = {
  id: "testing",
  title: "Testing",
  icon: "icon/computer",
  defaultSize: { width: 260, height: 120 },
  scrollable: false,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const [count, setCount] = app.useState(0);
    const controlsCreatedRef = app.useRef(false);

    ctx.clear(WHITE);

    const w = ctx.width;
    const h = ctx.height;

    // "Current count: {count}"
    const countText = `Current count: ${count}`;
    ctx.drawText(countText, PADDING, PADDING, {
      font: "Geneva9",
      color: BLACK,
    });

    const win = ctx.getWindow();
    if (win === null) {
      throw new Error("Testing app requires a window context");
    }

    if (!controlsCreatedRef.current) {
      // Clear any stale controls from a previous window instance (e.g. after close/reopen)
      win.controlList.length = 0;
      const buttonW = measureText(BUTTON_LABEL, "ChiKareGo") + 24;
      const buttonX = Math.floor((w - buttonW) / 2);
      const buttonY = h - PADDING - BUTTON_H;
      const boundsRect = makeRect(
        buttonY,
        buttonX,
        buttonY + BUTTON_H,
        buttonX + buttonW
      );
      const handle = NewControl(
        win,
        boundsRect,
        BUTTON_LABEL,
        true,
        0,
        0,
        1,
        0
      );
      handle.ref.contrlData = { default: true };
      handle.ref.contrlAction = (_c, partCode) => {
        if (partCode === inButton) {
          setCount((prev: number) => prev + 1);
        }
      };
      controlsCreatedRef.current = true;
    }
    DrawControls(win, ctx.port);
  },
};
