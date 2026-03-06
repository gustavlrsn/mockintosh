/**
 * Image Viewer — An advanced Mockintosh app.
 * Demonstrates: sprites, dithering, patterns, menubar, resizable windows,
 * hit regions, useMemo.
 */
import {
  App,
  AppBuilder,
  AppContext,
  AppProps,
  Sprite,
  fromGrid,
  OSEvent,
  WindowSize,
  MenubarDefinition,
  BLACK,
  WHITE,
} from "@mockintosh/sdk";

const ICON = fromGrid(32, 32, [
  "................................",
  "..############################..",
  "..#..........................#..",
  "..#..........................#..",
  "..#....####..................#..",
  "..#...######.................#..",
  "..#...######.................#..",
  "..#....####..................#..",
  "..#..........................#..",
  "..#..........................#..",
  "..#..........................#..",
  "..#..........##..............#..",
  "..#.........####.............#..",
  "..#........######............#..",
  "..#.......########...........#..",
  "..#......##########..........#..",
  "..#.....############.........#..",
  "..#....##############........#..",
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
  "image-viewer/icon": ICON,
};

type FillMode = "fit" | "tile" | "center";

const ImageViewerApp: App = {
  id: "image-viewer",
  title: "Image Viewer",
  icon: "image-viewer/icon",
  defaultSize: { width: 280, height: 220 },
  resizable: true,
  minSize: { width: 120, height: 80 },

  render(app: AppBuilder, ctx: AppContext, props: AppProps) {
    const [fillMode, setFillMode] = app.useState<FillMode>("fit");
    const [showBorder, setShowBorder] = app.useState(true);

    ctx.clear(WHITE);

    ctx.fillPattern(0, 0, ctx.width, ctx.height, "checkers");

    const icon = props.getSprite("image-viewer/icon");
    if (icon) {
      if (fillMode === "center") {
        const cx = Math.floor((ctx.width - icon.width) / 2);
        const cy = Math.floor((ctx.height - icon.height) / 2);
        ctx.blit(icon, cx, cy);
      } else if (fillMode === "tile") {
        for (let ty = 0; ty < ctx.height; ty += icon.height) {
          for (let tx = 0; tx < ctx.width; tx += icon.width) {
            ctx.blit(icon, tx, ty);
          }
        }
      } else {
        const cx = Math.floor((ctx.width - icon.width) / 2);
        const cy = Math.floor((ctx.height - icon.height) / 2);
        ctx.blit(icon, cx, cy);
      }
    } else {
      ctx.drawText("No image loaded", ctx.width / 2 - 40, ctx.height / 2, {
        font: "Geneva9",
        color: BLACK,
      });
    }

    if (showBorder) {
      ctx.drawRect(0, 0, ctx.width, ctx.height, BLACK);
    }

    const infoText = `${ctx.width}×${ctx.height} — ${fillMode}`;
    const infoY = ctx.height - 14;
    ctx.fillRect(0, infoY, ctx.width, 14, WHITE);
    ctx.drawHLine(0, infoY, ctx.width, BLACK);
    ctx.drawText(infoText, 4, infoY + 2, { font: "Geneva9", color: BLACK });
  },

  getMenubar(app: AppBuilder, props: AppProps): MenubarDefinition[] {
    const [fillMode, setFillMode] = app.useState<FillMode>("fit");
    const [showBorder, setShowBorder] = app.useState(true);

    return [
      {
        label: "View",
        items: [
          {
            type: "radiogroup",
            value: fillMode,
            onValueChange: (v) => setFillMode(v as FillMode),
            items: [
              { label: "Fit", value: "fit" },
              { label: "Tile", value: "tile" },
              { label: "Center", value: "center" },
            ],
          },
          { type: "separator" },
          {
            label: showBorder ? "✓ Show Border" : "  Show Border",
            onClick: () => setShowBorder(!showBorder),
          },
        ],
      },
    ];
  },
};

export default ImageViewerApp;
