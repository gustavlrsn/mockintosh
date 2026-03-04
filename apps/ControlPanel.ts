import { NativeApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";
import { OSEvent } from "../lib/canvas/EventManager";

const SIDEBAR_WIDTH = 64;

export const ControlPanelApp: NativeApp = {
  id: "control_panel",
  title: "Control Panel",
  icon: "/icons/computer.png",
  defaultSize: { width: 320, height: 200 },
  scrollable: false,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const sprites: SpriteRegistry = props._sprites;
    const [selectedPane] = app.useState("General");

    ctx.clear(WHITE);

    // Sidebar
    ctx.drawVLine(SIDEBAR_WIDTH, 0, ctx.height, BLACK);
    ctx.drawVLine(SIDEBAR_WIDTH + 1, 0, ctx.height, BLACK);

    const computerSprite = sprites?.get("/icons/computer.png");
    if (computerSprite) {
      const ix = Math.floor((SIDEBAR_WIDTH - 32) / 2);
      if (selectedPane === "General") {
        ctx.blitInverted(computerSprite, ix, 8);
      } else {
        ctx.blit(computerSprite, ix, 8);
      }
    }
    const labelColor = selectedPane === "General" ? WHITE : BLACK;
    const labelBg = selectedPane === "General" ? BLACK : null;
    ctx.drawText("General", 4, 44, {
      font: "Geneva9",
      color: labelColor,
      bg: labelBg as any,
      width: SIDEBAR_WIDTH - 8,
      align: "center",
    });

    const contentX = SIDEBAR_WIDTH + 8;

    ctx.drawText("Desktop pattern", contentX, 8, {
      font: "Geneva9",
      color: BLACK,
    });

    const patternX = contentX;
    const patternY = 24;
    const scale = 4;
    const gutter = 1;
    const patternSize = 8 * scale + 7 * gutter;

    ctx.drawRect(patternX, patternY, patternSize + 2, patternSize + 2, BLACK);

    for (let py = 0; py < 8; py++) {
      for (let px = 0; px < 8; px++) {
        const isBlack = (px + py) % 2 === 0;
        const rx = patternX + 1 + px * (scale + gutter);
        const ry = patternY + 1 + py * (scale + gutter);
        ctx.fillRect(rx, ry, scale, scale, isBlack ? BLACK : WHITE);
      }
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any) {
    if (event.type === "mouseDown") {
      const [, setSelectedPane] = app.useState("General");
      if (event.x! < SIDEBAR_WIDTH) {
        setSelectedPane("General");
      }
    }
  },
};
