import { NativeApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";
import { measureText } from "../lib/canvas/fontAdapter";
import { OSEvent } from "../lib/canvas/EventManager";

const ICON_SIZE = 32;
const ICON_CELL_W = 80;
const ICON_CELL_H = 56;

export const FinderApp: NativeApp = {
  id: "finder",
  title: "Finder",
  icon: "/icons/folder.png",
  defaultSize: { width: 256, height: 180 },
  scrollable: true,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const icons: any[] = props.icons ?? [];
    const [selected, setSelected] = app.useState<number | null>(null);
    const sprites: SpriteRegistry = props._sprites;

    ctx.clear(WHITE);

    const padding = 16;
    const cols = Math.max(1, Math.floor((ctx.width - padding) / ICON_CELL_W));

    for (let i = 0; i < icons.length; i++) {
      const icon = icons[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = padding + col * ICON_CELL_W;
      const cy = padding + row * ICON_CELL_H;

      const sprite = sprites?.get(icon.img);
      if (sprite) {
        const ix = cx + Math.floor((ICON_CELL_W - ICON_SIZE) / 2);
        if (selected === i) {
          ctx.blitInverted(sprite, ix, cy);
        } else {
          ctx.blit(sprite, ix, cy);
        }
      }

      const textW = measureText(icon.title, "Geneva9");
      const lx = cx + Math.floor((ICON_CELL_W - textW) / 2) - 2;
      const ly = cy + ICON_SIZE + 2;

      if (selected === i) {
        ctx.drawText(icon.title, lx, ly, {
          font: "Geneva9",
          color: WHITE,
          bg: BLACK,
          width: textW + 4,
          align: "center",
        });
      } else {
        ctx.drawText(icon.title, lx, ly, {
          font: "Geneva9",
          color: BLACK,
          width: textW + 4,
          align: "center",
        });
      }
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    const icons: any[] = props.icons ?? [];
    if (event.type === "mouseDown") {
      const [, setSelected] = app.useState<number | null>(null);
      const padding = 16;
      const cols = Math.max(
        1,
        Math.floor((size.width - padding) / ICON_CELL_W)
      );
      for (let i = 0; i < icons.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = padding + col * ICON_CELL_W;
        const cy = padding + row * ICON_CELL_H;
        if (
          event.x! >= cx &&
          event.x! < cx + ICON_CELL_W &&
          event.y! >= cy &&
          event.y! < cy + ICON_CELL_H
        ) {
          setSelected(i);
          return;
        }
      }
      setSelected(null);
    }

    if (event.type === "doubleClick") {
      const [selected] = app.useState<number | null>(null);
      if (selected !== null && selected < icons.length) {
        const icon = icons[selected];
        const openWindow = props._openWindow;
        if (openWindow) {
          openWindow(icon.type, icon.title, icon.payload, icon.defaultPosition);
        }
      }
    }
  },

  getContentHeight(app: AppBuilder, props: any, size: WindowSize): number {
    const icons: any[] = props.icons ?? [];
    const padding = 16;
    const cols = Math.max(1, Math.floor((size.width - padding) / ICON_CELL_W));
    const rows = Math.ceil(icons.length / cols);
    return 16 + rows * ICON_CELL_H + 16;
  },
};
