/**
 * Counter — The simplest possible Mockintosh app.
 * Demonstrates: useState, drawText, drawButton, sprites.
 */
import {
  App,
  AppBuilder,
  WindowContext,
  AppProps,
  Sprite,
  fromGrid,
  BLACK,
  WHITE,
} from "@mockintosh/sdk";

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

    ctx.clear(WHITE);

    ctx.drawText("Counter", ctx.width / 2 - 22, 8, {
      font: "ChiKareGo",
      color: BLACK,
    });

    ctx.drawHLine(0, 24, ctx.width, BLACK);

    ctx.drawText(String(count), ctx.width / 2 - 10, 42, {
      font: "ChiKareGo",
      color: BLACK,
    });

    ctx.drawButton({
      x: 10,
      y: 65,
      label: "- 1",
      id: "decrement",
      onClick: () => setCount((c) => c - 1),
    });

    ctx.drawButton({
      x: ctx.width - 50,
      y: 65,
      label: "+ 1",
      id: "increment",
      onClick: () => setCount((c) => c + 1),
    });
  },
};

export default CounterApp;
