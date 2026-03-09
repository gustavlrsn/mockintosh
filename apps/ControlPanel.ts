import { SystemApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { ResourceManager } from "../lib/toolbox/ResourceManager";
import { OSEvent } from "../lib/toolbox/EventManager";
import type { ColorMode } from "../lib/canvas/ColorSystem";

const SIDEBAR_WIDTH = 64;
const MODE_BUTTON_W = 90;
const MODE_BUTTON_H = 20;

function drawModeButton(
  ctx: WindowContext,
  x: number,
  y: number,
  label: string,
  selected: boolean
): void {
  ctx.drawRect(x, y, MODE_BUTTON_W, MODE_BUTTON_H, BLACK);
  if (selected) {
    ctx.fillRect(x + 1, y + 1, MODE_BUTTON_W - 2, MODE_BUTTON_H - 2, BLACK);
  }
  ctx.drawText(label, x + 8, y + 5, {
    font: "body",
    color: selected ? WHITE : BLACK,
  });
}

export const ControlPanelApp: SystemApp = {
  id: "control_panel",
  title: "Control Panel",
  icon: "icon/computer",
  defaultSize: { width: 320, height: 200 },
  scrollable: false,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const sprites: ResourceManager = props._sprites;
    const [selectedPane] = app.useState("General");
    const colorMode: ColorMode =
      props._systemPreferences?.colorMode ?? "monochrome";

    ctx.clear(WHITE);

    // Sidebar
    ctx.drawVLine(SIDEBAR_WIDTH, 0, ctx.height, BLACK);
    ctx.drawVLine(SIDEBAR_WIDTH + 1, 0, ctx.height, BLACK);

    const computerSprite = sprites?.get("icon/computer");
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
      font: "body",
      color: labelColor,
      bg: labelBg as any,
      width: SIDEBAR_WIDTH - 8,
      align: "center",
    });

    const contentX = SIDEBAR_WIDTH + 8;

    ctx.drawText("Desktop pattern", contentX, 8, {
      font: "body",
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

    const modeLabelY = patternY + patternSize + 18;
    ctx.drawText("Color mode", contentX, modeLabelY, {
      font: "body",
      color: BLACK,
    });

    const modeButtonY = modeLabelY + 16;
    drawModeButton(
      ctx,
      contentX,
      modeButtonY,
      "monochrome",
      colorMode === "monochrome"
    );
    drawModeButton(
      ctx,
      contentX + MODE_BUTTON_W + 8,
      modeButtonY,
      "colors",
      colorMode === "colors"
    );

    ctx.hitRegion(
      "control-panel-mode-monochrome",
      { x: contentX, y: modeButtonY, w: MODE_BUTTON_W, h: MODE_BUTTON_H },
      {
        onClick: () => props._setColorMode?.("monochrome"),
      }
    );
    ctx.hitRegion(
      "control-panel-mode-colors",
      {
        x: contentX + MODE_BUTTON_W + 8,
        y: modeButtonY,
        w: MODE_BUTTON_W,
        h: MODE_BUTTON_H,
      },
      {
        onClick: () => props._setColorMode?.("colors"),
      }
    );

    const previewY = modeButtonY + MODE_BUTTON_H + 14;
    ctx.drawText("Preview", contentX, previewY, {
      font: "body",
      color: BLACK,
    });
    const swatchY = previewY + 16;
    const swatchColors = [2, 3, 4, 7, 8, 9];
    for (let i = 0; i < swatchColors.length; i++) {
      const sx = contentX + i * 18;
      ctx.fillRect(sx, swatchY, 14, 14, swatchColors[i]);
      ctx.drawRect(sx, swatchY, 14, 14, BLACK);
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
