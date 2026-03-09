/**
 * Counter — The simplest possible Mockintosh app.
 * Demonstrates: useState, drawText, NewControl + DrawControls, sprites.
 */
import {
  App,
  AppBuilder,
  WindowContext,
  AppProps,
  Sprite,
  fromGrid,
  makeRect,
  BLACK,
  WHITE,
} from "@mockintosh/sdk";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../../../lib/toolbox/ControlManager";

const ICON = fromGrid(32, 32, [
  "................................",
  ".......########.................",
  "......##########................",
  ".....############...............",
  "....##############..............",
  "...################.............",
  "...################.............",
  "...####..####..####.............",
  "...####..####..####.............",
  "...################.............",
  "...################.............",
  "...################.............",
  "...####.########.####...........",
  "...#####.######.#####...........",
  "....######.##.######............",
  ".....################...........",
  "......##############............",
  ".......############.............",
  "........##########..............",
  ".........########...............",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
]);

export const sprites: Record<string, Sprite> = {
  "counter/icon": ICON,
};

const CounterApp: App = {
  id: "counter",
  title: "Counter",
  icon: "counter/icon",
  defaultSize: { width: 140, height: 100 },

  render(app: AppBuilder, ctx: WindowContext, props: AppProps) {
    const [count, setCount] = app.useState(0);
    const controlsCreatedRef = app.useRef(false);

    ctx.clear(WHITE);

    ctx.drawText("Counter", ctx.width / 2 - 22, 8, {
      font: "menu",
      color: BLACK,
    });

    ctx.drawHLine(0, 24, ctx.width, BLACK);

    ctx.drawText(String(count), ctx.width / 2 - 10, 42, {
      font: "menu",
      color: BLACK,
    });

    const win = ctx.getWindow();
    if (win !== null) {
      if (!controlsCreatedRef.current) {
        const decHandle = NewControl(
          win,
          makeRect(65, 10, 85, 46),
          "- 1",
          true,
          0,
          0,
          1,
          0,
          0
        );
        decHandle.ref.contrlAction = (_c, partCode) => {
          if (partCode === inButton) setCount((c) => c - 1);
        };
        const incHandle = NewControl(
          win,
          makeRect(65, ctx.width - 50, 85, ctx.width - 10),
          "+ 1",
          true,
          0,
          0,
          1,
          0,
          0
        );
        incHandle.ref.contrlAction = (_c, partCode) => {
          if (partCode === inButton) setCount((c) => c + 1);
        };
        controlsCreatedRef.current = true;
      }
      DrawControls(win, ctx.port);
    }
  },
};

export default CounterApp;
