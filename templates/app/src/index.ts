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
  "..############################..",
  "..#..........................#..",
  "..#..........................#..",
  "..#..........................#..",
  "..#.......########.........#..",
  "..#......##########........#..",
  "..#.....############.......#..",
  "..#....##............##....#..",
  "..#....##............##....#..",
  "..#....##............##....#..",
  "..#....##............##....#..",
  "..#....##............##....#..",
  "..#....##............##....#..",
  "..#.....############.......#..",
  "..#......##########........#..",
  "..#.......########.........#..",
  "..#..........................#..",
  "..#..........................#..",
  "..############################..",
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
  "myapp/icon": ICON,
};

const MyApp: App = {
  id: "myapp",
  title: "My App",
  icon: "myapp/icon",
  defaultSize: { width: 200, height: 150 },

  render(app: AppBuilder, ctx: WindowContext, props: AppProps) {
    const [count, setCount] = app.useState(0);
    const controlsCreatedRef = app.useRef(false);

    ctx.clear(WHITE);

    ctx.drawText("My App", ctx.width / 2 - 18, 8, {
      font: "menu",
      color: BLACK,
    });

    ctx.drawHLine(0, 24, ctx.width, BLACK);

    ctx.drawText(`Count: ${count}`, 10, 40, {
      font: "body",
      color: BLACK,
    });

    const win = ctx.getWindow();
    if (win !== null) {
      if (!controlsCreatedRef.current) {
        const incHandle = NewControl(
          win,
          makeRect(60, 10, 80, 46),
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
        const resetHandle = NewControl(
          win,
          makeRect(60, 60, 80, 104),
          "Reset",
          true,
          0,
          0,
          1,
          0,
          0
        );
        resetHandle.ref.contrlAction = (_c, partCode) => {
          if (partCode === inButton) setCount(0);
        };
        controlsCreatedRef.current = true;
      }
      DrawControls(win, ctx.port);
    }
  },
};

export default MyApp;
